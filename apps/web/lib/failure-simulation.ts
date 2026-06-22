import { ApiError } from './api';
import type { ValidationDetails } from './types';

export const FAILURE_SIMULATION_STORAGE_KEY =
  'care-desk-failure-simulation';

export const failureSimulationTargets = [
  'list',
  'detail',
  'create',
  'edit',
  'delete',
] as const;

export type FailureSimulationTarget =
  (typeof failureSimulationTargets)[number];

export type FailureSimulationTargetSelection =
  | FailureSimulationTarget
  | 'all';

export interface FailureSimulationSettings {
  readonly enabled: boolean;
  readonly latencyMs: number;
  readonly target: FailureSimulationTargetSelection;
}

export interface FailureSimulationStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const defaultFailureSimulationSettings: FailureSimulationSettings = {
  enabled: false,
  latencyMs: 600,
  target: 'list',
};

const maxLatencyMs = 3_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTargetSelection = (
  value: unknown,
): value is FailureSimulationTargetSelection =>
  value === 'all' ||
  failureSimulationTargets.some((target) => target === value);

const clampLatency = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultFailureSimulationSettings.latencyMs;
  }

  return Math.min(maxLatencyMs, Math.max(0, Math.round(value)));
};

export const normalizeFailureSimulationSettings = (
  value: unknown,
): FailureSimulationSettings => {
  if (!isRecord(value)) {
    return defaultFailureSimulationSettings;
  }

  return {
    enabled:
      typeof value.enabled === 'boolean'
        ? value.enabled
        : defaultFailureSimulationSettings.enabled,
    latencyMs: clampLatency(value.latencyMs),
    target: isTargetSelection(value.target)
      ? value.target
      : defaultFailureSimulationSettings.target,
  };
};

export const readFailureSimulationSettings = (
  storage: FailureSimulationStorageLike,
): FailureSimulationSettings => {
  const storedValue = storage.getItem(FAILURE_SIMULATION_STORAGE_KEY);

  if (!storedValue) {
    return defaultFailureSimulationSettings;
  }

  try {
    return normalizeFailureSimulationSettings(JSON.parse(storedValue));
  } catch {
    return defaultFailureSimulationSettings;
  }
};

export const saveFailureSimulationSettings = (
  storage: FailureSimulationStorageLike,
  settings: FailureSimulationSettings,
): void => {
  storage.setItem(
    FAILURE_SIMULATION_STORAGE_KEY,
    JSON.stringify(normalizeFailureSimulationSettings(settings)),
  );
};

export const isLocalFailureSimulationHost = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname === '::1' ||
  hostname === '[::1]' ||
  hostname.startsWith('127.');

export const shouldSimulateLatency = (
  settings: FailureSimulationSettings,
): boolean => settings.enabled && settings.latencyMs > 0;

export const shouldSimulateFailure = (
  settings: FailureSimulationSettings,
  target: FailureSimulationTarget,
): boolean =>
  settings.enabled && (settings.target === 'all' || settings.target === target);

const wait = (latencyMs: number): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, latencyMs);
  });

const simulatedDetailsFor = (
  target: FailureSimulationTarget,
): ValidationDetails | undefined => {
  if (target === 'create' || target === 'edit') {
    return {
      request: [
        'Local reliability simulation stopped this save before the API call.',
      ],
    };
  }

  return undefined;
};

export const createSimulatedApiError = (
  target: FailureSimulationTarget,
): ApiError =>
  new ApiError({
    code: 'SIMULATED_FAILURE',
    details: simulatedDetailsFor(target),
    message: `Simulated ${target} failure. Retry or disable local reliability simulation.`,
    status: 503,
  });

export const withFailureSimulation = async <TResult>(
  target: FailureSimulationTarget,
  settings: FailureSimulationSettings,
  action: () => Promise<TResult>,
): Promise<TResult> => {
  if (shouldSimulateLatency(settings)) {
    await wait(settings.latencyMs);
  }

  if (shouldSimulateFailure(settings, target)) {
    throw createSimulatedApiError(target);
  }

  return action();
};
