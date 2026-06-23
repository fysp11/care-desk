'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthSessionContext } from './auth-session-context';
import { Card, CardContent } from '@/components/ui/card';

const loginPathForNotice = (notice: string | null): string => {
  if (notice === 'You have signed out.') {
    return '/login?notice=signed-out';
  }

  if (notice) {
    return '/login?notice=session-expired';
  }

  return '/login';
};

export function ProtectedAppShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  const auth = useAuthSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (auth.sessionReady && !auth.session) {
      router.replace(loginPathForNotice(auth.authNotice));
    }
  }, [auth.authNotice, auth.session, auth.sessionReady, router]);

  if (!auth.sessionReady || !auth.session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <Card>
          <CardContent className="px-5 py-4 text-sm font-medium text-muted-foreground">
            Checking session...
          </CardContent>
        </Card>
      </main>
    );
  }

  return children;
}
