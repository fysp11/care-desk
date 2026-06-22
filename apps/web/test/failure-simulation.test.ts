import { describe, expect, test } from 'bun:test';

import { ApiError } from '../lib/api';
import {
  FAILURE_SIMULATION_STORAGE_KEY,
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

const enabledListFailure: FailureSimulationSettings = {
  enabled: true,
  latencyMs: 0,
  target: 'list',
};

describe('failure simulation helpers', () => {
  test('keeps simulation local-only and disabled by default', () => {
    expect(isLocalFailureSimulationHost('localhost')).toBe(true);
    expect(isLocalFailureSimulationHost('127.0.0.1')).toBe(true);
    expect(isLocalFailureSimulationHost('app.example.com')).toBe(false);
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
  });

  test('matches latency and failure targets independently', () => {
    expect(shouldSimulateLatency(enabledListFailure)).toBe(false);
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

  test('throws actionable API-style details for simulated form saves', async () => {
    try {
      await withFailureSimulation('create', {
        enabled: true,
        latencyMs: 0,
        target: 'create',
      }, async () => ({ ok: true }));

      throw new Error('withFailureSimulation should reject.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('SIMULATED_FAILURE');
      expect((error as ApiError).details).toEqual({
        request: [
          'Local reliability simulation stopped this save before the API call.',
        ],
      });
    }
  });
});
