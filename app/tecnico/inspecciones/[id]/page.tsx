'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Circle, FileCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TECNICO_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import { EstadoSolicitud, EstadoInspeccion } from '@/types';
import type { Solicitud, Vehiculo, Taller, Cilindro, Inspeccion, InspeccionCilindro, PlantillaFormulario } from '@/types';

export default function InspeccionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const solicitudId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [inspeccionesCilindros, setInspeccionesCilindros] = useState<InspeccionCilindro[]>([]);
  const [plantilla, setPlantilla] = useState<PlantillaFormulario | null>(null);

  useEffect(() => {
    if (!solicitudId || !user?.id) return;

    const solicitudData = storage.getSolicitudById(solicitudId);
    if (!solicitudData) {
      toast.error('Solicitud no encontrada');
      router.push('/tecnico/asignaciones');
      return;
    }

    // Verificar que la solicitud esté asignada a este técnico
    if (solicitudData.tecnicoAsignadoId !== user.id) {
      toast.error('No tienes permiso para ver esta solicitud');
      router.push('/tecnico/asignaciones');
      return;
    }

    setSolicitud(solicitudData);

    const vehiculoData = storage.getVehiculoById(solicitudData.vehiculoId);
    const tallerData = storage.getTallerById(solicitudData.tallerId);
    const cilindrosData = storage.getAllCilindros(solicitudData.vehiculoId);

    setVehiculo(vehiculoData);
    setTaller(tallerData);
    setCilindros(cilindrosData);

    // Obtener o crear inspección
    let inspeccionData = storage.getInspeccionBySolicitudId(solicitudId);
    if (!inspeccionData) {
      // Crear nueva inspección si no existe
      inspeccionData = storage.createInspeccion({
        solicitudId: solicitudId,
        tecnicoId: user.id,
        vehiculoId: solicitudData.vehiculoId,
        plantillaFormularioId: '', // Se asignará cuando se obtenga la plantilla activa
        estado: EstadoInspeccion.EN_PROCESO,
        inspeccionesCilindros: [],
        fechaInicio: new Date().toISOString(),
      });

      // Actualizar estado de solicitud a EN_PROCESO
      storage.updateSolicitud(solicitudId, {
        estado: EstadoSolicitud.EN_PROCESO,
      });
    }

    setInspeccion(inspeccionData);

    // Obtener inspecciones de cilindros
    const inspeccionesCilindrosData = storage.getAllInspeccionesCilindros(inspeccionData.id);
    setInspeccionesCilindros(inspeccionesCilindrosData);

    // Obtener plantilla de formulario activa
    const plantillas = storage.getAllPlantillasFormularios(true);
    if (plantillas.length > 0) {
      setPlantilla(plantillas[0]);
      // Actualizar inspección con plantilla si no tiene
      if (!inspeccionData.plantillaFormularioId) {
        storage.updateInspeccion(inspeccionData.id, {
          plantillaFormularioId: plantillas[0].id,
        });
      }
    }

    setIsLoading(false);
  }, [solicitudId, user, router]);

  const cilindrosInspeccionados = inspeccionesCilindros.filter(ic =>
    ic.estado === EstadoInspeccion.COMPLETADA || ic.estado === EstadoInspeccion.APROBADA
  ).length;

  const progreso = cilindros.length > 0
    ? Math.round((cilindrosInspeccionados / cilindros.length) * 100)
    : 0;

  const obtenerEstadoCilindro = (cilindroId: string): EstadoInspeccion | null => {
    const inspeccionCilindro = inspeccionesCilindros.find(ic => ic.cilindroId === cilindroId);
    return inspeccionCilindro?.estado || null;
  };

  const handleCompletarInspeccion = async () => {
    if (!inspeccion) return;

    if (cilindrosInspeccionados < cilindros.length) {
      toast.error('Debes inspeccionar todos los cilindros antes de completar');
      return;
    }

    try {
      // Actualizar inspección
      storage.updateInspeccion(inspeccion.id, {
        estado: EstadoInspeccion.COMPLETADA,
        fechaCompletada: new Date().toISOString(),
      });

      // Actualizar solicitud
      storage.updateSolicitud(solicitudId, {
        estado: EstadoSolicitud.COMPLETADA,
      });

      toast.success('Inspección completada exitosamente');
      router.push('/tecnico/inspecciones');
    } catch (error) {
      console.error('Error completing inspection:', error);
      toast.error('Error al completar la inspección');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={TECNICO_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando inspección...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!solicitud || !vehiculo || !inspeccion) {
    return null;
  }

  return (
    <DashboardLayout sections={TECNICO_NAV} title="Inspección">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/tecnico/asignaciones">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              Inspección de Cilindros
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
            </p>
          </div>
        </div>

        {/* Progreso */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de la Inspección</CardTitle>
            <CardDescription>
              {cilindrosInspeccionados} de {cilindros.length} cilindros inspeccionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progreso} className="h-3" />
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-right">
                {progreso}% completado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Taller</p>
                <p className="font-semibold">{taller?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Propietario</p>
                <p className="font-semibold">{vehiculo.propietario}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Cédula</p>
                <p className="font-semibold">{vehiculo.documentoPropietario}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Teléfono</p>
                <p className="font-semibold">{vehiculo.telefonoPropietario || 'No especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Cilindros */}
        <Card>
          <CardHeader>
            <CardTitle>Cilindros para Inspeccionar</CardTitle>
            <CardDescription>
              Inspecciona cada cilindro individualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!plantilla ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  No hay formulario de inspección activo. Contacta al administrador.
                </p>
              </div>
            ) : cilindros.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  Este vehículo no tiene cilindros registrados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cilindros.map((cilindro, index) => {
                  const estadoCilindro = obtenerEstadoCilindro(cilindro.id);
                  const estaInspeccionado = estadoCilindro === EstadoInspeccion.COMPLETADA ||
                    estadoCilindro === EstadoInspeccion.APROBADA;

                  return (
                    <Card key={cilindro.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-4">
                          {/* Icono de estado */}
                          <div className="shrink-0">
                            {estaInspeccionado ? (
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            ) : (
                              <Circle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                            )}
                          </div>

                          {/* Información del cilindro */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                Cilindro {index + 1}
                              </h3>
                              {estaInspeccionado && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Inspeccionado
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-[hsl(var(--muted-foreground))]">Serie:</span>{' '}
                                <span className="font-medium">{cilindro.numeroSerie}</span>
                              </div>
                              <div>
                                <span className="text-[hsl(var(--muted-foreground))]">Capacidad:</span>{' '}
                                <span className="font-medium">{cilindro.capacidad}L</span>
                              </div>
                              <div>
                                <span className="text-[hsl(var(--muted-foreground))]">Fabricante:</span>{' '}
                                <span className="font-medium">{cilindro.fabricante}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botón de acción */}
                          <Link href={`/tecnico/inspecciones/${solicitudId}/cilindro/${cilindro.id}`}>
                            <Button size="tablet" variant={estaInspeccionado ? 'outline' : 'default'}>
                              {estaInspeccionado ? 'Ver' : 'Inspeccionar'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón Completar */}
        {cilindros.length > 0 && plantilla && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleCompletarInspeccion}
                disabled={cilindrosInspeccionados < cilindros.length}
                size="tablet"
                className="w-full gap-2"
              >
                <FileCheck className="h-5 w-5" />
                Completar Inspección
              </Button>
              {cilindrosInspeccionados < cilindros.length && (
                <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-2">
                  Debes inspeccionar todos los cilindros antes de completar
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
