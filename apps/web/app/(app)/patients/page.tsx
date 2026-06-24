'use client';

import { useCallback } from 'react';
 

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthSessionContext } from '../../../components/auth/auth-session-context';
import { PatientAppHeader } from '../../../components/patient-app-header';
import { PatientListControls } from '../../../components/patient-list-controls';
import { PatientPagination } from '../../../components/patient-pagination';
import { PatientTable } from '../../../components/patient-table';
import { StatusMessage } from '../../../components/status-message';
import { ApiAuthError, deletePatient } from '../../../lib/api';
import { canMutatePatients, getOptimisticDeleteTotal, removePatientById, shouldShowListRetry } from '../../../lib/workflow';
import { toErrorMessage } from '../../../lib/api-error-message';
import { usePatientListState } from '../../../hooks/use-patient-list-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Patient } from '../../../lib/types';

export default function PatientsPage() {
  const auth = useAuthSessionContext();
  const session = auth.session;
  const router = useRouter();
  const patientList = usePatientListState({
    onAuthFailure: auth.handleAuthFailure,
    session,
  });
  const isAdmin = canMutatePatients(session);

  const handleDelete = useCallback(
    async (patient: Patient) => {
      if (!session) {
        return;
      }

      const confirmed = window.confirm(
        `Delete ${patient.firstName} ${patient.lastName}?`,
      );

      if (!confirmed) {
        return;
      }

      patientList.setListError(null);
      patientList.setMutationError(null);

      const previousPatients = patientList.patients;
      const previousTotalPatients = patientList.totalPatients;
      const previousListStatus = patientList.listStatus;
      const nextPatients = removePatientById(previousPatients, patient.id);
      const removedCount = previousPatients.length - nextPatients.length;

      patientList.setPatients(nextPatients);
      patientList.setTotalPatients(
        getOptimisticDeleteTotal(previousTotalPatients, removedCount),
      );

      try {
        await deletePatient(patient.id, {
          onAuthFailure: auth.handleAuthFailure,
          token: session.token,
        });

        await patientList.refreshPatients();
      } catch (error) {
        if (error instanceof ApiAuthError) {
          return;
        }

        patientList.setPatients(previousPatients);
        patientList.setTotalPatients(previousTotalPatients);
        patientList.setListStatus(previousListStatus);
        patientList.setMutationError(toErrorMessage(error));
      }
    },
    [auth.handleAuthFailure, patientList, session],
  );

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <PatientAppHeader onLogout={auth.handleLogout} session={session} />

        {!isAdmin ? (
          <StatusMessage tone="info">
            View-only role: patient details are available, while create, edit,
            and delete controls are hidden. The API still enforces this with
            server-side authorization.
          </StatusMessage>
        ) : null}

        <div className="flex flex-col gap-4">
          <PatientListControls
            isAdmin={isAdmin}
            onCreate={() => router.push('/patients/new')}
            onQueryChange={patientList.setQuery}
            query={patientList.query}
          />

          {shouldShowListRetry(patientList.listStatus, patientList.listError) ? (
            <StatusMessage title="Unable to load patients" tone="error">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{patientList.listError}</span>
                <Button
                  disabled={patientList.listStatus === 'loading'}
                  onClick={() => void patientList.refreshPatients()}
                  type="button"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </StatusMessage>
          ) : null}

          {patientList.mutationError ? (
            <StatusMessage title="Patient action failed" tone="error">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{patientList.mutationError}</span>
                <Button
                  disabled={patientList.listStatus === 'loading'}
                  onClick={() => void patientList.refreshPatients()}
                  type="button"
                  variant="outline"
                >
                  Refresh list
                </Button>
              </div>
            </StatusMessage>
          ) : null}

          <PatientTable
            isAdmin={isAdmin}
            isLoading={patientList.listStatus === 'loading'}
            onDelete={(patient) => void handleDelete(patient)}
            onDetails={(patient) =>
              router.push(`/patients/${encodeURIComponent(patient.id)}`)
            }
            onEdit={(patient) =>
              router.push(`/patients/${encodeURIComponent(patient.id)}/edit`)
            }
            onSort={patientList.handleSort}
            patients={patientList.patients}
            sortBy={patientList.query.sortBy}
            sortDir={patientList.query.sortDir}
          />

          <PatientPagination
            isLoading={patientList.listStatus === 'loading'}
            onPageChange={(page) =>
              patientList.setQuery((current) => ({
                ...current,
                page,
              }))
            }
            page={patientList.query.page}
            totalPages={patientList.totalPages}
            totalPatients={patientList.totalPatients}
          />
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">
              <Link
                className="text-primary underline underline-offset-4"
                href="/patients/new"
              >
                Create a new patient
              </Link>{' '}
              to add records, or{' '}
              <Link
                className="text-primary underline underline-offset-4"
                href="/patients"
              >
                return to this list
              </Link>{' '}
              to continue managing patients.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
