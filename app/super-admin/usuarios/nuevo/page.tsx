'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import { Role } from '@/types';

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error('Por favor completa todos los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('El email no es válido');
        setIsSubmitting(false);
        return;
      }

      // Verificar que el email no exista
      const existingUser = storage.getUsuarioByEmail(formData.email);
      if (existingUser) {
        toast.error('Ya existe un usuario con este email');
        setIsSubmitting(false);
        return;
      }

      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsSubmitting(false);
        return;
      }

      // Validar longitud de contraseña
      if (formData.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        setIsSubmitting(false);
        return;
      }

      // Crear usuario
      storage.createUsuario({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.trim() || undefined,
        password: formData.password, // En producción: usar bcrypt
        role: Role.TECNICO,
        activo: true,
      });

      toast.success('Usuario creado exitosamente');
      router.push('/super-admin/usuarios');
    } catch (error) {
      console.error('Error creating usuario:', error);
      toast.error('Error al crear el usuario');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Nuevo Usuario">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/usuarios">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <UserPlus className="h-8 w-8 md:h-10 md:w-10" />
              Nuevo Usuario OINSTEC
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Registra un nuevo técnico de inspección
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Datos básicos del técnico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Juan"
                      required
                      className="h-12 md:h-14"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido">
                      Apellido <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                      placeholder="Pérez"
                      required
                      className="h-12 md:h-14"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="juan.perez@oinstec.com"
                      required
                      className="h-12 md:h-14"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Este será el usuario para iniciar sesión
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="+593 99 999 9999"
                      className="h-12 md:h-14"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle>Contraseña</CardTitle>
                <CardDescription>
                  Define la contraseña de acceso (mínimo 6 caracteres)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Contraseña <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-12 md:h-14"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Contraseña <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
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
                  <Link href="/super-admin/usuarios" className="flex-1 md:flex-initial">
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
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
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
