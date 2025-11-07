'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/contexts/theme-context';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 md:h-12 md:w-12"
      title={`Tema actual: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}`}
    >
      <Sun className="h-5 w-5 md:h-6 md:w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 md:h-6 md:w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
