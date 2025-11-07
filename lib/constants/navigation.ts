import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ClipboardList,
  CheckCircle,
  FileCheck,
  Car,
  Send,
  Inbox,
} from 'lucide-react';
import type { NavSection } from '@/components/layout/sidebar';

// Navegación para Super Admin
export const SUPER_ADMIN_NAV: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/super-admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      {
        title: 'Talleres',
        href: '/super-admin/talleres',
        icon: Building2,
      },
      {
        title: 'Usuarios OINSTEC',
        href: '/super-admin/usuarios',
        icon: Users,
      },
      {
        title: 'Formularios',
        href: '/super-admin/formularios',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      {
        title: 'Solicitudes',
        href: '/super-admin/solicitudes',
        icon: ClipboardList,
      },
      {
        title: 'Inspecciones',
        href: '/super-admin/inspecciones',
        icon: CheckCircle,
      },
      {
        title: 'Informes',
        href: '/super-admin/informes',
        icon: FileCheck,
      },
    ],
  },
];

// Navegación para Técnico
export const TECNICO_NAV: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/tecnico',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Inspecciones',
    items: [
      {
        title: 'Asignaciones',
        href: '/tecnico/asignaciones',
        icon: ClipboardList,
      },
      {
        title: 'Mis Inspecciones',
        href: '/tecnico/inspecciones',
        icon: CheckCircle,
      },
    ],
  },
];

// Navegación para Admin Taller
export const TALLER_NAV: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/taller',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      {
        title: 'Vehículos',
        href: '/taller/vehiculos',
        icon: Car,
      },
    ],
  },
  {
    title: 'Servicios',
    items: [
      {
        title: 'Solicitudes',
        href: '/taller/solicitudes',
        icon: Send,
      },
      {
        title: 'Informes Recibidos',
        href: '/taller/informes',
        icon: Inbox,
      },
    ],
  },
];
