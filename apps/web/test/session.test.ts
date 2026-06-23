import { describe, expect, test } from 'vitest';

import {
  SESSION_STORAGE_KEY,
  clearStoredSession,
  getJwtExpirySeconds,
  readStoredSession,
  saveStoredSession,
  type SessionStorageLike,
} from '../lib/session';

class MemoryStorage implements SessionStorageLike {
  private readonly values = new Map<string, string>();
  removeCount = 0;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.removeCount += 1;
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage implements SessionStorageLike {
  getItem(): string | null {
    throw new Error('get denied');
  }

  removeItem(): void {
    throw new Error('remove denied');
  }

  setItem(): void {
    throw new Error('set denied');
  }
}

class GetDeniedStorage implements SessionStorageLike {
  removeCount = 0;

  getItem(): string | null {
    throw new Error('get denied');
  }

  removeItem(): void {
    this.removeCount += 1;
  }

  setItem(): void {
    throw new Error('set denied');
  }
}

class RemoveDeniedStorage implements SessionStorageLike {
  removeAttempts = 0;

  constructor(private readonly value: string | null) {}

  getItem(): string | null {
    return this.value;
  }

  removeItem(): void {
    this.removeAttempts += 1;

    throw new Error('remove denied');
  }

  setItem(): void {
    throw new Error('set denied');
  }
}

const tokenWithExpiry = (exp: number): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');

  return `${header}.${payload}.signature`;
};

const tokenWithPayload = (payloadValue: unknown): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify(payloadValue)).toString(
    'base64url',
  );

  return `${header}.${payload}.signature`;
};

const jwtPayloadSegment = (payloadValue: unknown): string =>
  Buffer.from(JSON.stringify(payloadValue)).toString('base64url');

const tokenWithPayloadSegment = (payload: string): string =>
  `header.${payload}.signature`;

const unpaddedPayload = 'eyJleHAiOjEyfQ';
const payloadWithDash = 'eyJleHAiOjE4MDAwMDAwMDAsIm5vbmNlIjoiYGl-Mys-JiYifQ';
const payloadWithUnderscore =
  'eyJleHAiOjE4MDAwMDAwMDAsIm5vbmNlIjoiXjM_ajZMWHxtQiJ9';

const setStoredValue = (storage: MemoryStorage, value: unknown): void => {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
};

describe('browser session storage', () => {
  test('uses a stable browser storage key', () => {
    expect(SESSION_STORAGE_KEY).toBe('care-desk-session');
  });

  test('reads expiry only from valid JWT payloads', () => {
    expect(getJwtExpirySeconds(tokenWithExpiry(1_800_000_000))).toBe(
      1_800_000_000,
    );
    expect(getJwtExpirySeconds('not-a-jwt')).toBeNull();
    expect(
      getJwtExpirySeconds(`${tokenWithExpiry(1_800_000_000)}.extra`),
    ).toBeNull();
    expect(
      getJwtExpirySeconds(`.${jwtPayloadSegment({ exp: 1_800_000_000 })}.sig`),
    ).toBeNull();
    expect(
      getJwtExpirySeconds(`head.${jwtPayloadSegment({ exp: 1_800_000_000 })}.`),
    ).toBeNull();
    expect(getJwtExpirySeconds('header.payload.')).toBeNull();
    expect(getJwtExpirySeconds('header.not-json.signature')).toBeNull();
    expect(getJwtExpirySeconds('header.%%%.signature')).toBeNull();
    expect(
      getJwtExpirySeconds(tokenWithPayload({ exp: 'tomorrow' })),
    ).toBeNull();
    expect(getJwtExpirySeconds(tokenWithPayload({ exp: 1.5 }))).toBeNull();
    expect(getJwtExpirySeconds(tokenWithPayload({}))).toBeNull();
    expect(getJwtExpirySeconds(tokenWithPayload({ exp: {} }))).toBeNull();
    expect(
      getJwtExpirySeconds(
        tokenWithPayload({ exp: Number.MAX_SAFE_INTEGER + 1 }),
      ),
    ).toBeNull();
    expect(getJwtExpirySeconds(tokenWithPayload(null))).toBeNull();
    expect(getJwtExpirySeconds(tokenWithPayloadSegment(unpaddedPayload))).toBe(
      12,
    );
    expect(getJwtExpirySeconds(tokenWithPayloadSegment(payloadWithDash))).toBe(
      1_800_000_000,
    );
    expect(
      getJwtExpirySeconds(tokenWithPayloadSegment(payloadWithUnderscore)),
    ).toBe(1_800_000_000);
  });

  test('pads base64url JWT payloads for stricter browser decoders', () => {
    const originalAtob = globalThis.atob;

    globalThis.atob = ((value: string): string => {
      if (value.length % 4 !== 0) {
        throw new Error('strict base64 padding required');
      }

      return originalAtob(value);
    }) as typeof globalThis.atob;

    try {
      expect(getJwtExpirySeconds(tokenWithPayloadSegment(unpaddedPayload))).toBe(
        12,
      );
    } finally {
      globalThis.atob = originalAtob;
    }
  });

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

    saveStoredSession(storage, {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(readStoredSession(storage, { nowSeconds: 1_700_000_000 })).toEqual({
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    clearStoredSession(storage);

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
  });

  test('does not mutate storage when no session exists', () => {
    const storage = new MemoryStorage();

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(storage.removeCount).toBe(0);
  });

  test('treats denied browser session storage as unavailable', () => {
    const storage = new ThrowingStorage();

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(() =>
      saveStoredSession(storage, {
        token: tokenWithExpiry(1_800_000_000),
        user: {
          email: 'admin@example.com',
          role: 'admin',
        },
      }),
    ).not.toThrow();
    expect(() => clearStoredSession(storage)).not.toThrow();
  });

  test('keeps a best-effort in-memory session when storage writes are denied', () => {
    const storage = new ThrowingStorage();
    const session = {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'admin@example.com',
        role: 'admin' as const,
      },
    };

    saveStoredSession(storage, session);

    expect(readStoredSession(storage, { nowSeconds: 1_700_000_000 })).toEqual(
      session,
    );

    clearStoredSession(storage);

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
  });

  test('keeps a best-effort in-memory session when storage is unavailable', () => {
    const session = {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'admin@example.com',
        role: 'admin' as const,
      },
    };

    saveStoredSession(null, session);

    expect(readStoredSession(null, { nowSeconds: 1_700_000_000 })).toEqual(
      session,
    );

    clearStoredSession(null);

    expect(
      readStoredSession(null, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
  });

  test('does not clear storage when session reads are denied', () => {
    const storage = new GetDeniedStorage();

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(storage.removeCount).toBe(0);
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
    expect(expiredStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const malformedStorage = new MemoryStorage();
    malformedStorage.setItem(SESSION_STORAGE_KEY, '{not-json');

    expect(
      readStoredSession(malformedStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(malformedStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const emptyStorage = new MemoryStorage();
    emptyStorage.setItem(SESSION_STORAGE_KEY, '');

    expect(
      readStoredSession(emptyStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(emptyStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const nullStorage = new MemoryStorage();
    setStoredValue(nullStorage, null);

    expect(
      readStoredSession(nullStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(nullStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test('treats cleanup failures after malformed sessions as best effort', () => {
    const storage = new RemoveDeniedStorage('{not-json');

    expect(
      readStoredSession(storage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(storage.removeAttempts).toBe(1);
  });

  test('clears sessions with malformed user or token claims', () => {
    const invalidRoleStorage = new MemoryStorage();
    setStoredValue(invalidRoleStorage, {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 'user@example.com',
        role: 'owner',
      },
    });

    expect(
      readStoredSession(invalidRoleStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(invalidRoleStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const invalidTokenStorage = new MemoryStorage();
    saveStoredSession(invalidTokenStorage, {
      token: tokenWithPayload({ exp: 'tomorrow' }),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(invalidTokenStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(invalidTokenStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const invalidTokenWithNegativeClockStorage = new MemoryStorage();
    saveStoredSession(invalidTokenWithNegativeClockStorage, {
      token: tokenWithPayload({ exp: 'tomorrow' }),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(invalidTokenWithNegativeClockStorage, {
        nowSeconds: -1,
      }),
    ).toBeNull();
    expect(
      invalidTokenWithNegativeClockStorage.getItem(SESSION_STORAGE_KEY),
    ).toBeNull();

    const missingExpTokenStorage = new MemoryStorage();
    saveStoredSession(missingExpTokenStorage, {
      token: tokenWithPayload({}),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(missingExpTokenStorage, {
        nowSeconds: 1_700_000_000,
      }),
    ).toBeNull();
    expect(missingExpTokenStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const invalidEmailStorage = new MemoryStorage();
    setStoredValue(invalidEmailStorage, {
      token: tokenWithExpiry(1_800_000_000),
      user: {
        email: 42,
        role: 'user',
      },
    });

    expect(
      readStoredSession(invalidEmailStorage, { nowSeconds: 1_700_000_000 }),
    ).toBeNull();
    expect(invalidEmailStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const invalidTokenTypeStorage = new MemoryStorage();
    setStoredValue(invalidTokenTypeStorage, {
      token: 42,
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(invalidTokenTypeStorage, {
        nowSeconds: 1_700_000_000,
      }),
    ).toBeNull();
    expect(invalidTokenTypeStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test('uses the provided clock and treats exact expiry as expired', () => {
    const exactExpiryStorage = new MemoryStorage();
    saveStoredSession(exactExpiryStorage, {
      token: tokenWithExpiry(200),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(exactExpiryStorage, { nowSeconds: 200 }),
    ).toBeNull();
    expect(exactExpiryStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();

    const providedClockStorage = new MemoryStorage();
    saveStoredSession(providedClockStorage, {
      token: tokenWithExpiry(200),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(
      readStoredSession(providedClockStorage, { nowSeconds: 100 }),
    ).toEqual({
      token: tokenWithExpiry(200),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });
  });

  test('uses the current clock when no explicit clock is provided', () => {
    const storage = new MemoryStorage();
    const exp = Math.floor(Date.now() / 1000) + 60;

    saveStoredSession(storage, {
      token: tokenWithExpiry(exp),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });

    expect(readStoredSession(storage)).toEqual({
      token: tokenWithExpiry(exp),
      user: {
        email: 'user@example.com',
        role: 'user',
      },
    });
  });
});
