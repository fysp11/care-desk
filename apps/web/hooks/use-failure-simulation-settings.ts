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

export function useFailureSimulationSettings() {
  const [available, setAvailable] = useState(false);
  const [settings, setSettings] = useState<FailureSimulationSettings>(
    defaultFailureSimulationSettings,
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
    settings,
    updateSettings,
  };
}
