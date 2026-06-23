'use client';

import { StatusMessage } from './status-message';
import type { Patient } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Last selected row is still available.
          </p>
        </div>
        <StatusMessage title="Unable to refresh record" tone="error">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {showRetry ? (
              <Button
                onClick={onRetry}
                type="button"
                variant="outline"
              >
                Retry details
              </Button>
            ) : null}
          </div>
        </StatusMessage>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="text-sm text-muted-foreground">
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
    <Card className="bg-muted/50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium text-foreground">{value}</dd>
    </Card>
  );
}
