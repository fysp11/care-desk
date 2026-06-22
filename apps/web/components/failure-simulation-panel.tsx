'use client';

import {
  failureSimulationTargets,
  type FailureSimulationSettings,
  type FailureSimulationTargetSelection,
} from '../lib/failure-simulation';

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
    <section className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            checked={settings.enabled}
            className="h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
            onChange={(event) => update({ enabled: event.target.checked })}
            type="checkbox"
          />
          Local reliability simulation
        </label>
        <span className="rounded bg-white/70 px-2 py-1 text-xs font-semibold uppercase text-amber-900">
          {settings.enabled ? 'On' : 'Off'}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <label className="block font-medium" htmlFor="simulation-target">
          Fail target
          <select
            className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
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
    </section>
  );
}
