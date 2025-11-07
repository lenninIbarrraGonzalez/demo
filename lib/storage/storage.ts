import type {
  LocalStorageDB,
  Taller,
  Usuario,
  Vehiculo,
  Cilindro,
  PlantillaFormulario,
  Solicitud,
  Inspeccion,
  InspeccionCilindro,
  Informe,
  Role
} from '@/types';

const STORAGE_PREFIX = 'tanquesGas';
const STORAGE_VERSION = '1.0.0';

/**
 * StorageManager - Maneja toda la persistencia en LocalStorage con aislamiento multi-tenant
 */
class StorageManager {
  private prefix: string;

  constructor(prefix: string = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  /**
   * Inicializa la base de datos si no existe
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    const existing = this.getDatabase();
    if (!existing.version) {
      const initialDB: LocalStorageDB = {
        version: STORAGE_VERSION,
        talleres: {},
        usuarios: {},
        vehiculos: {},
        cilindros: {},
        plantillasFormularios: {},
        solicitudes: {},
        inspecciones: {},
        inspeccionesCilindros: {},
        informes: {}
      };
      this.saveDatabase(initialDB);
    }
  }

  /**
   * Obtiene toda la base de datos
   */
  private getDatabase(): LocalStorageDB {
    if (typeof window === 'undefined') {
      return {
        version: STORAGE_VERSION,
        talleres: {},
        usuarios: {},
        vehiculos: {},
        cilindros: {},
        plantillasFormularios: {},
        solicitudes: {},
        inspecciones: {},
        inspeccionesCilindros: {},
        informes: {}
      };
    }

    const data = localStorage.getItem(`${this.prefix}_db`);
    if (!data) {
      return {
        version: STORAGE_VERSION,
        talleres: {},
        usuarios: {},
        vehiculos: {},
        cilindros: {},
        plantillasFormularios: {},
        solicitudes: {},
        inspecciones: {},
        inspeccionesCilindros: {},
        informes: {}
      };
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing database:', error);
      return {
        version: STORAGE_VERSION,
        talleres: {},
        usuarios: {},
        vehiculos: {},
        cilindros: {},
        plantillasFormularios: {},
        solicitudes: {},
        inspecciones: {},
        inspeccionesCilindros: {},
        informes: {}
      };
    }
  }

  /**
   * Guarda toda la base de datos
   */
  private saveDatabase(db: LocalStorageDB): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${this.prefix}_db`, JSON.stringify(db));
  }

  /**
   * Genera un ID único
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============= TALLERES =============

  getAllTalleres(): Taller[] {
    const db = this.getDatabase();
    return Object.values(db.talleres);
  }

  getTallerById(id: string): Taller | null {
    const db = this.getDatabase();
    return db.talleres[id] || null;
  }

  createTaller(taller: Omit<Taller, 'id' | 'createdAt' | 'updatedAt'>): Taller {
    const db = this.getDatabase();
    const newTaller: Taller = {
      ...taller,
      id: this.generateId('taller'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.talleres[newTaller.id] = newTaller;
    this.saveDatabase(db);
    return newTaller;
  }

  updateTaller(id: string, updates: Partial<Taller>): Taller | null {
    const db = this.getDatabase();
    const taller = db.talleres[id];
    if (!taller) return null;

    const updatedTaller = {
      ...taller,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.talleres[id] = updatedTaller;
    this.saveDatabase(db);
    return updatedTaller;
  }

  deleteTaller(id: string): boolean {
    const db = this.getDatabase();
    if (!db.talleres[id]) return false;
    delete db.talleres[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= USUARIOS =============

  getAllUsuarios(filterByRole?: Role, filterByTallerId?: string): Usuario[] {
    const db = this.getDatabase();
    let usuarios = Object.values(db.usuarios);

    if (filterByRole) {
      usuarios = usuarios.filter(u => u.role === filterByRole);
    }

    if (filterByTallerId) {
      usuarios = usuarios.filter(u => u.tallerId === filterByTallerId);
    }

    return usuarios;
  }

  getUsuarioById(id: string): Usuario | null {
    const db = this.getDatabase();
    return db.usuarios[id] || null;
  }

  getUsuarioByEmail(email: string): Usuario | null {
    const db = this.getDatabase();
    return Object.values(db.usuarios).find(u => u.email === email) || null;
  }

  createUsuario(usuario: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Usuario {
    const db = this.getDatabase();
    const newUsuario: Usuario = {
      ...usuario,
      id: this.generateId('user'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.usuarios[newUsuario.id] = newUsuario;
    this.saveDatabase(db);
    return newUsuario;
  }

  updateUsuario(id: string, updates: Partial<Usuario>): Usuario | null {
    const db = this.getDatabase();
    const usuario = db.usuarios[id];
    if (!usuario) return null;

    const updatedUsuario = {
      ...usuario,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.usuarios[id] = updatedUsuario;
    this.saveDatabase(db);
    return updatedUsuario;
  }

  deleteUsuario(id: string): boolean {
    const db = this.getDatabase();
    if (!db.usuarios[id]) return false;
    delete db.usuarios[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= VEHÍCULOS =============

  getAllVehiculos(tallerId?: string): Vehiculo[] {
    const db = this.getDatabase();
    let vehiculos = Object.values(db.vehiculos);

    if (tallerId) {
      vehiculos = vehiculos.filter(v => v.tallerId === tallerId);
    }

    return vehiculos;
  }

  getVehiculoById(id: string): Vehiculo | null {
    const db = this.getDatabase();
    return db.vehiculos[id] || null;
  }

  getVehiculoByPlaca(placa: string, tallerId?: string): Vehiculo | null {
    const db = this.getDatabase();
    let vehiculos = Object.values(db.vehiculos).filter(v =>
      v.placa.toLowerCase() === placa.toLowerCase()
    );

    if (tallerId) {
      vehiculos = vehiculos.filter(v => v.tallerId === tallerId);
    }

    return vehiculos[0] || null;
  }

  createVehiculo(vehiculo: Omit<Vehiculo, 'id' | 'createdAt' | 'updatedAt'>): Vehiculo {
    const db = this.getDatabase();
    const newVehiculo: Vehiculo = {
      ...vehiculo,
      id: this.generateId('vehiculo'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.vehiculos[newVehiculo.id] = newVehiculo;
    this.saveDatabase(db);
    return newVehiculo;
  }

  updateVehiculo(id: string, updates: Partial<Vehiculo>): Vehiculo | null {
    const db = this.getDatabase();
    const vehiculo = db.vehiculos[id];
    if (!vehiculo) return null;

    const updatedVehiculo = {
      ...vehiculo,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.vehiculos[id] = updatedVehiculo;
    this.saveDatabase(db);
    return updatedVehiculo;
  }

  deleteVehiculo(id: string): boolean {
    const db = this.getDatabase();
    if (!db.vehiculos[id]) return false;
    delete db.vehiculos[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= CILINDROS =============

  getAllCilindros(vehiculoId?: string): Cilindro[] {
    const db = this.getDatabase();
    let cilindros = Object.values(db.cilindros);

    if (vehiculoId) {
      cilindros = cilindros.filter(c => c.vehiculoId === vehiculoId);
    }

    return cilindros;
  }

  getCilindroById(id: string): Cilindro | null {
    const db = this.getDatabase();
    return db.cilindros[id] || null;
  }

  createCilindro(cilindro: Omit<Cilindro, 'id' | 'createdAt' | 'updatedAt'>): Cilindro {
    const db = this.getDatabase();
    const newCilindro: Cilindro = {
      ...cilindro,
      id: this.generateId('cilindro'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.cilindros[newCilindro.id] = newCilindro;
    this.saveDatabase(db);
    return newCilindro;
  }

  updateCilindro(id: string, updates: Partial<Cilindro>): Cilindro | null {
    const db = this.getDatabase();
    const cilindro = db.cilindros[id];
    if (!cilindro) return null;

    const updatedCilindro = {
      ...cilindro,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.cilindros[id] = updatedCilindro;
    this.saveDatabase(db);
    return updatedCilindro;
  }

  deleteCilindro(id: string): boolean {
    const db = this.getDatabase();
    if (!db.cilindros[id]) return false;
    delete db.cilindros[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= PLANTILLAS DE FORMULARIOS =============

  getAllPlantillasFormularios(activoSolo: boolean = false): PlantillaFormulario[] {
    const db = this.getDatabase();
    let plantillas = Object.values(db.plantillasFormularios);

    if (activoSolo) {
      plantillas = plantillas.filter(p => p.activo);
    }

    return plantillas;
  }

  getPlantillaFormularioById(id: string): PlantillaFormulario | null {
    const db = this.getDatabase();
    return db.plantillasFormularios[id] || null;
  }

  createPlantillaFormulario(plantilla: Omit<PlantillaFormulario, 'id' | 'createdAt' | 'updatedAt'>): PlantillaFormulario {
    const db = this.getDatabase();
    const newPlantilla: PlantillaFormulario = {
      ...plantilla,
      id: this.generateId('template'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.plantillasFormularios[newPlantilla.id] = newPlantilla;
    this.saveDatabase(db);
    return newPlantilla;
  }

  updatePlantillaFormulario(id: string, updates: Partial<PlantillaFormulario>): PlantillaFormulario | null {
    const db = this.getDatabase();
    const plantilla = db.plantillasFormularios[id];
    if (!plantilla) return null;

    const updatedPlantilla = {
      ...plantilla,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.plantillasFormularios[id] = updatedPlantilla;
    this.saveDatabase(db);
    return updatedPlantilla;
  }

  deletePlantillaFormulario(id: string): boolean {
    const db = this.getDatabase();
    if (!db.plantillasFormularios[id]) return false;
    delete db.plantillasFormularios[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= SOLICITUDES =============

  getAllSolicitudes(tallerId?: string, tecnicoId?: string): Solicitud[] {
    const db = this.getDatabase();
    let solicitudes = Object.values(db.solicitudes);

    if (tallerId) {
      solicitudes = solicitudes.filter(s => s.tallerId === tallerId);
    }

    if (tecnicoId) {
      solicitudes = solicitudes.filter(s => s.tecnicoAsignadoId === tecnicoId);
    }

    return solicitudes;
  }

  getSolicitudById(id: string): Solicitud | null {
    const db = this.getDatabase();
    return db.solicitudes[id] || null;
  }

  createSolicitud(solicitud: Omit<Solicitud, 'id' | 'createdAt' | 'updatedAt'>): Solicitud {
    const db = this.getDatabase();
    const newSolicitud: Solicitud = {
      ...solicitud,
      id: this.generateId('solicitud'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.solicitudes[newSolicitud.id] = newSolicitud;
    this.saveDatabase(db);
    return newSolicitud;
  }

  updateSolicitud(id: string, updates: Partial<Solicitud>): Solicitud | null {
    const db = this.getDatabase();
    const solicitud = db.solicitudes[id];
    if (!solicitud) return null;

    const updatedSolicitud = {
      ...solicitud,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.solicitudes[id] = updatedSolicitud;
    this.saveDatabase(db);
    return updatedSolicitud;
  }

  deleteSolicitud(id: string): boolean {
    const db = this.getDatabase();
    if (!db.solicitudes[id]) return false;
    delete db.solicitudes[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= INSPECCIONES =============

  getAllInspecciones(tecnicoId?: string, vehiculoId?: string): Inspeccion[] {
    const db = this.getDatabase();
    let inspecciones = Object.values(db.inspecciones);

    if (tecnicoId) {
      inspecciones = inspecciones.filter(i => i.tecnicoId === tecnicoId);
    }

    if (vehiculoId) {
      inspecciones = inspecciones.filter(i => i.vehiculoId === vehiculoId);
    }

    return inspecciones;
  }

  getInspeccionById(id: string): Inspeccion | null {
    const db = this.getDatabase();
    return db.inspecciones[id] || null;
  }

  getInspeccionBySolicitudId(solicitudId: string): Inspeccion | null {
    const db = this.getDatabase();
    return Object.values(db.inspecciones).find(i => i.solicitudId === solicitudId) || null;
  }

  createInspeccion(inspeccion: Omit<Inspeccion, 'id' | 'createdAt' | 'updatedAt'>): Inspeccion {
    const db = this.getDatabase();
    const newInspeccion: Inspeccion = {
      ...inspeccion,
      id: this.generateId('inspeccion'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.inspecciones[newInspeccion.id] = newInspeccion;
    this.saveDatabase(db);
    return newInspeccion;
  }

  updateInspeccion(id: string, updates: Partial<Inspeccion>): Inspeccion | null {
    const db = this.getDatabase();
    const inspeccion = db.inspecciones[id];
    if (!inspeccion) return null;

    const updatedInspeccion = {
      ...inspeccion,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.inspecciones[id] = updatedInspeccion;
    this.saveDatabase(db);
    return updatedInspeccion;
  }

  deleteInspeccion(id: string): boolean {
    const db = this.getDatabase();
    if (!db.inspecciones[id]) return false;
    delete db.inspecciones[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= INSPECCIONES DE CILINDROS =============

  getAllInspeccionesCilindros(inspeccionId?: string): InspeccionCilindro[] {
    const db = this.getDatabase();
    let inspecciones = Object.values(db.inspeccionesCilindros);

    if (inspeccionId) {
      inspecciones = inspecciones.filter(i => i.inspeccionId === inspeccionId);
    }

    return inspecciones;
  }

  getInspeccionCilindroById(id: string): InspeccionCilindro | null {
    const db = this.getDatabase();
    return db.inspeccionesCilindros[id] || null;
  }

  createInspeccionCilindro(inspeccion: Omit<InspeccionCilindro, 'id' | 'createdAt' | 'updatedAt'>): InspeccionCilindro {
    const db = this.getDatabase();
    const newInspeccion: InspeccionCilindro = {
      ...inspeccion,
      id: this.generateId('inspCilindro'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.inspeccionesCilindros[newInspeccion.id] = newInspeccion;
    this.saveDatabase(db);
    return newInspeccion;
  }

  updateInspeccionCilindro(id: string, updates: Partial<InspeccionCilindro>): InspeccionCilindro | null {
    const db = this.getDatabase();
    const inspeccion = db.inspeccionesCilindros[id];
    if (!inspeccion) return null;

    const updatedInspeccion = {
      ...inspeccion,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.inspeccionesCilindros[id] = updatedInspeccion;
    this.saveDatabase(db);
    return updatedInspeccion;
  }

  deleteInspeccionCilindro(id: string): boolean {
    const db = this.getDatabase();
    if (!db.inspeccionesCilindros[id]) return false;
    delete db.inspeccionesCilindros[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= INFORMES =============

  getAllInformes(tallerId?: string): Informe[] {
    const db = this.getDatabase();
    let informes = Object.values(db.informes);

    if (tallerId) {
      informes = informes.filter(i => i.tallerId === tallerId);
    }

    return informes;
  }

  getInformeById(id: string): Informe | null {
    const db = this.getDatabase();
    return db.informes[id] || null;
  }

  getInformeByInspeccionId(inspeccionId: string): Informe | null {
    const db = this.getDatabase();
    return Object.values(db.informes).find(i => i.inspeccionId === inspeccionId) || null;
  }

  createInforme(informe: Omit<Informe, 'id' | 'createdAt' | 'updatedAt'>): Informe {
    const db = this.getDatabase();
    const newInforme: Informe = {
      ...informe,
      id: this.generateId('informe'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.informes[newInforme.id] = newInforme;
    this.saveDatabase(db);
    return newInforme;
  }

  updateInforme(id: string, updates: Partial<Informe>): Informe | null {
    const db = this.getDatabase();
    const informe = db.informes[id];
    if (!informe) return null;

    const updatedInforme = {
      ...informe,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.informes[id] = updatedInforme;
    this.saveDatabase(db);
    return updatedInforme;
  }

  deleteInforme(id: string): boolean {
    const db = this.getDatabase();
    if (!db.informes[id]) return false;
    delete db.informes[id];
    this.saveDatabase(db);
    return true;
  }

  // ============= UTILITIES =============

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}_db`);
  }

  exportData(): string {
    const db = this.getDatabase();
    return JSON.stringify(db, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const db = JSON.parse(jsonData) as LocalStorageDB;
      this.saveDatabase(db);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Singleton instance
export const storage = new StorageManager();
