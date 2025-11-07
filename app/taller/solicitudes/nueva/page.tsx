'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Car } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import { EstadoSolicitud } from '@/types';
import type { Vehiculo, Cilindro } from '@/types';

interface VehiculoWithCilindros extends Vehiculo {
  cilindros: Cilindro[];
}

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehiculos, setVehiculos] = useState<VehiculoWithCilindros[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (!user?.tallerId) return;

    const vehiculosData = storage.getAllVehiculos(user.tallerId);
    const vehiculosWithCilindros = vehiculosData.map(v => ({
      ...v,
      cilindros: storage.getAllCilindros(v.id)
    }));
    setVehiculos(vehiculosWithCilindros);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.tallerId || !user?.id) {
        toast.error('Error: Usuario no autenticado correctamente');
        setIsSubmitting(false);
        return;
      }

      if (!selectedVehiculo) {
        toast.error('Por favor selecciona un vehículo');
        setIsSubmitting(false);
        return;
      }

      // Verificar que el vehículo tenga cilindros
      const vehiculo = vehiculos.find(v => v.id === selectedVehiculo);
      if (!vehiculo) {
        toast.error('Vehículo no encontrado');
        setIsSubmitting(false);
        return;
      }

      if (vehiculo.cilindros.length === 0) {
        toast.error('El vehículo debe tener al menos un cilindro registrado');
        setIsSubmitting(false);
        return;
      }

      // Crear solicitud
      const nuevaSolicitud = storage.createSolicitud({
        tallerId: user.tallerId,
        vehiculoId: selectedVehiculo,
        solicitadoPor: user.id,
        estado: EstadoSolicitud.PENDIENTE,
        fechaSolicitud: new Date().toISOString(),
        observaciones: observaciones.trim() || undefined,
      });

      toast.success('Solicitud creada exitosamente');
      router.push('/taller/solicitudes');
    } catch (error) {
      console.error('Error creating solicitud:', error);
      toast.error('Error al crear la solicitud');
      setIsSubmitting(false);
    }
  };

  if (!user?.tallerId) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Nueva Solicitud">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no asociado a un taller
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Nueva Solicitud">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/taller/solicitudes">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Send className="h-8 w-8 md:h-10 md:w-10" />
              Nueva Solicitud de Inspección
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Solicita una inspección de tanques GNV para un vehículo
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Selección de Vehículo */}
            <Card>
              <CardHeader>
                <CardTitle>Selecciona el Vehículo</CardTitle>
                <CardDescription>
                  Elige el vehículo que necesita inspección de sus tanques GNV
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehiculos.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">
                      No tienes vehículos registrados
                    </p>
                    <Link href="/taller/vehiculos/nuevo">
                      <Button size="tablet">Registrar Vehículo</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehiculos.map((vehiculo) => (
                      <Card
                        key={vehiculo.id}
                        className={`cursor-pointer transition-all ${
                          selectedVehiculo === vehiculo.id
                            ? 'ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                            : 'hover:bg-[hsl(var(--accent))]'
                        }`}
                        onClick={() => setSelectedVehiculo(vehiculo.id)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{vehiculo.placa}</h3>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
                              </p>
                            </div>
                            <Badge variant={vehiculo.cilindros.length > 0 ? 'default' : 'destructive'}>
                              {vehiculo.cilindros.length} cilindro{vehiculo.cilindros.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[hsl(var(--muted-foreground))]">Propietario:</span>{' '}
                              {vehiculo.propietario}
                            </p>
                          </div>
                          {vehiculo.cilindros.length === 0 && (
                            <p className="text-xs text-red-600">
                              Este vehículo no tiene cilindros registrados
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observaciones */}
            {selectedVehiculo && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones (Opcional)</CardTitle>
                  <CardDescription>
                    Agrega cualquier información adicional relevante para la inspección
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ej: El propietario reporta un posible sonido extraño en uno de los cilindros..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            )}

            {/* Botones */}
            {vehiculos.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col-reverse md:flex-row gap-3">
                    <Link href="/taller/solicitudes" className="flex-1 md:flex-initial">
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
                      disabled={isSubmitting || !selectedVehiculo}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
