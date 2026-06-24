'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PatientAppHeader } from '../../../../components/patient-app-header';
import { PatientForm } from '../../../../components/patient-form';
import { StatusMessage } from '../../../../components/status-message';
import { useAuthSessionContext } from '../../../../components/auth/auth-session-context';
import { ApiAuthError, createPatient } from '../../../../lib/api';
import { canMutatePatients } from '../../../../lib/workflow';
import { toErrorMessage } from '../../../../lib/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NewPatientPage() {
  const auth = useAuthSessionContext();
  const router = useRouter();
  const session = auth.session;
  const isAdmin = canMutatePatients(session);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const handleCancel = useCallback(() => {
    router.push('/patients');
  }, [router]);

  const handleSubmit = useCallback(
    async (payload: Parameters<typeof createPatient>[0]) => {
      if (!session || !isAdmin) {
        return;
      }

      setIsSubmitting(true);
      setFormError(undefined);

      try {
        const patient = await createPatient(payload, {
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
    [auth.handleAuthFailure, isAdmin, router, session],
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
                Your role is view-only and cannot create patients.
              </StatusMessage>
              <div className="mt-4">
                <Button onClick={handleCancel} type="button">
                  Back to patients
                </Button>
              </div>
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
        <Card>
          <CardContent className="p-5">
            <PatientForm
              isSubmitting={isSubmitting}
              mode="create"
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              serverError={formError}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
