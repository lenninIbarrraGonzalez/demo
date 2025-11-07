'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';

export default function NuevoTallerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    responsable: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.ruc || !formData.email) {
        toast.error('Por favor completa los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      // Crear taller
      const nuevoTaller = storage.createTaller({
        nombre: formData.nombre,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        responsable: formData.responsable,
        activo: true,
      });

      toast.success('Taller creado exitosamente');
      router.push('/super-admin/talleres');
    } catch (error) {
      console.error('Error creating taller:', error);
      toast.error('Error al crear el taller');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Nuevo Taller">
      <div className="space-y-6 md:space-y-8">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/talleres">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Building2 className="h-8 w-8 md:h-10 md:w-10" />
              Nuevo Taller
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Registra un nuevo taller en la plataforma
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Taller</CardTitle>
              <CardDescription>
                Completa los datos del taller. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre del Taller <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: AutoGas Express"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="h-12 md:h-14"
                />
              </div>

              {/* RUC */}
              <div className="space-y-2">
                <Label htmlFor="ruc">
                  RUC <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="ruc"
                  name="ruc"
                  placeholder="Ej: 1791234567001"
                  value={formData.ruc}
                  onChange={handleChange}
                  required
                  className="h-12 md:h-14"
                />
              </div>

              {/* Grid de 2 columnas para tablet+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contacto@taller.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 md:h-14"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+593 2 245 6789"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="h-12 md:h-14"
                  />
                </div>
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <Label htmlFor="responsable">Nombre del Responsable</Label>
                <Input
                  id="responsable"
                  name="responsable"
                  placeholder="Ej: Carlos Méndez"
                  value={formData.responsable}
                  onChange={handleChange}
                  className="h-12 md:h-14"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  placeholder="Av. Principal 123 y Calle Secundaria"
                  value={formData.direccion}
                  onChange={handleChange}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
                <Link href="/super-admin/talleres" className="flex-1 md:flex-initial">
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
                  {isSubmitting ? 'Creando...' : 'Crear Taller'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
