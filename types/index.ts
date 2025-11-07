// ============= ENUMS =============

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TECNICO = 'TECNICO',
  ADMIN_TALLER = 'ADMIN_TALLER'
}

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  ASIGNADA = 'ASIGNADA',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADA = 'COMPLETADA',
  RECHAZADA = 'RECHAZADA'
}

export enum EstadoInspeccion {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  GUARDADA_PARCIAL = 'GUARDADA_PARCIAL',
  COMPLETADA = 'COMPLETADA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA'
}

export enum TipoCampo {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  FILE = 'FILE',
  SECTION_HEADER = 'SECTION_HEADER',
  TEXTAREA = 'TEXTAREA'
}

export enum OperadorCondicional {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty'
}

// ============= INTERFACES =============

// -------- TALLER --------
export interface Taller {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  responsable: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// -------- USUARIO --------
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string; // En producción usar hash
  role: Role;
  tallerId?: string; // Solo para ADMIN_TALLER
  activo: boolean;
  avatar?: string;
  telefono?: string;
  createdAt: string;
  updatedAt: string;
}

// -------- VEHÍCULO --------
export interface Vehiculo {
  id: string;
  tallerId: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  propietario: string;
  documentoPropietario: string;
  telefonoPropietario?: string;
  emailPropietario?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cilindro {
  id: string;
  vehiculoId: string;
  numeroSerie: string;
  capacidad: number; // En litros
  fabricante: string;
  añoFabricacion: number;
  ubicacion: string; // Ej: "Maletero", "Bajo chasis"
  createdAt: string;
  updatedAt: string;
}

// -------- FORMULARIOS --------
export interface ValidacionCampo {
  min?: number;
  max?: number;
  pattern?: string;
  mensaje?: string;
  required?: boolean;
}

export interface CondicionLogica {
  campoId: string;
  operador: OperadorCondicional;
  valor: any;
}

export interface LogicaCondicional {
  mostrarSi: CondicionLogica[];
  operadorLogico?: 'AND' | 'OR'; // Por defecto AND
}

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  label: string;
  placeholder?: string;
  descripcion?: string;
  required: boolean;
  opciones?: string[]; // Para SELECT, RADIO, CHECKBOX
  validacion?: ValidacionCampo;
  logicaCondicional?: LogicaCondicional;
  orden: number;
  seccion?: string; // Para agrupar campos
}

export interface PlantillaFormulario {
  id: string;
  nombre: string;
  descripcion: string;
  version: string;
  campos: CampoFormulario[];
  activo: boolean;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

// -------- SOLICITUDES --------
export interface Solicitud {
  id: string;
  tallerId: string;
  vehiculoId: string;
  solicitadoPor: string; // userId
  estado: EstadoSolicitud;
  tecnicoAsignadoId?: string;
  fechaSolicitud: string;
  fechaAsignacion?: string;
  fechaProgramada?: string; // Fecha programada para la inspección
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// -------- INSPECCIONES --------
export interface InspeccionCilindro {
  id: string;
  inspeccionId: string;
  cilindroId: string;
  respuestas: Record<string, any>; // campoId: valor
  imagenes?: ArchivoAdjunto[];
  observaciones?: string;
  aprobado?: boolean;
  estado: EstadoInspeccion;
  createdAt: string;
  updatedAt: string;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: string; // image/jpeg, image/png, etc.
  base64?: string; // Para almacenamiento local
  url?: string; // Para futuro backend
  tamano: number; // en bytes
  createdAt: string;
}

export interface Inspeccion {
  id: string;
  solicitudId: string;
  vehiculoId: string;
  tecnicoId: string;
  plantillaFormularioId: string;
  estado: EstadoInspeccion;
  inspeccionesCilindros: InspeccionCilindro[];
  fechaInicio?: string;
  fechaCompletada?: string;
  revisadoPor?: string; // userId (super-admin)
  fechaRevision?: string;
  observacionesRevision?: string;
  createdAt: string;
  updatedAt: string;
}

// -------- INFORMES --------
export interface Informe {
  id: string;
  inspeccionId: string;
  tallerId: string;
  vehiculoId: string;
  generadoPor: string; // userId (super-admin)
  fechaGeneracion: string;
  contenidoHTML: string;
  pdfBase64?: string; // PDF en base64
  enviado: boolean;
  fechaEnvio?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= LOCAL STORAGE DATABASE STRUCTURE =============
export interface LocalStorageDB {
  version: string;
  talleres: Record<string, Taller>;
  usuarios: Record<string, Usuario>;
  vehiculos: Record<string, Vehiculo>;
  cilindros: Record<string, Cilindro>;
  plantillasFormularios: Record<string, PlantillaFormulario>;
  solicitudes: Record<string, Solicitud>;
  inspecciones: Record<string, Inspeccion>;
  inspeccionesCilindros: Record<string, InspeccionCilindro>;
  informes: Record<string, Informe>;
}

// ============= AUTH & CONTEXT =============
export interface AuthUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  tallerId?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface TenantContextType {
  currentTenantId: string | null;
  currentTenant: Taller | null;
  setTenant: (tenantId: string | null) => void;
}
