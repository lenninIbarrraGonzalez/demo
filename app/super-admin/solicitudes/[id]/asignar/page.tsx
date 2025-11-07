'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import { EstadoSolicitud, Role } from '@/types';
import type { Solicitud, Vehiculo, Taller, Usuario } from '@/types';

export default function AsignarTecnicoPage() {
  const params = useParams();
  const router = useRouter();
  const solicitudId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [fechaProgramada, setFechaProgramada] = useState('');

  useEffect(() => {
    if (!solicitudId) return;

    const solicitudData = storage.getSolicitudById(solicitudId);
    if (solicitudData) {
      setSolicitud(solicitudData);
      const vehiculoData = storage.getVehiculoById(solicitudData.vehiculoId);
      const tallerData = storage.getTallerById(solicitudData.tallerId);
      setVehiculo(vehiculoData);
      setTaller(tallerData);

      // Cargar técnicos disponibles
      const tecnicosData = storage.getAllUsuarios(Role.TECNICO);
      setTecnicos(tecnicosData.filter(t => t.activo));

      // Preseleccionar datos si ya estaban asignados
      if (solicitudData.tecnicoAsignadoId) {
        setSelectedTecnico(solicitudData.tecnicoAsignadoId);
      }
      if (solicitudData.fechaProgramada) {
        setFechaProgramada(solicitudData.fechaProgramada.split('T')[0]);
      }
    } else {
      toast.error('Solicitud no encontrada');
      router.push('/super-admin/solicitudes');
    }

    setIsLoading(false);
  }, [solicitudId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedTecnico) {
        toast.error('Por favor selecciona un técnico');
        setIsSubmitting(false);
        return;
      }

      if (!fechaProgramada) {
        toast.error('Por favor selecciona una fecha');
        setIsSubmitting(false);
        return;
      }

      // Actualizar solicitud
      const updated = storage.updateSolicitud(solicitudId, {
        tecnicoAsignadoId: selectedTecnico,
        fechaProgramada: new Date(fechaProgramada).toISOString(),
        fechaAsignacion: new Date().toISOString(),
        estado: EstadoSolicitud.ASIGNADA,
      });

      if (updated) {
        toast.success('Técnico asignado exitosamente');
        router.push('/super-admin/solicitudes');
      } else {
        toast.error('Error al asignar el técnico');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error asignando técnico:', error);
      toast.error('Error al asignar el técnico');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={SUPER_ADMIN_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!solicitud || !vehiculo || !taller) {
    return null;
  }

  const cilindros = storage.getAllCilindros(vehiculo.id);

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Asignar Técnico">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/solicitudes">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <UserCheck className="h-8 w-8 md:h-10 md:w-10" />
              Asignar Técnico
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Asigna un técnico y programa la inspección
            </p>
          </div>
        </div>

        {/* Información de la Solicitud */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Taller</Label>
                <p className="text-lg font-semibold mt-1">{taller.nombre}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Vehículo</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.placa}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Propietario</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.propietario}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Cilindros</Label>
                <p className="text-lg font-semibold mt-1">
                  {cilindros.length} cilindro{cilindros.length !== 1 ? 's' : ''}
                </p>
              </div>
              {solicitud.observaciones && (
                <div className="md:col-span-2">
                  <Label className="text-[hsl(var(--muted-foreground))]">Observaciones</Label>
                  <p className="text-sm mt-1 p-3 bg-[hsl(var(--muted))] rounded-md">
                    {solicitud.observaciones}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario de Asignación */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Asignar Técnico y Programar</CardTitle>
              <CardDescription>
                Selecciona el técnico que realizará la inspección y programa la fecha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selección de Técnico */}
              <div className="space-y-3">
                <Label>
                  Seleccionar Técnico <span className="text-red-600">*</span>
                </Label>
                {tecnicos.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    No hay técnicos disponibles
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tecnicos.map((tecnico) => (
                      <Card
                        key={tecnico.id}
                        className={`cursor-pointer transition-all ${
                          selectedTecnico === tecnico.id
                            ? 'ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                            : 'hover:bg-[hsl(var(--accent))]'
                        }`}
                        onClick={() => setSelectedTecnico(tecnico.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {tecnico.nombre} {tecnico.apellido}
                            </h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                              {tecnico.email}
                            </p>
                            {tecnico.telefono && (
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                {tecnico.telefono}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Fecha Programada */}
              {selectedTecnico && (
                <div className="space-y-2">
                  <Label htmlFor="fechaProgramada">
                    Fecha Programada <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="fechaProgramada"
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="h-12 md:h-14"
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Selecciona la fecha en que se realizará la inspección
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
                <Link href="/super-admin/solicitudes" className="flex-1 md:flex-initial">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto"
                    size="tablet"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 md:flex-initial md:min-w-[200px]"
                  size="tablet"
                  disabled={isSubmitting || !selectedTecnico || !fechaProgramada}
                >
                  {isSubmitting ? 'Asignando...' : 'Asignar Técnico'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
