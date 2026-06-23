'use client';

import { useCallback, useEffect, useState } from 'react';

import { getBrowserStorage } from '../lib/browser-storage';
import {
  defaultFailureSimulationSettings,
  isLocalFailureSimulationHost,
  readFailureSimulationSettings,
  saveFailureSimulationSettings,
  type FailureSimulationSettings,
} from '../lib/failure-simulation';

const canUseLocalFailureSimulation = (): boolean =>
  typeof window !== 'undefined' &&
  isLocalFailureSimulationHost(window.location.hostname);

const readInitialFailureSimulationSettings = (): FailureSimulationSettings => {
  if (!canUseLocalFailureSimulation()) {
    return defaultFailureSimulationSettings;
  }

  const browserStorage = getBrowserStorage();

  return browserStorage
    ? readFailureSimulationSettings(browserStorage)
    : defaultFailureSimulationSettings;
};

export function useFailureSimulationSettings() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(canUseLocalFailureSimulation);
  const [settings, setSettings] = useState<FailureSimulationSettings>(
    readInitialFailureSimulationSettings,
  );

  useEffect(() => {
    const canUseSimulation = isLocalFailureSimulationHost(
      window.location.hostname,
    );
    const browserStorage = getBrowserStorage();

    setAvailable(canUseSimulation);

    if (canUseSimulation && browserStorage) {
      setSettings(readFailureSimulationSettings(browserStorage));
    }

    setReady(true);
  }, []);

  const updateSettings = useCallback(
    (nextSettings: FailureSimulationSettings) => {
      setSettings(nextSettings);
      const browserStorage = getBrowserStorage();

      if (browserStorage) {
        saveFailureSimulationSettings(browserStorage, nextSettings);
      }
    },
    [],
  );

  return {
    available,
    ready,
    settings,
    updateSettings,
  };
}
