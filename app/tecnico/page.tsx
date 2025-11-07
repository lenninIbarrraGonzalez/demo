'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TECNICO_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { EstadoSolicitud } from '@/types';
import Link from 'next/link';

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    asignacionesPendientes: 0,
    inspeccionesEnProceso: 0,
    inspeccionesCompletadas: 0,
    totalInspecciones: 0,
  });

  const [asignacionesProximas, setAsignacionesProximas] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Cargar estadísticas
    const solicitudes = storage.getAllSolicitudes(undefined, user.id);
    const inspecciones = storage.getAllInspecciones(user.id);

    setStats({
      asignacionesPendientes: solicitudes.filter(s => s.estado === EstadoSolicitud.ASIGNADA).length,
      inspeccionesEnProceso: solicitudes.filter(s => s.estado === EstadoSolicitud.EN_PROCESO).length,
      inspeccionesCompletadas: solicitudes.filter(s => s.estado === EstadoSolicitud.COMPLETADA).length,
      totalInspecciones: inspecciones.length,
    });

    // Cargar asignaciones próximas
    const proximas = solicitudes
      .filter(s => s.estado === EstadoSolicitud.ASIGNADA)
      .sort((a, b) => {
        const dateA = a.fechaProgramada ? new Date(a.fechaProgramada).getTime() : 0;
        const dateB = b.fechaProgramada ? new Date(b.fechaProgramada).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5)
      .map(s => {
        const vehiculo = storage.getVehiculoById(s.vehiculoId);
        const taller = storage.getTallerById(s.tallerId);
        const cilindros = storage.getAllCilindros(s.vehiculoId);
        return {
          ...s,
          vehiculo,
          taller,
          numeroCilindros: cilindros.length,
        };
      });

    setAsignacionesProximas(proximas);
  }, [user]);

  return (
    <DashboardLayout sections={TECNICO_NAV} title="Mi Dashboard">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
            Mi Dashboard
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Bienvenido, {user?.nombre} {user?.apellido}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Asignaciones Pendientes"
            value={stats.asignacionesPendientes}
            description="Por realizar"
            icon={ClipboardList}
            className="border-l-4 border-l-[hsl(var(--status-pending-border))]"
          />
          <StatsCard
            title="En Proceso"
            value={stats.inspeccionesEnProceso}
            description="Inspecciones iniciadas"
            icon={Clock}
            className="border-l-4 border-l-[hsl(var(--status-in-progress-border))]"
          />
          <StatsCard
            title="Completadas"
            value={stats.inspeccionesCompletadas}
            description="Inspecciones finalizadas"
            icon={CheckCircle}
            className="border-l-4 border-l-[hsl(var(--status-completed-border))]"
          />
          <StatsCard
            title="Total Inspecciones"
            value={stats.totalInspecciones}
            description="Histórico total"
            icon={AlertTriangle}
          />
        </div>

        {/* Asignaciones Próximas */}
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones Próximas</CardTitle>
            <CardDescription>
              Inspecciones asignadas pendientes de realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asignacionesProximas.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base">
                  No tienes asignaciones pendientes
                </p>
                <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  ¡Buen trabajo! Estás al día con tus inspecciones.
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {asignacionesProximas.map((asignacion) => (
                  <div
                    key={asignacion.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-base md:text-lg">
                          {asignacion.vehiculo?.placa || 'Sin placa'}
                        </p>
                        <Badge variant="secondary">
                          {asignacion.numeroCilindros} cilindros
                        </Badge>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Taller: {asignacion.taller?.nombre || 'Desconocido'}
                      </p>
                      {asignacion.fechaProgramada && (
                        <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Programada:{' '}
                          {new Date(asignacion.fechaProgramada).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {asignacion.observaciones && (
                        <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                          {asignacion.observaciones}
                        </p>
                      )}
                    </div>
                    <Button size="tablet" className="w-full md:w-auto">
                      Realizar Inspección
                    </Button>
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
