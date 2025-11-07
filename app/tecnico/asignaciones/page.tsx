'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Clock, Car, MapPin, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TECNICO_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { EstadoSolicitud } from '@/types';
import type { Solicitud, Vehiculo, Taller } from '@/types';

interface SolicitudWithDetails extends Solicitud {
  vehiculo: Vehiculo | null;
  taller: Taller | null;
  numeroCilindros: number;
}

export default function AsignacionesPage() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState<SolicitudWithDetails[]>([]);

  const loadAsignaciones = () => {
    if (!user?.id) return;

    // Obtener solicitudes asignadas a este técnico
    const data = storage.getAllSolicitudes(undefined, user.id);
    const asignacionesWithDetails = data
      .filter(s => s.estado === EstadoSolicitud.ASIGNADA || s.estado === EstadoSolicitud.EN_PROCESO)
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
      })
      .sort((a, b) => {
        // Primero las que están en proceso, luego por fecha programada
        if (a.estado === EstadoSolicitud.EN_PROCESO && b.estado !== EstadoSolicitud.EN_PROCESO) {
          return -1;
        }
        if (b.estado === EstadoSolicitud.EN_PROCESO && a.estado !== EstadoSolicitud.EN_PROCESO) {
          return 1;
        }
        if (a.fechaProgramada && b.fechaProgramada) {
          return new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime();
        }
        return 0;
      });

    setAsignaciones(asignacionesWithDetails);
  };

  useEffect(() => {
    loadAsignaciones();
  }, [user]);

  if (!user?.id) {
    return (
      <DashboardLayout sections={TECNICO_NAV} title="Asignaciones">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no autenticado
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const enProceso = asignaciones.filter(a => a.estado === EstadoSolicitud.EN_PROCESO);
  const pendientes = asignaciones.filter(a => a.estado === EstadoSolicitud.ASIGNADA);

  return (
    <DashboardLayout sections={TECNICO_NAV} title="Asignaciones">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
            <ClipboardList className="h-8 w-8 md:h-10 md:w-10" />
            Mis Asignaciones
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Inspecciones asignadas a ti
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-[hsl(var(--status-in-progress-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-in-progress-fg))]">{enProceso.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">En Proceso</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-assigned-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-assigned-fg))]">{pendientes.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Pendientes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Asignaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Inspecciones Asignadas</CardTitle>
            <CardDescription>
              {asignaciones.length} inspeccion{asignaciones.length !== 1 ? 'es' : ''} asignada{asignaciones.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asignaciones.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  No tienes inspecciones asignadas en este momento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {asignaciones.map((asignacion) => (
                  <Card key={asignacion.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold">
                                {asignacion.vehiculo?.placa || 'Vehículo desconocido'}
                              </h3>
                              <Badge
                                className={
                                  asignacion.estado === EstadoSolicitud.EN_PROCESO
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }
                              >
                                {asignacion.estado === EstadoSolicitud.EN_PROCESO ? 'En Proceso' : 'Pendiente'}
                              </Badge>
                              <Badge variant="outline">
                                {asignacion.numeroCilindros} cilindro{asignacion.numeroCilindros !== 1 ? 's' : ''}
                              </Badge>
                            </div>

                            {asignacion.vehiculo && (
                              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <Car className="h-4 w-4" />
                                <span>
                                  {asignacion.vehiculo.marca} {asignacion.vehiculo.modelo} ({asignacion.vehiculo.año})
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                              <MapPin className="h-4 w-4" />
                              <span>{asignacion.taller?.nombre || 'Taller desconocido'}</span>
                            </div>

                            {asignacion.fechaProgramada && (
                              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Programada: {new Date(asignacion.fechaProgramada).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}

                            {asignacion.observaciones && (
                              <div className="mt-2 p-3 bg-[hsl(var(--muted))] rounded-md">
                                <p className="text-xs md:text-sm">
                                  <span className="font-medium">Observaciones:</span> {asignacion.observaciones}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Acción */}
                          <Link href={`/tecnico/inspecciones/${asignacion.id}`}>
                            <Button size="tablet" className="gap-2">
                              {asignacion.estado === EstadoSolicitud.EN_PROCESO ? 'Continuar' : 'Iniciar'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
