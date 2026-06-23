'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import { useAuthSession } from '../../hooks/use-auth-session';

type AuthSessionContextValue = ReturnType<typeof useAuthSession>;

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const auth = useAuthSession();

  return (
    <AuthSessionContext.Provider value={auth}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSessionContext(): AuthSessionContextValue {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error(
      'useAuthSessionContext must be used inside AuthSessionProvider.',
    );
  }

  return value;
}
