import { EstadoSolicitud, EstadoInspeccion } from '@/types';

// ============================================
// Labels de Estado
// ============================================

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.PENDIENTE]: 'Pendiente',
  [EstadoSolicitud.ASIGNADA]: 'Asignada',
  [EstadoSolicitud.EN_PROCESO]: 'En Proceso',
  [EstadoSolicitud.COMPLETADA]: 'Completada',
  [EstadoSolicitud.RECHAZADA]: 'Rechazada'
};

export const ESTADO_INSPECCION_LABELS: Record<EstadoInspeccion, string> = {
  [EstadoInspeccion.PENDIENTE]: 'Pendiente',
  [EstadoInspeccion.EN_PROCESO]: 'En Proceso',
  [EstadoInspeccion.GUARDADA_PARCIAL]: 'Guardada Parcial',
  [EstadoInspeccion.COMPLETADA]: 'Completada',
  [EstadoInspeccion.APROBADA]: 'Aprobada',
  [EstadoInspeccion.RECHAZADA]: 'Rechazada'
};

// ============================================
// Colores de Estado usando Variables CSS
// Los colores se adaptan automáticamente al modo claro/oscuro
// ============================================

export const ESTADO_SOLICITUD_COLORS: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.PENDIENTE]: 'bg-[hsl(var(--status-pending))] text-[hsl(var(--status-pending-fg))] border-[hsl(var(--status-pending-border))]',
  [EstadoSolicitud.ASIGNADA]: 'bg-[hsl(var(--status-assigned))] text-[hsl(var(--status-assigned-fg))] border-[hsl(var(--status-assigned-border))]',
  [EstadoSolicitud.EN_PROCESO]: 'bg-[hsl(var(--status-in-progress))] text-[hsl(var(--status-in-progress-fg))] border-[hsl(var(--status-in-progress-border))]',
  [EstadoSolicitud.COMPLETADA]: 'bg-[hsl(var(--status-completed))] text-[hsl(var(--status-completed-fg))] border-[hsl(var(--status-completed-border))]',
  [EstadoSolicitud.RECHAZADA]: 'bg-[hsl(var(--status-rejected))] text-[hsl(var(--status-rejected-fg))] border-[hsl(var(--status-rejected-border))]'
};

export const ESTADO_INSPECCION_COLORS: Record<EstadoInspeccion, string> = {
  [EstadoInspeccion.PENDIENTE]: 'bg-[hsl(var(--status-pending))] text-[hsl(var(--status-pending-fg))] border-[hsl(var(--status-pending-border))]',
  [EstadoInspeccion.EN_PROCESO]: 'bg-[hsl(var(--status-in-progress))] text-[hsl(var(--status-in-progress-fg))] border-[hsl(var(--status-in-progress-border))]',
  [EstadoInspeccion.GUARDADA_PARCIAL]: 'bg-[hsl(var(--status-assigned))] text-[hsl(var(--status-assigned-fg))] border-[hsl(var(--status-assigned-border))]',
  [EstadoInspeccion.COMPLETADA]: 'bg-[hsl(var(--status-completed))] text-[hsl(var(--status-completed-fg))] border-[hsl(var(--status-completed-border))]',
  [EstadoInspeccion.APROBADA]: 'bg-[hsl(var(--status-completed))] text-[hsl(var(--status-completed-fg))] border-[hsl(var(--status-completed-border))]',
  [EstadoInspeccion.RECHAZADA]: 'bg-[hsl(var(--status-rejected))] text-[hsl(var(--status-rejected-fg))] border-[hsl(var(--status-rejected-border))]'
};
