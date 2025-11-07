'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormRenderer } from '@/components/formularios/form-renderer';
import { TECNICO_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import { EstadoInspeccion } from '@/types';
import type { Solicitud, Vehiculo, Cilindro, Inspeccion, InspeccionCilindro, PlantillaFormulario } from '@/types';

export default function InspeccionCilindroPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const solicitudId = params?.id as string;
  const cilindroId = params?.cilindroId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cilindro, setCilindro] = useState<Cilindro | null>(null);
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [inspeccionCilindro, setInspeccionCilindro] = useState<InspeccionCilindro | null>(null);
  const [plantilla, setPlantilla] = useState<PlantillaFormulario | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!solicitudId || !cilindroId || !user?.id) return;

    const solicitudData = storage.getSolicitudById(solicitudId);
    if (!solicitudData || solicitudData.tecnicoAsignadoId !== user.id) {
      toast.error('No tienes permiso para ver esta inspección');
      router.push('/tecnico/asignaciones');
      return;
    }

    setSolicitud(solicitudData);

    const vehiculoData = storage.getVehiculoById(solicitudData.vehiculoId);
    const cilindroData = storage.getCilindroById(cilindroId);

    setVehiculo(vehiculoData);
    setCilindro(cilindroData);

    // Obtener inspección principal
    const inspeccionData = storage.getInspeccionBySolicitudId(solicitudId);
    if (!inspeccionData) {
      toast.error('Inspección no encontrada');
      router.push('/tecnico/asignaciones');
      return;
    }

    setInspeccion(inspeccionData);

    // Obtener plantilla
    const plantillaData = storage.getPlantillaFormularioById(inspeccionData.plantillaFormularioId);
    if (!plantillaData) {
      toast.error('Formulario de inspección no encontrado');
      router.push(`/tecnico/inspecciones/${solicitudId}`);
      return;
    }

    setPlantilla(plantillaData);

    // Obtener o crear inspección de cilindro
    const inspeccionesCilindros = storage.getAllInspeccionesCilindros(inspeccionData.id);
    let inspeccionCilindroData = inspeccionesCilindros.find(ic => ic.cilindroId === cilindroId);

    if (!inspeccionCilindroData) {
      // Crear nueva inspección de cilindro
      inspeccionCilindroData = storage.createInspeccionCilindro({
        inspeccionId: inspeccionData.id,
        cilindroId: cilindroId,
        respuestas: {},
        estado: EstadoInspeccion.EN_PROCESO,
      });
    }

    setInspeccionCilindro(inspeccionCilindroData);
    setRespuestas(inspeccionCilindroData.respuestas || {});

    setIsLoading(false);
  }, [solicitudId, cilindroId, user, router]);

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    if (!inspeccionCilindro || Object.keys(respuestas).length === 0) return;

    const interval = setInterval(() => {
      storage.updateInspeccionCilindro(inspeccionCilindro.id, {
        respuestas: respuestas,
        updatedAt: new Date().toISOString(),
      });
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [inspeccionCilindro, respuestas]);

  const handleRespuestasChange = (nuevasRespuestas: Record<string, any>) => {
    setRespuestas(nuevasRespuestas);
  };

  const handleGuardar = async (completar: boolean = false) => {
    if (!inspeccionCilindro) return;

    setIsSaving(true);

    try {
      // Validar campos obligatorios si se va a completar
      if (completar && plantilla) {
        const camposObligatorios = plantilla.campos.filter(c => c.required);
        const faltantes = camposObligatorios.filter(c => {
          const valor = respuestas[c.id];
          return !valor || valor === '' || (Array.isArray(valor) && valor.length === 0);
        });

        if (faltantes.length > 0) {
          toast.error(`Faltan campos obligatorios: ${faltantes.map(c => c.label).join(', ')}`);
          setIsSaving(false);
          return;
        }
      }

      // Guardar inspección de cilindro
      storage.updateInspeccionCilindro(inspeccionCilindro.id, {
        respuestas: respuestas,
        estado: completar ? EstadoInspeccion.COMPLETADA : EstadoInspeccion.EN_PROCESO,
        updatedAt: new Date().toISOString(),
      });

      if (completar) {
        toast.success('Inspección del cilindro completada');
        router.push(`/tecnico/inspecciones/${solicitudId}`);
      } else {
        toast.success('Progreso guardado');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast.error('Error al guardar la inspección');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={TECNICO_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando formulario...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!solicitud || !vehiculo || !cilindro || !inspeccion || !plantilla || !inspeccionCilindro) {
    return null;
  }

  const estaCompleta = inspeccionCilindro.estado === EstadoInspeccion.COMPLETADA ||
    inspeccionCilindro.estado === EstadoInspeccion.APROBADA;

  return (
    <DashboardLayout sections={TECNICO_NAV} title="Inspección de Cilindro">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/tecnico/inspecciones/${solicitudId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              Inspección de Cilindro
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.placa} - Serie: {cilindro.numeroSerie}
            </p>
          </div>
        </div>

        {/* Información del Cilindro */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Datos del Cilindro</CardTitle>
                <CardDescription>Formulario: {plantilla.nombre}</CardDescription>
              </div>
              {estaCompleta && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Completada
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Serie</p>
                <p className="font-semibold">{cilindro.numeroSerie}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Capacidad</p>
                <p className="font-semibold">{cilindro.capacidad}L</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Fabricante</p>
                <p className="font-semibold">{cilindro.fabricante}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Año</p>
                <p className="font-semibold">{cilindro.añoFabricacion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Inspección</CardTitle>
            <CardDescription>
              {estaCompleta
                ? 'Inspección completada - Solo lectura'
                : 'Completa todos los campos obligatorios'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRenderer
              plantilla={plantilla}
              respuestas={respuestas}
              onRespuestasChange={handleRespuestasChange}
              readonly={estaCompleta}
            />
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        {!estaCompleta && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col-reverse md:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGuardar(false)}
                  disabled={isSaving}
                  size="tablet"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Progreso'}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleGuardar(true)}
                  disabled={isSaving}
                  size="tablet"
                  className="flex-1 md:flex-initial md:min-w-[200px] gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Completar Inspección
                </Button>
              </div>
              <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-3">
                El progreso se guarda automáticamente cada 30 segundos
              </p>
            </CardContent>
          </Card>
        )}

        {estaCompleta && (
          <Card>
            <CardContent className="pt-6">
              <Link href={`/tecnico/inspecciones/${solicitudId}`}>
                <Button size="tablet" className="w-full">
                  Volver a la Lista de Cilindros
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
