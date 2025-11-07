'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormRenderer } from '@/components/formularios/form-renderer';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { Inspeccion, Vehiculo, Taller, Usuario, Cilindro, InspeccionCilindro, PlantillaFormulario, Informe } from '@/types';

export default function DetalleInspeccionPage() {
  const params = useParams();
  const router = useRouter();
  const inspeccionId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [tecnico, setTecnico] = useState<Usuario | null>(null);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [inspeccionesCilindros, setInspeccionesCilindros] = useState<InspeccionCilindro[]>([]);
  const [plantilla, setPlantilla] = useState<PlantillaFormulario | null>(null);
  const [informe, setInforme] = useState<Informe | null>(null);

  useEffect(() => {
    if (!inspeccionId) return;

    const inspeccionData = storage.getInspeccionById(inspeccionId);
    if (!inspeccionData) {
      toast.error('Inspección no encontrada');
      router.push('/super-admin/inspecciones');
      return;
    }

    setInspeccion(inspeccionData);

    const vehiculoData = storage.getVehiculoById(inspeccionData.vehiculoId);
    const tallerData = vehiculoData ? storage.getTallerById(vehiculoData.tallerId) : null;
    const tecnicoData = storage.getUsuarioById(inspeccionData.tecnicoId);
    const cilindrosData = storage.getAllCilindros(inspeccionData.vehiculoId);
    const inspeccionesCilindrosData = storage.getAllInspeccionesCilindros(inspeccionData.id);
    const plantillaData = storage.getPlantillaFormularioById(inspeccionData.plantillaFormularioId);
    const informeData = storage.getInformeByInspeccionId(inspeccionId);

    setVehiculo(vehiculoData);
    setTaller(tallerData);
    setTecnico(tecnicoData);
    setCilindros(cilindrosData);
    setInspeccionesCilindros(inspeccionesCilindrosData);
    setPlantilla(plantillaData);
    setInforme(informeData);

    setIsLoading(false);
  }, [inspeccionId, router]);

  const handleGenerarInforme = async () => {
    if (!inspeccion || !vehiculo || !taller || !tecnico || !plantilla) return;

    setIsGenerating(true);

    try {
      const nuevoInforme = storage.createInforme({
        inspeccionId: inspeccion.id,
        tallerId: vehiculo.tallerId,
        vehiculoId: inspeccion.vehiculoId,
        generadoPor: 'Super Admin', // En producción usar user.id
        fechaGeneracion: new Date().toISOString(),
        contenidoHTML: '', // Se generará en el componente de visualización
        enviado: false,
      });

      if (nuevoInforme) {
        toast.success('Informe generado exitosamente');
        setInforme(nuevoInforme);
        router.push(`/super-admin/informes/${nuevoInforme.id}`);
      }
    } catch (error) {
      console.error('Error generating informe:', error);
      toast.error('Error al generar el informe');
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={SUPER_ADMIN_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando inspección...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!inspeccion || !vehiculo || !plantilla) {
    return null;
  }

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Detalle Inspección">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/inspecciones">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              Detalle de Inspección
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
            </p>
          </div>
          {!informe && (
            <Button
              onClick={handleGenerarInforme}
              disabled={isGenerating}
              size="tablet"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Generando...' : 'Generar Informe'}
            </Button>
          )}
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Taller</p>
                <p className="font-semibold">{taller?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Técnico</p>
                <p className="font-semibold">
                  {tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'Desconocido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Fecha de Inspección</p>
                <p className="font-semibold">
                  {new Date(inspeccion.fechaCompletada || inspeccion.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Formulario Utilizado</p>
                <p className="font-semibold">{plantilla.nombre}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Placa</p>
                <p className="font-semibold">{vehiculo.placa}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Marca/Modelo</p>
                <p className="font-semibold">{vehiculo.marca} {vehiculo.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Año</p>
                <p className="font-semibold">{vehiculo.año}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Propietario</p>
                <p className="font-semibold">{vehiculo.propietario}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspecciones de Cilindros */}
        <Card>
          <CardHeader>
            <CardTitle>Cilindros Inspeccionados ({inspeccionesCilindros.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {cilindros.map((cilindro, index) => {
                const inspeccionCilindro = inspeccionesCilindros.find(ic => ic.cilindroId === cilindro.id);

                return (
                  <Card key={cilindro.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Cilindro {index + 1} - Serie: {cilindro.numeroSerie}
                        </CardTitle>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Inspeccionado
                        </Badge>
                      </div>
                      <CardDescription>
                        {cilindro.capacidad}L - {cilindro.fabricante} ({cilindro.añoFabricacion})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {inspeccionCilindro ? (
                        <FormRenderer
                          plantilla={plantilla}
                          respuestas={inspeccionCilindro.respuestas || {}}
                          readonly={true}
                        />
                      ) : (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          No hay datos de inspección para este cilindro
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        {informe && (
          <Card>
            <CardContent className="pt-6">
              <Link href={`/super-admin/informes/${informe.id}`}>
                <Button size="tablet" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Ver Informe Generado
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
