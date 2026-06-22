'use client';

import type { StoredSession } from '../lib/session';

interface PatientAppHeaderProps {
  readonly onLogout: () => void;
  readonly session: StoredSession;
}

export function PatientAppHeader({
  onLogout,
  session,
}: PatientAppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-teal-800">Care Desk</p>
        <h1 className="text-2xl font-semibold text-slate-950">
          Patients management
        </h1>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
          <span className="font-medium text-slate-950">
            {session.user.email}
          </span>
          <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
            {session.user.role}
          </span>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
