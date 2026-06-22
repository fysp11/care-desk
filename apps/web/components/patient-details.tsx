'use client';

import { StatusMessage } from './status-message';
import type { Patient } from '../lib/types';

interface PatientDetailsProps {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly onRetry: () => void;
  readonly patient: Patient;
  readonly showRetry: boolean;
}

export function PatientDetails({
  error,
  isLoading,
  onRetry,
  patient,
  showRetry,
}: PatientDetailsProps) {
  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Last selected row is still available.
          </p>
        </div>
        <StatusMessage title="Unable to refresh record" tone="error">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {showRetry ? (
              <button
                className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={onRetry}
                type="button"
              >
                Retry details
              </button>
            ) : null}
          </div>
        </StatusMessage>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isLoading ? 'Refreshing record...' : 'Patient record'}
        </p>
      </div>

      <dl className="grid gap-3 text-sm">
        <DetailItem label="Email" value={patient.email} />
        <DetailItem label="Phone" value={patient.phoneNumber} />
        <DetailItem label="Date of birth" value={patient.dob} />
        <DetailItem label="Record ID" value={patient.id} />
        <DetailItem label="Created" value={patient.createdAt} />
        <DetailItem label="Updated" value={patient.updatedAt} />
      </dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium text-slate-900">{value}</dd>
    </div>
  );
}
