import type { ReactNode } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

const toneVariants = {
  error: 'destructive',
  info: 'default',
  success: 'success',
  warning: 'warning',
} as const;

interface StatusMessageProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly tone?: keyof typeof toneVariants;
}

export function StatusMessage({
  children,
  title,
  tone = 'info',
}: StatusMessageProps) {
  return (
    <Alert
      role={tone === 'error' ? 'alert' : 'status'}
      variant={toneVariants[tone]}
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
