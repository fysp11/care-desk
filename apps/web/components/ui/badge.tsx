import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'outline' | 'secondary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
}

const variantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground',
  outline: 'border-border text-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
} satisfies Record<BadgeVariant, string>;

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-normal',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
