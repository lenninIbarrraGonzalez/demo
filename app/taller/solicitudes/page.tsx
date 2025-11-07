'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Send, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { ESTADO_SOLICITUD_COLORS, ESTADO_SOLICITUD_LABELS } from '@/lib/constants/status';
import { EstadoSolicitud } from '@/types';
import type { Solicitud, Vehiculo } from '@/types';

interface SolicitudWithDetails extends Solicitud {
  vehiculo: Vehiculo | null;
  numeroCilindros: number;
}

export default function SolicitudesPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudWithDetails[]>([]);

  const loadSolicitudes = () => {
    if (!user?.tallerId) return;

    const data = storage.getAllSolicitudes(user.tallerId);
    const solicitudesWithDetails = data
      .map(s => {
        const vehiculo = storage.getVehiculoById(s.vehiculoId);
        const cilindros = storage.getAllCilindros(s.vehiculoId);
        return {
          ...s,
          vehiculo,
          numeroCilindros: cilindros.length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setSolicitudes(solicitudesWithDetails);
  };

  useEffect(() => {
    loadSolicitudes();
  }, [user]);

  if (!user?.tallerId) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Solicitudes">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no asociado a un taller
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Solicitudes">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Send className="h-8 w-8 md:h-10 md:w-10" />
              Solicitudes de Inspección
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Gestiona tus solicitudes de inspección de tanques GNV
            </p>
          </div>
          <Link href="/taller/solicitudes/nueva">
            <Button size="tablet" className="w-full md:w-auto gap-2">
              <Plus className="h-5 w-5" />
              Nueva Solicitud
            </Button>
          </Link>
        </div>

        {/* Lista de Solicitudes */}
        <div>
          {solicitudes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Send className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                  <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base mb-4">
                    No has realizado solicitudes aún
                  </p>
                  <Link href="/taller/solicitudes/nueva">
                    <Button size="tablet">
                      <Plus className="h-5 w-5 mr-2" />
                      Crear Primera Solicitud
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Solicitudes</CardTitle>
                <CardDescription>
                  {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solicitudes.map((solicitud) => (
                    <Card key={solicitud.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">
                                {solicitud.vehiculo?.placa || 'Vehículo desconocido'}
                              </h3>
                              <Badge className={ESTADO_SOLICITUD_COLORS[solicitud.estado as EstadoSolicitud]}>
                                {ESTADO_SOLICITUD_LABELS[solicitud.estado as EstadoSolicitud]}
                              </Badge>
                              <Badge variant="outline">
                                {solicitud.numeroCilindros} cilindro{solicitud.numeroCilindros !== 1 ? 's' : ''}
                              </Badge>
                            </div>

                            {solicitud.vehiculo && (
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {solicitud.vehiculo.marca} {solicitud.vehiculo.modelo} ({solicitud.vehiculo.año})
                              </p>
                            )}

                            <div className="flex flex-col gap-1 text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                              <p className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Solicitada el{' '}
                                {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>

                              {solicitud.fechaAsignacion && (
                                <p className="flex items-center gap-1">
                                  Asignada el{' '}
                                  {new Date(solicitud.fechaAsignacion).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}

                              {solicitud.fechaProgramada && (
                                <p className="flex items-center gap-1">
                                  Programada para el{' '}
                                  {new Date(solicitud.fechaProgramada).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>

                            {solicitud.observaciones && (
                              <div className="mt-2 p-3 bg-[hsl(var(--muted))] rounded-md">
                                <p className="text-xs md:text-sm">
                                  <span className="font-medium">Observaciones:</span> {solicitud.observaciones}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {solicitud.estado === EstadoSolicitud.PENDIENTE && (
                              <Badge variant="outline" className="text-yellow-600">
                                En espera de asignación
                              </Badge>
                            )}
                            {solicitud.estado === EstadoSolicitud.ASIGNADA && (
                              <Badge variant="outline" className="text-blue-600">
                                Asignada a técnico
                              </Badge>
                            )}
                            {solicitud.estado === EstadoSolicitud.EN_PROCESO && (
                              <Badge variant="outline" className="text-purple-600">
                                Inspección en proceso
                              </Badge>
                            )}
                            {solicitud.estado === EstadoSolicitud.COMPLETADA && (
                              <Badge variant="outline" className="text-green-600">
                                Inspección completada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
