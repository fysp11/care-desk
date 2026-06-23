import { describe, expect, test } from 'vitest';

import { getBrowserStorage } from '../lib/browser-storage';

const memoryStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
} as Storage;

describe('browser storage access', () => {
  test('returns localStorage when the browser exposes it', () => {
    expect(getBrowserStorage({ localStorage: memoryStorage })).toBe(
      memoryStorage,
    );
  });

  test('returns null when no browser window or localStorage is available', () => {
    expect(getBrowserStorage(undefined)).toBeNull();
    expect(getBrowserStorage({ localStorage: null })).toBeNull();
  });

  test('returns null when localStorage access throws', () => {
    const blockedWindow = Object.create(null, {
      localStorage: {
        get() {
          throw new Error('storage denied');
        },
      },
    }) as { readonly localStorage: Storage };

    expect(getBrowserStorage(blockedWindow)).toBeNull();
  });
});
