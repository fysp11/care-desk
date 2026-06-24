'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

import { useAuthSessionContext } from '../../../../components/auth/auth-session-context';
import { PatientAppHeader } from '../../../../components/patient-app-header';
import { PatientDetails } from '../../../../components/patient-details';
import { StatusMessage } from '../../../../components/status-message';
import { ApiAuthError, getPatient } from '../../../../lib/api';
import { canMutatePatients, shouldShowDetailRetry } from '../../../../lib/workflow';
import { toErrorMessage } from '../../../../lib/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LoadStatus } from '../../../../lib/workflow';
import type { Patient } from '../../../../lib/types';

export default function PatientDetailPage() {
  const auth = useAuthSessionContext();
  const router = useRouter();
  const { id: encodedPatientId } = useParams<{ id: string }>();
  const patientId = decodeURIComponent(encodedPatientId ?? '');
  const session = auth.session;
  const canEdit = canMutatePatients(session);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!session || !patientId) {
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await getPatient(patientId, {
        onAuthFailure: auth.handleAuthFailure,
        token: session.token,
      });

      setPatient(response);
      setStatus('success');
    } catch (loadError) {
      if (loadError instanceof ApiAuthError) {
        return;
      }

      setError(toErrorMessage(loadError));
      setStatus('error');
    }
  }, [auth.handleAuthFailure, patientId, session]);

  useEffect(() => {
    void fetchPatient();
  }, [fetchPatient]);

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <PatientAppHeader onLogout={auth.handleLogout} session={session} />

        <div className="flex gap-3">
          <Button onClick={() => router.push('/patients')} type="button">
            Back to patients
          </Button>
          {canEdit ? (
            <Button
              onClick={() =>
                router.push(`/patients/${encodeURIComponent(patientId)}/edit`)
              }
              type="button"
              variant="outline"
            >
              Edit
            </Button>
          ) : null}
        </div>

        {status === 'error' && error ? (
          <StatusMessage title="Unable to load patient" tone="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                onClick={fetchPatient}
                type="button"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </StatusMessage>
        ) : null}

        {shouldShowDetailRetry(status, error) ? (
          <StatusMessage tone="info">
            Last selected record is unavailable. Retry to reload it.
          </StatusMessage>
        ) : null}

        {patient ? (
          <Card>
            <CardContent className="p-5">
              <PatientDetails
                error={error}
                isLoading={status === 'loading'}
                onRetry={fetchPatient}
                patient={patient}
                showRetry={false}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-5">
              <StatusMessage title="Loading patient" tone="info">
                Loading patient...
              </StatusMessage>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
