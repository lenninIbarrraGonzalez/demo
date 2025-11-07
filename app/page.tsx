'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Role } from '@/types';
import { ROLE_ROUTES } from '@/lib/constants/roles';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Si está autenticado, redirigir a su dashboard
        const redirectPath = ROLE_ROUTES[user.role as Role] || '/login';
        router.push(redirectPath);
      } else {
        // Si no está autenticado, ir al login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Mostrar loading mientras se verifica autenticación
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">
          Cargando...
        </p>
      </div>
    </div>
  );
}
