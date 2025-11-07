'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { Taller } from '@/types';

export default function EditarTallerPage() {
  const router = useRouter();
  const params = useParams();
  const tallerId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    responsable: '',
    activo: true,
  });

  useEffect(() => {
    if (tallerId) {
      const data = storage.getTallerById(tallerId);
      if (data) {
        setTaller(data);
        setFormData({
          nombre: data.nombre,
          ruc: data.ruc,
          direccion: data.direccion,
          telefono: data.telefono,
          email: data.email,
          responsable: data.responsable,
          activo: data.activo,
        });
      } else {
        toast.error('Taller no encontrado');
        router.push('/super-admin/talleres');
      }
      setIsLoading(false);
    }
  }, [tallerId, router]);

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

      // Actualizar taller
      const updated = storage.updateTaller(tallerId, formData);

      if (updated) {
        toast.success('Taller actualizado exitosamente');
        router.push('/super-admin/talleres');
      } else {
        toast.error('Error al actualizar el taller');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error updating taller:', error);
      toast.error('Error al actualizar el taller');
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

  if (!taller) {
    return null;
  }

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Editar Taller">
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
              Editar Taller
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Modifica los datos del taller
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Taller</CardTitle>
              <CardDescription>
                Actualiza los datos del taller. Los campos marcados con * son obligatorios.
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

              {/* Estado Activo */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))]">
                <div className="space-y-0.5">
                  <Label htmlFor="activo">Estado del Taller</Label>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formData.activo
                      ? 'El taller está activo y puede operar'
                      : 'El taller está desactivado'}
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, activo: checked })
                  }
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
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
