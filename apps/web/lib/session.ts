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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRole = (value: unknown): value is UserRole =>
  value === 'admin' || value === 'user';

const parseStoredSession = (value: unknown): StoredSession | null => {
  if (!isRecord(value) || typeof value.token !== 'string') {
    return null;
  }

  const user = value.user;

  if (
    !isRecord(user) ||
    typeof user.email !== 'string' ||
    !isRole(user.role)
  ) {
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
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

  return globalThis.atob(padded);
};

export const getJwtExpirySeconds = (token: string): number | null => {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as unknown;

    if (!isRecord(parsed) || typeof parsed.exp !== 'number') {
      return null;
    }

    return parsed.exp;
  } catch {
    return null;
  }
};

export const clearStoredSession = (storage: SessionStorageLike): void => {
  storage.removeItem(SESSION_STORAGE_KEY);
};

export const saveStoredSession = (
  storage: SessionStorageLike,
  session: StoredSession,
): void => {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const readStoredSession = (
  storage: SessionStorageLike,
  options: ReadSessionOptions = {},
): StoredSession | null => {
  const storedValue = storage.getItem(SESSION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const session = parseStoredSession(JSON.parse(storedValue));
    const nowSeconds =
      options.nowSeconds ?? Math.floor(globalThis.Date.now() / 1000);
    const exp = session ? getJwtExpirySeconds(session.token) : null;

    if (!session || !exp || exp <= nowSeconds) {
      clearStoredSession(storage);

      return null;
    }

    return session;
  } catch {
    clearStoredSession(storage);

    return null;
  }
};
