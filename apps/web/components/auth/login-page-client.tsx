'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthSession } from '../../hooks/use-auth-session';
import { LoginPanel } from '../login-panel';
import { Card, CardContent } from '@/components/ui/card';

export function LoginPageClient({
  initialNotice,
}: {
  readonly initialNotice: string | null;
}) {
  const auth = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (auth.sessionReady && auth.session) {
      router.replace('/patients');
    }
  }, [auth.session, auth.sessionReady, router]);

  if (!auth.sessionReady || auth.session) {
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

  return (
    <LoginPanel
      authNotice={auth.authNotice ?? initialNotice}
      errors={auth.loginErrors}
      form={auth.loginForm}
      isLoggingIn={auth.isLoggingIn}
      loginError={auth.loginError}
      onDemoLogin={(credentials) => void auth.submitLogin(credentials)}
      onFieldChange={auth.updateLoginField}
      onSubmit={(credentials) => void auth.submitLogin(credentials)}
    />
  );
}
