import { describe, expect, test } from 'bun:test';

import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
  type SessionStorageLike,
} from '../lib/session';

class MemoryStorage implements SessionStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const tokenWithExpiry = (exp: number): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');

  return `${header}.${payload}.signature`;
};

describe('browser session storage', () => {
  test('saves, reads, and clears a session', () => {
    const storage = new MemoryStorage();

    saveStoredSession(storage, {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'admin@example.com',
        role: 'admin',
      },
    });

    expect(readStoredSession(storage, { nowSeconds: 1_700_000_000 })).toEqual({
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'admin@example.com',
        role: 'admin',
      },
    });

    clearStoredSession(storage);

    expect(readStoredSession(storage, { nowSeconds: 1_700_000_000 })).toBeNull();
  });

  test('clears expired or malformed sessions', () => {
    const expiredStorage = new MemoryStorage();
    saveStoredSession(expiredStorage, {
      token: tokenWithExpiry(1_600_000_000),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(expiredStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(expiredStorage.getItem('care-desk-session')).toBeNull();

    const malformedStorage = new MemoryStorage();
    malformedStorage.setItem('care-desk-session', '{not-json');

    expect(
      readStoredSession(malformedStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(malformedStorage.getItem('care-desk-session')).toBeNull();
  });
});
