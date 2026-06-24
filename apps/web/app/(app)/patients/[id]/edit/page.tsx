'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuthSessionContext } from '../../../../../components/auth/auth-session-context';
import { PatientAppHeader } from '../../../../../components/patient-app-header';
import { PatientForm } from '../../../../../components/patient-form';
import { StatusMessage } from '../../../../../components/status-message';
import { ApiAuthError, getPatient, updatePatient } from '../../../../../lib/api';
import { canMutatePatients } from '../../../../../lib/workflow';
import { toErrorMessage } from '../../../../../lib/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Patient } from '../../../../../lib/types';

export default function EditPatientPage() {
  const auth = useAuthSessionContext();
  const router = useRouter();
  const { id: encodedPatientId } = useParams<{ id: string }>();
  const patientId = decodeURIComponent(encodedPatientId ?? '');
  const session = auth.session;
  const isAdmin = canMutatePatients(session);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      if (!session || !isAdmin || !patientId) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getPatient(patientId, {
          onAuthFailure: auth.handleAuthFailure,
          token: session.token,
        });

        setPatient(response);
      } catch (error) {
        if (error instanceof ApiAuthError) {
          return;
        }

        setLoadError(toErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPatient();
  }, [auth.handleAuthFailure, isAdmin, patientId, session]);

  const handleCancel = useCallback(() => {
    if (!patientId) {
      return;
    }

    router.push(`/patients/${encodeURIComponent(patientId)}`);
  }, [patientId, router]);

  const handleSubmit = useCallback(
    async (payload: Parameters<typeof updatePatient>[1]) => {
      if (!isAdmin || !session || !patient) {
        return;
      }

      setIsSubmitting(true);
      setFormError(undefined);

      try {
        await updatePatient(patient.id, payload, {
          onAuthFailure: auth.handleAuthFailure,
          token: session.token,
        });

        router.push(`/patients/${encodeURIComponent(patient.id)}`);
      } catch (error) {
        if (error instanceof ApiAuthError) {
          return;
        }

        setFormError(toErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [auth.handleAuthFailure, isAdmin, patient, router, session],
  );

  if (!session) {
    return null;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <PatientAppHeader onLogout={auth.handleLogout} session={session} />
          <Card>
            <CardContent className="p-5">
              <StatusMessage title="Permission required" tone="warning">
                Your role is view-only and cannot edit patients.
              </StatusMessage>
              <Button
                onClick={() => router.push('/patients')}
                type="button"
                className="mt-4"
              >
                Back to patients
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <PatientAppHeader onLogout={auth.handleLogout} session={session} />

        <div className="flex gap-3">
          <Button onClick={handleCancel} type="button">
            Back to patient
          </Button>
        </div>

        {loadError ? (
          <StatusMessage title="Unable to load patient" tone="error">
            {loadError}
          </StatusMessage>
        ) : null}

        {isLoading || !patient ? (
          <Card>
            <CardContent className="p-5">Loading patient...</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-5">
              <PatientForm
                isSubmitting={isSubmitting}
                mode="edit"
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                patient={patient}
                serverError={formError}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
