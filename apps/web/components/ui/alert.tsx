import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: AlertVariant;
}

const variantClasses = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
  success: 'border-success/30 bg-success/10 text-foreground',
  warning: 'border-warning/40 bg-warning/15 text-foreground',
} satisfies Record<AlertVariant, string>;

export function Alert({
  className,
  variant = 'default',
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm shadow-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mb-1 font-semibold leading-none', className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm leading-relaxed', className)} {...props} />;
}
