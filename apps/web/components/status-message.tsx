import type { ReactNode } from 'react';

const toneClasses = {
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
} as const;

interface StatusMessageProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly tone?: keyof typeof toneClasses;
}

export function StatusMessage({
  children,
  title,
  tone = 'info',
}: StatusMessageProps) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm shadow-sm ${toneClasses[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-1' : undefined}>{children}</div>
    </div>
  );
}
