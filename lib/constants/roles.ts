import { Role } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Administrador',
  [Role.TECNICO]: 'Técnico',
  [Role.ADMIN_TALLER]: 'Administrador de Taller'
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Acceso total a la plataforma OINSTEC',
  [Role.TECNICO]: 'Realiza inspecciones asignadas',
  [Role.ADMIN_TALLER]: 'Gestiona vehículos y solicitudes del taller'
};

export const ROLE_ROUTES: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '/super-admin',
  [Role.TECNICO]: '/tecnico',
  [Role.ADMIN_TALLER]: '/taller'
};
