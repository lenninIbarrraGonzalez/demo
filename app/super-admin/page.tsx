'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, ClipboardList, FileCheck, TrendingUp, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { ESTADO_SOLICITUD_COLORS, ESTADO_SOLICITUD_LABELS } from '@/lib/constants/status';
import { EstadoSolicitud } from '@/types';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalTalleres: 0,
    talleresActivos: 0,
    totalUsuarios: 0,
    solicitudesPendientes: 0,
    inspeccionesCompletadas: 0,
    informesGenerados: 0,
  });

  const [recentSolicitudes, setRecentSolicitudes] = useState<any[]>([]);

  useEffect(() => {
    // Cargar estadísticas
    const talleres = storage.getAllTalleres();
    const usuarios = storage.getAllUsuarios();
    const solicitudes = storage.getAllSolicitudes();
    const inspecciones = storage.getAllInspecciones();
    const informes = storage.getAllInformes();

    setStats({
      totalTalleres: talleres.length,
      talleresActivos: talleres.filter(t => t.activo).length,
      totalUsuarios: usuarios.length,
      solicitudesPendientes: solicitudes.filter(s => s.estado === EstadoSolicitud.PENDIENTE).length,
      inspeccionesCompletadas: inspecciones.length,
      informesGenerados: informes.length,
    });

    // Cargar solicitudes recientes (últimas 5)
    const recent = solicitudes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(s => {
        const taller = storage.getTallerById(s.tallerId);
        const vehiculo = storage.getVehiculoById(s.vehiculoId);
        return {
          ...s,
          tallerNombre: taller?.nombre || 'Desconocido',
          vehiculoPlaca: vehiculo?.placa || 'Desconocida',
        };
      });

    setRecentSolicitudes(recent);
  }, []);

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Dashboard">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Vista general de la plataforma OINSTEC
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatsCard
            title="Talleres Totales"
            value={stats.totalTalleres}
            description={`${stats.talleresActivos} activos`}
            icon={Building2}
          />
          <StatsCard
            title="Usuarios del Sistema"
            value={stats.totalUsuarios}
            description="Total de usuarios registrados"
            icon={Users}
          />
          <StatsCard
            title="Solicitudes Pendientes"
            value={stats.solicitudesPendientes}
            description="Requieren asignación"
            icon={ClipboardList}
            className="border-l-4 border-l-[hsl(var(--status-pending-border))]"
          />
          <StatsCard
            title="Inspecciones Completadas"
            value={stats.inspeccionesCompletadas}
            description="Total histórico"
            icon={Activity}
          />
          <StatsCard
            title="Informes Generados"
            value={stats.informesGenerados}
            description="Informes enviados"
            icon={FileCheck}
          />
          <StatsCard
            title="Tasa de Éxito"
            value="98%"
            description="Inspecciones aprobadas"
            icon={TrendingUp}
            trend={{ value: 2.5, label: 'vs mes anterior' }}
          />
        </div>

        {/* Solicitudes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Recientes</CardTitle>
            <CardDescription>
              Últimas solicitudes de inspección recibidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSolicitudes.length === 0 ? (
              <p className="text-center text-[hsl(var(--muted-foreground))] py-8">
                No hay solicitudes recientes
              </p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentSolicitudes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm md:text-base">
                          {solicitud.vehiculoPlaca}
                        </p>
                        <Badge className={ESTADO_SOLICITUD_COLORS[solicitud.estado as EstadoSolicitud]}>
                          {ESTADO_SOLICITUD_LABELS[solicitud.estado as EstadoSolicitud]}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                        Taller: {solicitud.tallerNombre}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
