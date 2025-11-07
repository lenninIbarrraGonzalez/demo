'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCog, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { Usuario } from '@/types';

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cambiarPassword: false,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!usuarioId) return;

    const usuarioData = storage.getUsuarioById(usuarioId);
    if (usuarioData) {
      setUsuario(usuarioData);
      setFormData({
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        email: usuarioData.email,
        telefono: usuarioData.telefono || '',
        cambiarPassword: false,
        password: '',
        confirmPassword: '',
      });
    } else {
      toast.error('Usuario no encontrado');
      router.push('/super-admin/usuarios');
    }

    setIsLoading(false);
  }, [usuarioId, router]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
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

      // Verificar que el email no exista (excepto el actual)
      const existingUser = storage.getUsuarioByEmail(formData.email);
      if (existingUser && existingUser.id !== usuarioId) {
        toast.error('Ya existe un usuario con este email');
        setIsSubmitting(false);
        return;
      }

      // Si se va a cambiar la contraseña, validarla
      if (formData.cambiarPassword) {
        if (!formData.password || formData.password.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          setIsSubmitting(false);
          return;
        }
      }

      // Actualizar usuario
      const updates: Partial<Usuario> = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.trim() || undefined,
      };

      // Si se cambió la contraseña, incluirla
      if (formData.cambiarPassword) {
        updates.password = formData.password;
      }

      const updated = storage.updateUsuario(usuarioId, updates);

      if (updated) {
        toast.success('Usuario actualizado exitosamente');
        router.push('/super-admin/usuarios');
      } else {
        toast.error('Error al actualizar el usuario');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error updating usuario:', error);
      toast.error('Error al actualizar el usuario');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const deleted = storage.deleteUsuario(usuarioId);
      if (deleted) {
        toast.success('Usuario eliminado exitosamente');
        router.push('/super-admin/usuarios');
      } else {
        toast.error('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error deleting usuario:', error);
      toast.error('Error al eliminar el usuario');
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

  if (!usuario) {
    return null;
  }

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Editar Usuario">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/usuarios">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <UserCog className="h-8 w-8 md:h-10 md:w-10" />
              Editar Usuario
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))]">
                {usuario.nombre} {usuario.apellido}
              </p>
              <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                {usuario.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
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
                  Actualiza los datos básicos del técnico
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

            {/* Cambiar Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Deja en blanco si no deseas cambiar la contraseña
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        handleChange('password', e.target.value);
                        handleChange('cambiarPassword', e.target.value.length > 0);
                      }}
                      placeholder="••••••••"
                      minLength={6}
                      className="h-12 md:h-14"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="h-12 md:h-14"
                      disabled={!formData.cambiarPassword}
                    />
                  </div>
                </div>
                {formData.cambiarPassword && (
                  <p className="text-xs text-yellow-600">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Botones */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col-reverse md:flex-row gap-3 md:justify-between">
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
                      {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="tablet"
                        className="gap-2"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar Usuario
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
                          <strong>
                            {usuario.nombre} {usuario.apellido}
                          </strong>{' '}
                          del sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Sí, eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
