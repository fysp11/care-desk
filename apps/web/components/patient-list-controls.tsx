'use client';

import type { PatientListQuery } from '../lib/types';

interface PatientListControlsProps {
  readonly isAdmin: boolean;
  readonly onCreate: () => void;
  readonly onQueryChange: (query: PatientListQuery) => void;
  readonly query: PatientListQuery;
}

export function PatientListControls({
  isAdmin,
  onCreate,
  onQueryChange,
  query,
}: PatientListControlsProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label
          className="block flex-1 text-sm font-medium text-slate-800"
          htmlFor="patient-search"
        >
          Search patients
          <input
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            id="patient-search"
            onChange={(event) =>
              onQueryChange({
                ...query,
                page: 1,
                search: event.target.value,
              })
            }
            placeholder="Name, email, or phone"
            type="search"
            value={query.search}
          />
        </label>

        <label
          className="block text-sm font-medium text-slate-800"
          htmlFor="page-size"
        >
          Rows
          <select
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:w-28"
            id="page-size"
            onChange={(event) =>
              onQueryChange({
                ...query,
                limit: Number(event.target.value),
                page: 1,
              })
            }
            value={query.limit}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        {isAdmin ? (
          <button
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={onCreate}
            type="button"
          >
            New patient
          </button>
        ) : null}
      </div>
    </div>
  );
}
