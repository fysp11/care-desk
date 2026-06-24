import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'ghost' | 'outline' | 'secondary';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

const variantClasses = {
  default:
    'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/40',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  outline:
    'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
  secondary:
    'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
} satisfies Record<ButtonVariant, string>;

const sizeClasses = {
  default: 'h-9 px-4 py-2',
  lg: 'h-10 px-6',
  sm: 'h-8 px-3 text-xs',
} satisfies Record<ButtonSize, string>;

export function Button({
  className,
  size = 'default',
  type = 'button',
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
