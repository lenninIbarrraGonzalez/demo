'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    propietario: '',
    documentoPropietario: '',
    telefonoPropietario: '',
    emailPropietario: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.tallerId) {
        toast.error('Error: Usuario no asociado a un taller');
        setIsSubmitting(false);
        return;
      }

      // Validaciones
      if (!formData.placa || !formData.marca || !formData.modelo || !formData.propietario || !formData.documentoPropietario) {
        toast.error('Por favor completa los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      // Verificar que la placa no exista
      const existente = storage.getVehiculoByPlaca(formData.placa, user.tallerId);
      if (existente) {
        toast.error('Ya existe un vehículo con esta placa');
        setIsSubmitting(false);
        return;
      }

      // Crear vehículo
      const nuevoVehiculo = storage.createVehiculo({
        tallerId: user.tallerId,
        placa: formData.placa.toUpperCase(),
        marca: formData.marca,
        modelo: formData.modelo,
        año: formData.año,
        propietario: formData.propietario,
        documentoPropietario: formData.documentoPropietario,
        telefonoPropietario: formData.telefonoPropietario,
        emailPropietario: formData.emailPropietario,
      });

      toast.success('Vehículo registrado exitosamente');
      router.push(`/taller/vehiculos/${nuevoVehiculo.id}`);
    } catch (error) {
      console.error('Error creating vehiculo:', error);
      toast.error('Error al registrar el vehículo');
      setIsSubmitting(false);
    }
  };

  if (!user?.tallerId) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Nuevo Vehículo">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no asociado a un taller
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Nuevo Vehículo">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/taller/vehiculos">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Car className="h-8 w-8 md:h-10 md:w-10" />
              Registrar Vehículo
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Registra un nuevo vehículo en tu taller
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Datos del Vehículo */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Vehículo</CardTitle>
                <CardDescription>
                  Información básica del vehículo. Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Placa */}
                  <div className="space-y-2">
                    <Label htmlFor="placa">
                      Placa <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="placa"
                      name="placa"
                      placeholder="PBX-1234"
                      value={formData.placa}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14 uppercase"
                      maxLength={10}
                    />
                  </div>

                  {/* Año */}
                  <div className="space-y-2">
                    <Label htmlFor="año">
                      Año <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="año"
                      name="año"
                      type="number"
                      placeholder="2020"
                      value={formData.año}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Marca */}
                  <div className="space-y-2">
                    <Label htmlFor="marca">
                      Marca <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="marca"
                      name="marca"
                      placeholder="Chevrolet"
                      value={formData.marca}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo">
                      Modelo <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="modelo"
                      name="modelo"
                      placeholder="Sail"
                      value={formData.modelo}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del Propietario */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Propietario</CardTitle>
                <CardDescription>
                  Información del propietario del vehículo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre Propietario */}
                  <div className="space-y-2">
                    <Label htmlFor="propietario">
                      Nombre Completo <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="propietario"
                      name="propietario"
                      placeholder="Roberto Andrade"
                      value={formData.propietario}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>

                  {/* Documento */}
                  <div className="space-y-2">
                    <Label htmlFor="documentoPropietario">
                      Cédula/RUC <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="documentoPropietario"
                      name="documentoPropietario"
                      placeholder="1712345678"
                      value={formData.documentoPropietario}
                      onChange={handleChange}
                      required
                      className="h-12 md:h-14"
                      maxLength={13}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefonoPropietario">Teléfono</Label>
                    <Input
                      id="telefonoPropietario"
                      name="telefonoPropietario"
                      type="tel"
                      placeholder="+593 98 555 6666"
                      value={formData.telefonoPropietario}
                      onChange={handleChange}
                      className="h-12 md:h-14"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="emailPropietario">Email</Label>
                    <Input
                      id="emailPropietario"
                      name="emailPropietario"
                      type="email"
                      placeholder="propietario@email.com"
                      value={formData.emailPropietario}
                      onChange={handleChange}
                      className="h-12 md:h-14"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col-reverse md:flex-row gap-3">
                  <Link href="/taller/vehiculos" className="flex-1 md:flex-initial">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrar Vehículo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
