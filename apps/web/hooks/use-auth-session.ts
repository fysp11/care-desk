'use client';

import { useCallback, useEffect, useState } from 'react';

import { login } from '../lib/api';
import { toErrorMessage } from '../lib/api-error-message';
import { getBrowserStorage } from '../lib/browser-storage';
import {
  emptyLoginForm,
  validateLogin,
  type LoginErrors,
  type LoginFormState,
} from '../lib/login-form';
import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
  type StoredSession,
} from '../lib/session';

export function useAuthSession() {
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [loginForm, setLoginForm] =
    useState<LoginFormState>(emptyLoginForm);
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const browserStorage = getBrowserStorage();
    const storedSession = readStoredSession(browserStorage);

    if (storedSession) {
      setSession(storedSession);
    }

    setSessionReady(true);
  }, []);

  const handleAuthFailure = useCallback(() => {
    const browserStorage = getBrowserStorage();

    clearStoredSession(browserStorage);

    setSession(null);
    setAuthNotice(
      'Your session expired or was rejected. Please sign in again.',
    );
  }, []);

  const submitLogin = useCallback(
    async (credentials: LoginFormState): Promise<void> => {
      const errors = validateLogin(credentials.email, credentials.password);
      setLoginErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      setIsLoggingIn(true);
      setLoginError(null);

      try {
        const response = await login({
          email: credentials.email.trim(),
          password: credentials.password,
        });

        const nextSession = {
          token: response.token,
          user: response.user,
        };
        const browserStorage = getBrowserStorage();

        saveStoredSession(browserStorage, nextSession);

        setSession(nextSession);
        setAuthNotice(null);
        setLoginForm(emptyLoginForm);
      } catch (error) {
        setLoginError(toErrorMessage(error));
      } finally {
        setIsLoggingIn(false);
      }
    },
    [],
  );

  const updateLoginField = useCallback(
    (field: keyof LoginFormState, value: string) => {
      setLoginForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleLogout = useCallback(() => {
    const browserStorage = getBrowserStorage();

    clearStoredSession(browserStorage);

    setSession(null);
    setAuthNotice('You have signed out.');
  }, []);

  return {
    authNotice,
    handleAuthFailure,
    handleLogout,
    isLoggingIn,
    loginError,
    loginErrors,
    loginForm,
    session,
    sessionReady,
    submitLogin,
    updateLoginField,
  };
}
