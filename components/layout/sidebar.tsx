'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, type LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  sections: NavSection[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ sections, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 md:w-80 border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 lg:z-30",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 md:h-20 items-center justify-between border-b border-[hsl(var(--border))] px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-base">
                O
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  OINSTEC
                </h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Inspección GNV
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-2">
                {section.title && (
                  <>
                    <h3 className="px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <Separator className="my-2" />
                  </>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                      <Link key={item.href} href={item.href} onClick={onClose}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start gap-3 h-12 md:h-14 text-base font-medium', // Tablet-optimized
                            isActive &&
                              'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90'
                          )}
                        >
                          <Icon className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-semibold rounded-full',
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-[hsl(var(--border))] p-4 md:p-6">
            <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
              © 2024 OINSTEC
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
