import { LoginPageClient } from '../../components/auth/login-page-client';

const notices = {
  'session-expired': 'Your session expired or was rejected. Please sign in again.',
  'signed-out': 'You have signed out.',
} as const;

interface LoginPageProps {
  readonly searchParams: Promise<{
    readonly notice?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice =
    params.notice && params.notice in notices
      ? notices[params.notice as keyof typeof notices]
      : null;

  return <LoginPageClient initialNotice={notice} />;
}
