import { describe, expect, test } from 'bun:test';

import { ApiError } from '../lib/api';
import {
  FAILURE_SIMULATION_STORAGE_KEY,
  createSimulatedApiError,
  defaultFailureSimulationSettings,
  isLocalFailureSimulationHost,
  normalizeFailureSimulationSettings,
  readFailureSimulationSettings,
  saveFailureSimulationSettings,
  shouldSimulateFailure,
  shouldSimulateLatency,
  withFailureSimulation,
  type FailureSimulationSettings,
  type FailureSimulationStorageLike,
} from '../lib/failure-simulation';

class MemoryStorage implements FailureSimulationStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage implements FailureSimulationStorageLike {
  getItem(): string | null {
    throw new Error('get denied');
  }

  setItem(): void {
    throw new Error('set denied');
  }
}

const enabledListFailure: FailureSimulationSettings = {
  enabled: true,
  latencyMs: 0,
  target: 'list',
};

describe('failure simulation helpers', () => {
  test('keeps simulation local-only and disabled by default', () => {
    expect(isLocalFailureSimulationHost('localhost')).toBe(true);
    expect(isLocalFailureSimulationHost('::1')).toBe(true);
    expect(isLocalFailureSimulationHost('[::1]')).toBe(true);
    expect(isLocalFailureSimulationHost('127.0.0.1')).toBe(true);
    expect(isLocalFailureSimulationHost('127.100.0.1')).toBe(true);
    expect(isLocalFailureSimulationHost('127.240.0.1')).toBe(true);
    expect(isLocalFailureSimulationHost('127.255.255.255')).toBe(true);
    expect(isLocalFailureSimulationHost('app.example.com')).toBe(false);
    expect(isLocalFailureSimulationHost('x127.0.0.1')).toBe(false);
    expect(isLocalFailureSimulationHost('127.example.com')).toBe(false);
    expect(isLocalFailureSimulationHost('127.0.0.1.evil')).toBe(false);
    expect(isLocalFailureSimulationHost('127.09.0.1')).toBe(false);
    expect(isLocalFailureSimulationHost('127.0.0')).toBe(false);
    expect(isLocalFailureSimulationHost('127.0.0.256')).toBe(false);
    expect(normalizeFailureSimulationSettings(undefined)).toEqual(
      defaultFailureSimulationSettings,
    );
  });

  test('normalizes persisted settings without trusting malformed values', () => {
    expect(
      normalizeFailureSimulationSettings({
        enabled: true,
        latencyMs: 999_999,
        target: 'delete',
      }),
    ).toEqual({
      enabled: true,
      latencyMs: 3_000,
      target: 'delete',
    });

    expect(
      normalizeFailureSimulationSettings({
        enabled: 'yes',
        latencyMs: -20,
        target: 'unknown',
      }),
    ).toEqual({
      enabled: false,
      latencyMs: 0,
      target: 'list',
    });

    expect(
      normalizeFailureSimulationSettings({
        enabled: true,
        latencyMs: '250',
        target: 'list',
      }),
    ).toEqual({
      enabled: true,
      latencyMs: defaultFailureSimulationSettings.latencyMs,
      target: 'list',
    });

    expect(
      normalizeFailureSimulationSettings({
        enabled: true,
        latencyMs: Number.NaN,
        target: 'all',
      }),
    ).toEqual({
      enabled: true,
      latencyMs: defaultFailureSimulationSettings.latencyMs,
      target: 'all',
    });

    expect(
      normalizeFailureSimulationSettings({
        enabled: true,
        latencyMs: Number.POSITIVE_INFINITY,
        target: 'list',
      }),
    ).toEqual({
      enabled: true,
      latencyMs: defaultFailureSimulationSettings.latencyMs,
      target: 'list',
    });

    expect(
      normalizeFailureSimulationSettings({
        enabled: true,
        latencyMs: 299.6,
        target: 'detail',
      }),
    ).toEqual({
      enabled: true,
      latencyMs: 300,
      target: 'detail',
    });

    expect(
      normalizeFailureSimulationSettings({
        target: 'edit',
      }),
    ).toEqual({
      enabled: false,
      latencyMs: defaultFailureSimulationSettings.latencyMs,
      target: 'edit',
    });
  });

  test('stores and reads opt-in settings from local browser storage', () => {
    const storage = new MemoryStorage();
    const settings: FailureSimulationSettings = {
      enabled: true,
      latencyMs: 600,
      target: 'all',
    };

    saveFailureSimulationSettings(storage, settings);

    expect(typeof storage.getItem(FAILURE_SIMULATION_STORAGE_KEY)).toBe(
      'string',
    );
    expect(readFailureSimulationSettings(storage)).toEqual(settings);

    expect(readFailureSimulationSettings(new MemoryStorage())).toEqual(
      defaultFailureSimulationSettings,
    );
    expect(storage.getItem(FAILURE_SIMULATION_STORAGE_KEY)).not.toBeNull();

    storage.setItem(FAILURE_SIMULATION_STORAGE_KEY, '{bad json');
    expect(readFailureSimulationSettings(storage)).toEqual(
      defaultFailureSimulationSettings,
    );

    storage.setItem(FAILURE_SIMULATION_STORAGE_KEY, JSON.stringify(['list']));
    expect(readFailureSimulationSettings(storage)).toEqual(
      defaultFailureSimulationSettings,
    );

    storage.setItem(FAILURE_SIMULATION_STORAGE_KEY, '');
    expect(readFailureSimulationSettings(storage)).toEqual(
      defaultFailureSimulationSettings,
    );
  });

  test('normalizes settings before saving them to storage', () => {
    const storage = new MemoryStorage();

    saveFailureSimulationSettings(storage, {
      enabled: 'yes',
      latencyMs: Number.NEGATIVE_INFINITY,
      target: 'all',
    } as unknown as FailureSimulationSettings);

    expect(readFailureSimulationSettings(storage)).toEqual({
      enabled: false,
      latencyMs: defaultFailureSimulationSettings.latencyMs,
      target: 'all',
    });
  });

  test('treats denied failure-simulation storage as best-effort', () => {
    const storage = new ThrowingStorage();

    expect(readFailureSimulationSettings(storage)).toEqual(
      defaultFailureSimulationSettings,
    );
    expect(() =>
      saveFailureSimulationSettings(storage, enabledListFailure),
    ).not.toThrow();
  });

  test('matches latency and failure targets independently', () => {
    expect(shouldSimulateLatency(enabledListFailure)).toBe(false);
    expect(
      shouldSimulateLatency({
        ...enabledListFailure,
        latencyMs: 1,
      }),
    ).toBe(true);
    expect(
      shouldSimulateLatency({
        ...enabledListFailure,
        enabled: false,
        latencyMs: 1,
      }),
    ).toBe(false);
    expect(shouldSimulateFailure(enabledListFailure, 'list')).toBe(true);
    expect(shouldSimulateFailure(enabledListFailure, 'detail')).toBe(false);
    expect(
      shouldSimulateFailure(
        {
          ...enabledListFailure,
          target: 'all',
        },
        'detail',
      ),
    ).toBe(true);
  });

  test('creates stable simulated API errors for every target', () => {
    for (const target of ['list', 'detail', 'delete'] as const) {
      const error = createSimulatedApiError(target);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('SIMULATED_FAILURE');
      expect(error.details).toBeUndefined();
      expect(error.message).toBe(
        `Simulated ${target} failure. Retry or disable local reliability simulation.`,
      );
      expect(error.status).toBe(503);
    }

    for (const target of ['create', 'edit'] as const) {
      const error = createSimulatedApiError(target);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('SIMULATED_FAILURE');
      expect(error.details).toEqual({
        request: [
          'Local reliability simulation stopped this save before the API call.',
        ],
      });
      expect(error.message).toBe(
        `Simulated ${target} failure. Retry or disable local reliability simulation.`,
      );
      expect(error.status).toBe(503);
    }
  });

  test('runs the action exactly once when simulation does not fail', async () => {
    let actionCalls = 0;

    const disabledResult = await withFailureSimulation(
      'list',
      {
        enabled: false,
        latencyMs: 0,
        target: 'list',
      },
      async () => {
        actionCalls += 1;

        return 'disabled-result';
      },
    );
    const mismatchedTargetResult = await withFailureSimulation(
      'detail',
      enabledListFailure,
      async () => {
        actionCalls += 1;

        return 'mismatched-result';
      },
    );

    expect(disabledResult).toBe('disabled-result');
    expect(mismatchedTargetResult).toBe('mismatched-result');
    expect(actionCalls).toBe(2);
  });

  test('propagates action errors when simulation does not fail', async () => {
    const actionError = new ApiError({
      code: 'API_DOWN',
      message: 'The API is unavailable.',
      status: 503,
    });
    let caught: unknown;

    try {
      await withFailureSimulation('detail', enabledListFailure, async () => {
        throw actionError;
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(actionError);
  });

  test('schedules latency before running the action', async () => {
    const originalSetTimeout = globalThis.setTimeout;
    const delays: Array<number | undefined> = [];
    let actionCalls = 0;

    globalThis.setTimeout = ((callback, delay, ...args) => {
      delays.push(delay);

      if (typeof callback === 'function') {
        callback(...args);
      }

      return 0 as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;

    try {
      const result = await withFailureSimulation(
        'detail',
        {
          enabled: true,
          latencyMs: 125,
          target: 'list',
        },
        async () => {
          actionCalls += 1;

          return 'latency-result';
        },
      );

      expect(result).toBe('latency-result');
      expect(actionCalls).toBe(1);
      expect(delays).toEqual([125]);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  test('does not schedule latency when latency simulation is disabled', async () => {
    const originalSetTimeout = globalThis.setTimeout;
    let timeoutCalls = 0;

    globalThis.setTimeout = ((callback, delay, ...args) => {
      timeoutCalls += 1;

      if (typeof callback === 'function') {
        callback(...args);
      }

      return 0 as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;

    try {
      const disabledResult = await withFailureSimulation(
        'detail',
        {
          enabled: false,
          latencyMs: 125,
          target: 'list',
        },
        async () => 'disabled-result',
      );
      const zeroLatencyResult = await withFailureSimulation(
        'detail',
        {
          enabled: true,
          latencyMs: 0,
          target: 'list',
        },
        async () => 'zero-latency-result',
      );

      expect(disabledResult).toBe('disabled-result');
      expect(zeroLatencyResult).toBe('zero-latency-result');
      expect(timeoutCalls).toBe(0);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  test('throws actionable API-style details for simulated form saves', async () => {
    let actionCalls = 0;

    try {
      await withFailureSimulation(
        'create',
        {
          enabled: true,
          latencyMs: 0,
          target: 'create',
        },
        async () => {
          actionCalls += 1;

          return { ok: true };
        },
      );

      throw new Error('withFailureSimulation should reject.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('SIMULATED_FAILURE');
      expect((error as ApiError).details).toEqual({
        request: [
          'Local reliability simulation stopped this save before the API call.',
        ],
      });
      expect((error as ApiError).message).toBe(
        'Simulated create failure. Retry or disable local reliability simulation.',
      );
      expect((error as ApiError).status).toBe(503);
      expect(actionCalls).toBe(0);
    }
  });
});
