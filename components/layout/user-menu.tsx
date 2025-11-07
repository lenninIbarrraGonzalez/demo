'use client';

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { ROLE_LABELS } from '@/lib/constants/roles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = () => {
    return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 md:h-12 px-2 md:px-4"
        >
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm md:text-base font-semibold">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.nombre} ${user.apellido}`}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium leading-none">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs leading-none text-[hsl(var(--muted-foreground))]">
              {user.email}
            </p>
            <Badge variant="secondary" className="w-fit mt-2">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer py-2">
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 py-2"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
