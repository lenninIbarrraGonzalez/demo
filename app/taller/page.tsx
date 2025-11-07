'use client';

import { useEffect, useState } from 'react';
import { Car, Send, Inbox, Clock, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { EstadoSolicitud } from '@/types';
import { ESTADO_SOLICITUD_COLORS, ESTADO_SOLICITUD_LABELS } from '@/lib/constants/status';
import Link from 'next/link';

export default function TallerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehiculos: 0,
    solicitudesPendientes: 0,
    solicitudesEnProceso: 0,
    informesRecibidos: 0,
  });

  const [solicitudesRecientes, setSolicitudesRecientes] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.tallerId) return;

    // Cargar estadísticas
    const vehiculos = storage.getAllVehiculos(user.tallerId);
    const solicitudes = storage.getAllSolicitudes(user.tallerId);
    const informes = storage.getAllInformes(user.tallerId);

    setStats({
      totalVehiculos: vehiculos.length,
      solicitudesPendientes: solicitudes.filter(
        s => s.estado === EstadoSolicitud.PENDIENTE || s.estado === EstadoSolicitud.ASIGNADA
      ).length,
      solicitudesEnProceso: solicitudes.filter(s => s.estado === EstadoSolicitud.EN_PROCESO).length,
      informesRecibidos: informes.length,
    });

    // Cargar solicitudes recientes
    const recientes = solicitudes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(s => {
        const vehiculo = storage.getVehiculoById(s.vehiculoId);
        const cilindros = storage.getAllCilindros(s.vehiculoId);
        return {
          ...s,
          vehiculo,
          numeroCilindros: cilindros.length,
        };
      });

    setSolicitudesRecientes(recientes);
  }, [user]);

  if (!user?.tallerId) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no asociado a un taller
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Dashboard">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Bienvenido, {user?.nombre} {user?.apellido}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Vehículos Registrados"
            value={stats.totalVehiculos}
            description="Total en el sistema"
            icon={Car}
          />
          <StatsCard
            title="Solicitudes Pendientes"
            value={stats.solicitudesPendientes}
            description="En espera de inspección"
            icon={Send}
            className="border-l-4 border-l-[hsl(var(--status-pending-border))]"
          />
          <StatsCard
            title="En Proceso"
            value={stats.solicitudesEnProceso}
            description="Siendo inspeccionadas"
            icon={Clock}
            className="border-l-4 border-l-[hsl(var(--status-in-progress-border))]"
          />
          <StatsCard
            title="Informes Recibidos"
            value={stats.informesRecibidos}
            description="Informes completados"
            icon={Inbox}
            className="border-l-4 border-l-[hsl(var(--status-completed-border))]"
          />
        </div>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/taller/vehiculos/nuevo">
              <Button
                variant="outline"
                className="w-full h-20 md:h-24 text-base justify-start gap-4"
                size="lg"
              >
                <Car className="h-6 w-6 md:h-8 md:w-8" />
                <div className="text-left">
                  <div className="font-semibold">Registrar Vehículo</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Agregar nuevo vehículo
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/taller/solicitudes/nueva">
              <Button
                variant="outline"
                className="w-full h-20 md:h-24 text-base justify-start gap-4"
                size="lg"
              >
                <Send className="h-6 w-6 md:h-8 md:w-8" />
                <div className="text-left">
                  <div className="font-semibold">Nueva Solicitud</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Solicitar inspección
                  </div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Solicitudes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Recientes</CardTitle>
            <CardDescription>Últimas solicitudes de inspección</CardDescription>
          </CardHeader>
          <CardContent>
            {solicitudesRecientes.length === 0 ? (
              <div className="text-center py-12">
                <Send className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base">
                  No has realizado solicitudes aún
                </p>
                <Link href="/taller/solicitudes/nueva">
                  <Button className="mt-4" size="tablet">
                    Crear Primera Solicitud
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {solicitudesRecientes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors gap-3"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-base md:text-lg">
                          {solicitud.vehiculo?.placa || 'Sin placa'}
                        </p>
                        <Badge className={ESTADO_SOLICITUD_COLORS[solicitud.estado as EstadoSolicitud]}>
                          {ESTADO_SOLICITUD_LABELS[solicitud.estado as EstadoSolicitud]}
                        </Badge>
                        <Badge variant="outline">
                          {solicitud.numeroCilindros} cilindros
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                        Propietario: {solicitud.vehiculo?.propietario || 'Desconocido'}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Solicitada el{' '}
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
