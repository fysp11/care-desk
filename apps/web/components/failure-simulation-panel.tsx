'use client';

import {
  failureSimulationTargets,
  type FailureSimulationSettings,
  type FailureSimulationTargetSelection,
} from '../lib/failure-simulation';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface FailureSimulationPanelProps {
  readonly onChange: (settings: FailureSimulationSettings) => void;
  readonly settings: FailureSimulationSettings;
}

export function FailureSimulationPanel({
  onChange,
  settings,
}: FailureSimulationPanelProps) {
  const update = (next: Partial<FailureSimulationSettings>) => {
    onChange({
      ...settings,
      ...next,
    });
  };

  return (
    <Alert className="text-foreground" variant="warning">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            checked={settings.enabled}
            className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onChange={(event) => update({ enabled: event.target.checked })}
            type="checkbox"
          />
          Local reliability simulation
        </label>
        <Badge variant="secondary">
          {settings.enabled ? 'On' : 'Off'}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <label className="block font-medium" htmlFor="simulation-target">
          Fail target
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!settings.enabled}
            id="simulation-target"
            onChange={(event) =>
              update({
                target: event.target.value as FailureSimulationTargetSelection,
              })
            }
            value={settings.target}
          >
            <option value="all">All requests</option>
            {failureSimulationTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>
        </label>

        <label className="block font-medium" htmlFor="simulation-latency">
          Latency
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!settings.enabled}
            id="simulation-latency"
            onChange={(event) =>
              update({ latencyMs: Number(event.target.value) })
            }
            value={settings.latencyMs}
          >
            <option value={0}>0 ms</option>
            <option value={300}>300 ms</option>
            <option value={600}>600 ms</option>
            <option value={1200}>1200 ms</option>
          </select>
        </label>
      </div>
    </Alert>
  );
}
