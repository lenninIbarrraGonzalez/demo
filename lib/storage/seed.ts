import {
  Role,
  EstadoSolicitud,
  EstadoInspeccion,
  TipoCampo,
  OperadorCondicional,
  type Taller,
  type Usuario,
  type Vehiculo,
  type Cilindro,
  type PlantillaFormulario,
  type Solicitud
} from '@/types';
import { storage } from './storage';

/**
 * Inicializa la base de datos con datos de demostración
 */
export function seedDatabase() {
  // Verificar si ya hay datos
  const existingTalleres = storage.getAllTalleres();
  if (existingTalleres.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // ============= SUPER ADMIN =============
  const superAdmin = storage.createUsuario({
    nombre: 'Admin',
    apellido: 'HOITSU',
    email: 'admin@hoitsu.com',
    password: 'admin123', // En producción: usar bcrypt
    role: Role.SUPER_ADMIN,
    activo: true,
    telefono: '+593 99 123 4567'
  });

  // ============= TALLERES =============
  const taller1 = storage.createTaller({
    nombre: 'AutoGas Express',
    ruc: '1791234567001',
    direccion: 'Av. 6 de Diciembre N34-234 y Gaspar de Villarroel, Quito',
    telefono: '+593 2 245 6789',
    email: 'contacto@autogasexpress.com',
    responsable: 'Carlos Méndez',
    activo: true
  });

  const taller2 = storage.createTaller({
    nombre: 'GNV Solutions',
    ruc: '0991234567001',
    direccion: 'Av. Francisco de Orellana Km 2.5, Guayaquil',
    telefono: '+593 4 269 8745',
    email: 'info@gnvsolutions.com',
    responsable: 'María Rodriguez',
    activo: true
  });

  // ============= USUARIOS TALLER 1 =============
  const adminTaller1 = storage.createUsuario({
    nombre: 'Carlos',
    apellido: 'Méndez',
    email: 'carlos@autogasexpress.com',
    password: 'taller123',
    role: Role.ADMIN_TALLER,
    tallerId: taller1.id,
    activo: true,
    telefono: '+593 98 765 4321'
  });

  // ============= USUARIOS TALLER 2 =============
  const adminTaller2 = storage.createUsuario({
    nombre: 'María',
    apellido: 'Rodriguez',
    email: 'maria@gnvsolutions.com',
    password: 'taller123',
    role: Role.ADMIN_TALLER,
    tallerId: taller2.id,
    activo: true,
    telefono: '+593 99 876 5432'
  });

  // ============= TÉCNICOS HOITSU =============
  const tecnico1 = storage.createUsuario({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@hoitsu.com',
    password: 'tecnico123',
    role: Role.TECNICO,
    activo: true,
    telefono: '+593 98 111 2222'
  });

  const tecnico2 = storage.createUsuario({
    nombre: 'Ana',
    apellido: 'García',
    email: 'ana@hoitsu.com',
    password: 'tecnico123',
    role: Role.TECNICO,
    activo: true,
    telefono: '+593 99 333 4444'
  });

  // ============= VEHÍCULOS TALLER 1 =============
  const vehiculo1 = storage.createVehiculo({
    tallerId: taller1.id,
    placa: 'PBX-1234',
    marca: 'Chevrolet',
    modelo: 'Sail',
    año: 2018,
    propietario: 'Roberto Andrade',
    documentoPropietario: '1712345678',
    telefonoPropietario: '+593 98 555 6666',
    emailPropietario: 'roberto@email.com'
  });

  // Cilindros del vehículo 1
  const cilindro1_v1 = storage.createCilindro({
    vehiculoId: vehiculo1.id,
    numeroSerie: 'CYL-2018-001',
    capacidad: 80,
    fabricante: 'Faber',
    añoFabricacion: 2018,
    ubicacion: 'Maletero'
  });

  const cilindro2_v1 = storage.createCilindro({
    vehiculoId: vehiculo1.id,
    numeroSerie: 'CYL-2018-002',
    capacidad: 80,
    fabricante: 'Faber',
    añoFabricacion: 2018,
    ubicacion: 'Maletero'
  });

  const vehiculo2 = storage.createVehiculo({
    tallerId: taller1.id,
    placa: 'PCE-5678',
    marca: 'Kia',
    modelo: 'Rio',
    año: 2020,
    propietario: 'Sandra López',
    documentoPropietario: '1723456789',
    telefonoPropietario: '+593 99 777 8888'
  });

  const cilindro1_v2 = storage.createCilindro({
    vehiculoId: vehiculo2.id,
    numeroSerie: 'CYL-2020-003',
    capacidad: 60,
    fabricante: 'Worthington',
    añoFabricacion: 2020,
    ubicacion: 'Bajo chasis'
  });

  // ============= VEHÍCULOS TALLER 2 =============
  const vehiculo3 = storage.createVehiculo({
    tallerId: taller2.id,
    placa: 'GYE-9012',
    marca: 'Hyundai',
    modelo: 'Accent',
    año: 2019,
    propietario: 'Miguel Torres',
    documentoPropietario: '0912345678',
    telefonoPropietario: '+593 98 999 1111'
  });

  const cilindro1_v3 = storage.createCilindro({
    vehiculoId: vehiculo3.id,
    numeroSerie: 'CYL-2019-004',
    capacidad: 70,
    fabricante: 'Faber',
    añoFabricacion: 2019,
    ubicacion: 'Maletero'
  });

  const vehiculo4 = storage.createVehiculo({
    tallerId: taller2.id,
    placa: 'GSM-3456',
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2021,
    propietario: 'Patricia Vera',
    documentoPropietario: '0923456789',
    telefonoPropietario: '+593 99 222 3333'
  });

  const cilindro1_v4 = storage.createCilindro({
    vehiculoId: vehiculo4.id,
    numeroSerie: 'CYL-2021-005',
    capacidad: 80,
    fabricante: 'Luxfer',
    añoFabricacion: 2021,
    ubicacion: 'Maletero'
  });

  const cilindro2_v4 = storage.createCilindro({
    vehiculoId: vehiculo4.id,
    numeroSerie: 'CYL-2021-006',
    capacidad: 80,
    fabricante: 'Luxfer',
    añoFabricacion: 2021,
    ubicacion: 'Maletero'
  });

  // ============= PLANTILLA DE FORMULARIO =============
  const plantillaInspeccion = storage.createPlantillaFormulario({
    nombre: 'Inspección Estándar GNV 2024',
    descripcion: 'Formulario de inspección estándar para cilindros de gas natural vehicular',
    version: '1.0',
    activo: true,
    createdBy: superAdmin.id,
    campos: [
      {
        id: 'campo_1',
        tipo: TipoCampo.SECTION_HEADER,
        label: '1. INFORMACIÓN DEL CILINDRO',
        required: false,
        orden: 1,
        seccion: 'informacion'
      },
      {
        id: 'campo_2',
        tipo: TipoCampo.TEXT,
        label: 'Número de Serie del Cilindro',
        placeholder: 'Ej: CYL-2024-001',
        descripcion: 'Ingrese el número de serie grabado en el cilindro',
        required: true,
        orden: 2,
        seccion: 'informacion',
        validacion: {
          pattern: '^[A-Z0-9-]+$',
          mensaje: 'El número de serie debe contener solo letras mayúsculas, números y guiones'
        }
      },
      {
        id: 'campo_3',
        tipo: TipoCampo.SELECT,
        label: 'Estado Visual General',
        descripcion: 'Evalúe el estado visual general del cilindro',
        required: true,
        opciones: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Crítico'],
        orden: 3,
        seccion: 'inspeccion_visual'
      },
      {
        id: 'campo_4',
        tipo: TipoCampo.SECTION_HEADER,
        label: '2. INSPECCIÓN VISUAL DETALLADA',
        required: false,
        orden: 4,
        seccion: 'inspeccion_visual'
      },
      {
        id: 'campo_5',
        tipo: TipoCampo.CHECKBOX,
        label: 'Defectos Visuales Detectados',
        descripcion: 'Seleccione todos los defectos que apliquen',
        required: false,
        opciones: [
          'Corrosión superficial',
          'Abolladuras',
          'Rayones profundos',
          'Pintura deteriorada',
          'Válvula dañada',
          'Fugas visibles',
          'Ninguno'
        ],
        orden: 5,
        seccion: 'inspeccion_visual'
      },
      {
        id: 'campo_6',
        tipo: TipoCampo.TEXTAREA,
        label: 'Descripción de Defectos',
        placeholder: 'Describa en detalle los defectos encontrados...',
        required: true,
        orden: 6,
        seccion: 'inspeccion_visual',
        logicaCondicional: {
          mostrarSi: [
            {
              campoId: 'campo_5',
              operador: OperadorCondicional.IS_NOT_EMPTY,
              valor: null
            }
          ],
          operadorLogico: 'AND'
        }
      },
      {
        id: 'campo_7',
        tipo: TipoCampo.SECTION_HEADER,
        label: '3. PRUEBAS TÉCNICAS',
        required: false,
        orden: 7,
        seccion: 'pruebas'
      },
      {
        id: 'campo_8',
        tipo: TipoCampo.NUMBER,
        label: 'Presión Actual (PSI)',
        descripcion: 'Presión medida en el cilindro',
        placeholder: '0',
        required: true,
        orden: 8,
        seccion: 'pruebas',
        validacion: {
          min: 0,
          max: 5000,
          mensaje: 'La presión debe estar entre 0 y 5000 PSI'
        }
      },
      {
        id: 'campo_9',
        tipo: TipoCampo.RADIO,
        label: '¿La presión está dentro del rango permitido?',
        required: true,
        opciones: ['Sí', 'No'],
        orden: 9,
        seccion: 'pruebas'
      },
      {
        id: 'campo_10',
        tipo: TipoCampo.TEXTAREA,
        label: 'Observaciones sobre la presión',
        placeholder: 'Explique por qué la presión no está en rango...',
        required: true,
        orden: 10,
        seccion: 'pruebas',
        logicaCondicional: {
          mostrarSi: [
            {
              campoId: 'campo_9',
              operador: OperadorCondicional.EQUALS,
              valor: 'No'
            }
          ]
        }
      },
      {
        id: 'campo_11',
        tipo: TipoCampo.RADIO,
        label: '¿Se detectaron fugas?',
        descripcion: 'Realizar prueba de fugas con solución jabonosa',
        required: true,
        opciones: ['Sí', 'No'],
        orden: 11,
        seccion: 'pruebas'
      },
      {
        id: 'campo_12',
        tipo: TipoCampo.SELECT,
        label: 'Ubicación de la fuga',
        required: true,
        opciones: ['Válvula', 'Conexiones', 'Cuerpo del cilindro', 'Multiple'],
        orden: 12,
        seccion: 'pruebas',
        logicaCondicional: {
          mostrarSi: [
            {
              campoId: 'campo_11',
              operador: OperadorCondicional.EQUALS,
              valor: 'Sí'
            }
          ]
        }
      },
      {
        id: 'campo_13',
        tipo: TipoCampo.DATE,
        label: 'Fecha de Última Certificación',
        descripcion: 'Fecha de la última certificación del cilindro',
        required: true,
        orden: 13,
        seccion: 'certificacion'
      },
      {
        id: 'campo_14',
        tipo: TipoCampo.SECTION_HEADER,
        label: '4. DOCUMENTACIÓN FOTOGRÁFICA',
        required: false,
        orden: 14,
        seccion: 'documentacion'
      },
      {
        id: 'campo_15',
        tipo: TipoCampo.FILE,
        label: 'Fotos del Cilindro Completo',
        descripcion: 'Adjunte fotos del cilindro desde diferentes ángulos',
        required: true,
        orden: 15,
        seccion: 'documentacion'
      },
      {
        id: 'campo_16',
        tipo: TipoCampo.FILE,
        label: 'Fotos de Defectos (si aplica)',
        descripcion: 'Adjunte fotos de cerca de cualquier defecto detectado',
        required: false,
        orden: 16,
        seccion: 'documentacion',
        logicaCondicional: {
          mostrarSi: [
            {
              campoId: 'campo_3',
              operador: OperadorCondicional.EQUALS,
              valor: 'Regular'
            },
            {
              campoId: 'campo_3',
              operador: OperadorCondicional.EQUALS,
              valor: 'Malo'
            },
            {
              campoId: 'campo_3',
              operador: OperadorCondicional.EQUALS,
              valor: 'Crítico'
            }
          ],
          operadorLogico: 'OR'
        }
      },
      {
        id: 'campo_17',
        tipo: TipoCampo.SECTION_HEADER,
        label: '5. RESULTADO FINAL',
        required: false,
        orden: 17,
        seccion: 'resultado'
      },
      {
        id: 'campo_18',
        tipo: TipoCampo.SELECT,
        label: 'Resultado de la Inspección',
        descripcion: 'Determine el resultado final de la inspección',
        required: true,
        opciones: ['Aprobado', 'Aprobado con Observaciones', 'Requiere Mantenimiento', 'Rechazado'],
        orden: 18,
        seccion: 'resultado'
      },
      {
        id: 'campo_19',
        tipo: TipoCampo.TEXTAREA,
        label: 'Observaciones Finales',
        placeholder: 'Ingrese observaciones adicionales o recomendaciones...',
        descripcion: 'Comentarios y recomendaciones del técnico',
        required: false,
        orden: 19,
        seccion: 'resultado'
      },
      {
        id: 'campo_20',
        tipo: TipoCampo.TEXTAREA,
        label: 'Acciones Correctivas Requeridas',
        placeholder: 'Especifique las acciones que deben tomarse...',
        required: true,
        orden: 20,
        seccion: 'resultado',
        logicaCondicional: {
          mostrarSi: [
            {
              campoId: 'campo_18',
              operador: OperadorCondicional.EQUALS,
              valor: 'Requiere Mantenimiento'
            },
            {
              campoId: 'campo_18',
              operador: OperadorCondicional.EQUALS,
              valor: 'Rechazado'
            }
          ],
          operadorLogico: 'OR'
        }
      }
    ]
  });

  // ============= SOLICITUDES DE EJEMPLO =============
  const solicitud1 = storage.createSolicitud({
    tallerId: taller1.id,
    vehiculoId: vehiculo1.id,
    solicitadoPor: adminTaller1.id,
    estado: EstadoSolicitud.PENDIENTE,
    fechaSolicitud: new Date().toISOString(),
    observaciones: 'Revisión anual programada'
  });

  const solicitud2 = storage.createSolicitud({
    tallerId: taller2.id,
    vehiculoId: vehiculo3.id,
    solicitadoPor: adminTaller2.id,
    estado: EstadoSolicitud.ASIGNADA,
    tecnicoAsignadoId: tecnico1.id,
    fechaSolicitud: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    fechaAsignacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    fechaProgramada: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    observaciones: 'Cliente reporta posible fuga'
  });

  console.log('Database seeded successfully!');
  console.log('---');
  console.log('CREDENCIALES DE ACCESO:');
  console.log('');
  console.log('Super Admin:');
  console.log('  Email: admin@hoitsu.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('Admin Taller 1 (AutoGas Express):');
  console.log('  Email: carlos@autogasexpress.com');
  console.log('  Password: taller123');
  console.log('');
  console.log('Admin Taller 2 (GNV Solutions):');
  console.log('  Email: maria@gnvsolutions.com');
  console.log('  Password: taller123');
  console.log('');
  console.log('Técnico 1:');
  console.log('  Email: juan@hoitsu.com');
  console.log('  Password: tecnico123');
  console.log('');
  console.log('Técnico 2:');
  console.log('  Email: ana@hoitsu.com');
  console.log('  Password: tecnico123');
  console.log('---');

  return {
    superAdmin,
    talleres: [taller1, taller2],
    usuarios: [adminTaller1, adminTaller2, tecnico1, tecnico2],
    vehiculos: [vehiculo1, vehiculo2, vehiculo3, vehiculo4],
    plantillaInspeccion
  };
}
