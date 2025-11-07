'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="flex h-16 md:h-20 items-center gap-4 px-4 md:px-6">
        {/* Menu button para mobile/tablet */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 md:h-12 md:w-12"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 md:h-6 md:w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-sm md:text-base">
            O
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-semibold text-[hsl(var(--foreground))]">
              {title || 'OINSTEC'}
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
