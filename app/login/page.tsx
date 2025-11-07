'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@/types';
import { ROLE_ROUTES } from '@/lib/constants/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Inicio de sesión exitoso');

        // Obtener el usuario actualizado para redirigir según su rol
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const redirectPath = ROLE_ROUTES[currentUser.role as Role] || '/';

        router.push(redirectPath);
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md md:max-w-lg space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
            OINSTEC
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base">
            Plataforma de Inspección de Tanques GNV
          </p>
        </div>

        {/* Formulario de login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 md:h-14 text-base" // Tablet-optimized
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 md:h-14 text-base" // Tablet-optimized
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 md:h-14 text-base font-medium" // Tablet-optimized
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accesos rápidos de demostración */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Accesos Rápidos (Demo)</CardTitle>
            <CardDescription className="text-xs">
              Haz clic en un rol para autocompletar las credenciales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-12 md:h-14 text-sm md:text-base" // Tablet-optimized
              onClick={() => handleQuickLogin('admin@oinstec.com', 'admin123')}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">Super Administrador</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  admin@oinstec.com
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-12 md:h-14 text-sm md:text-base"
              onClick={() => handleQuickLogin('carlos@autogasexpress.com', 'taller123')}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">Admin Taller 1</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  carlos@autogasexpress.com
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-12 md:h-14 text-sm md:text-base"
              onClick={() => handleQuickLogin('maria@gnvsolutions.com', 'taller123')}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">Admin Taller 2</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  maria@gnvsolutions.com
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-12 md:h-14 text-sm md:text-base"
              onClick={() => handleQuickLogin('juan@oinstec.com', 'tecnico123')}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">Técnico 1</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  juan@oinstec.com
                </span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
          © 2024 OINSTEC. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
