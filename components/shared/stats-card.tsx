import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm md:text-base font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--muted-foreground))]" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
          {value}
        </div>
        {description && (
          <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs md:text-sm font-medium mt-2',
              trend.value > 0
                ? 'text-green-600 dark:text-green-400'
                : trend.value < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-[hsl(var(--muted-foreground))]'
            )}
          >
            {trend.value > 0 && '+'}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
