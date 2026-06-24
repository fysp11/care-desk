import type { AuthUser, UserRole } from './types';

export const SESSION_STORAGE_KEY = 'care-desk-session';

export interface SessionStorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface StoredSession {
  readonly token: string;
  readonly user: AuthUser;
}

interface ReadSessionOptions {
  readonly nowSeconds?: number;
}

declare global {
  var __careDeskVolatileSession: StoredSession | null | undefined;
}

const getVolatileSession = (): StoredSession | null =>
  globalThis.__careDeskVolatileSession ?? null;

const setVolatileSession = (session: StoredSession): void => {
  globalThis.__careDeskVolatileSession = session;
};

const clearVolatileSession = (): void => {
  globalThis.__careDeskVolatileSession = null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRole = (value: unknown): value is UserRole =>
  value === 'admin' || value === 'user';

const isSafeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value);

const parseStoredSession = (value: unknown): StoredSession | null => {
  if (!isRecord(value) || typeof value.token !== 'string') {
    return null;
  }

  const user = value.user;

  if (!isRecord(user) || typeof user.email !== 'string' || !isRole(user.role)) {
    return null;
  }

  return {
    token: value.token,
    user: {
      email: user.email,
      role: user.role,
    },
  };
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  return globalThis.atob(padded);
};

export const getJwtExpirySeconds = (token: string): number | null => {
  const parts = token.split('.');

  if (parts.length !== 3 || parts.some((part) => !part)) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(decodeBase64Url(parts[1] ?? '')) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !isSafeInteger(parsed.exp)) {
    return null;
  }

  return parsed.exp;
};

export const clearStoredSession = (
  storage: SessionStorageLike | null,
): void => {
  clearVolatileSession();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
};

export const saveStoredSession = (
  storage: SessionStorageLike | null,
  session: StoredSession,
): void => {
  setVolatileSession(session);

  if (!storage) {
    return;
  }

  try {
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Persisting the session is best-effort; in-memory auth state still works.
  }
};

export const readStoredSession = (
  storage: SessionStorageLike | null,
  options: ReadSessionOptions = {},
): StoredSession | null => {
  const readVolatileSession = (): StoredSession | null => {
    const session = getVolatileSession();

    if (!session) {
      return null;
    }

    const nowSeconds =
      options.nowSeconds ?? Math.floor(globalThis.Date.now() / 1000);
    const exp = getJwtExpirySeconds(session.token);

    if (exp === null || exp <= nowSeconds) {
      clearVolatileSession();

      return null;
    }

    return session;
  };

  if (!storage) {
    return readVolatileSession();
  }

  let storedValue: string | null;

  try {
    storedValue = storage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return readVolatileSession();
  }

  if (storedValue === null) {
    return readVolatileSession();
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue) as unknown;
  } catch {
    clearStoredSession(storage);

    return null;
  }

  const session = parseStoredSession(parsedValue);

  if (!session) {
    clearStoredSession(storage);

    return null;
  }

  const nowSeconds =
    options.nowSeconds ?? Math.floor(globalThis.Date.now() / 1000);
  const exp = getJwtExpirySeconds(session.token);

  if (exp === null) {
    clearStoredSession(storage);

    return null;
  }

  if (exp <= nowSeconds) {
    clearStoredSession(storage);

    return null;
  }

  return session;
};
