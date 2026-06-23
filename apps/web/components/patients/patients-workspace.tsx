'use client';

import { FailureSimulationPanel } from '../failure-simulation-panel';
import { PatientAppHeader } from '../patient-app-header';
import { PatientDetails } from '../patient-details';
import { PatientForm } from '../patient-form';
import { PatientListControls } from '../patient-list-controls';
import { PatientPagination } from '../patient-pagination';
import { PatientTable } from '../patient-table';
import { StatusMessage } from '../status-message';
import { useAuthSessionContext } from '../auth/auth-session-context';
import { useFailureSimulationSettings } from '../../hooks/use-failure-simulation-settings';
import { usePatientWorkflow } from '../../hooks/use-patient-workflow';
import {
  shouldShowDetailRetry,
  shouldShowListRetry,
} from '../../lib/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PatientsWorkspace() {
  const auth = useAuthSessionContext();
  const session = auth.session;
  const failureSimulation = useFailureSimulationSettings();
  const patients = usePatientWorkflow({
    onAuthFailure: auth.handleAuthFailure,
    session,
    simulationReady: failureSimulation.ready,
    simulationSettings: failureSimulation.settings,
  });
  const canRetryDetails = shouldShowDetailRetry(
    patients.detailsStatus,
    patients.detailsError,
  );

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <PatientAppHeader onLogout={auth.handleLogout} session={session} />

        {!patients.isAdmin ? (
          <StatusMessage tone="info">
            View-only role: patient details are available, while create, edit,
            and delete controls are hidden. The API still enforces this with
            server-side authorization.
          </StatusMessage>
        ) : null}

        {failureSimulation.available ? (
          <FailureSimulationPanel
            onChange={failureSimulation.updateSettings}
            settings={failureSimulation.settings}
          />
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex flex-col gap-4">
            <PatientListControls
              isAdmin={patients.isAdmin}
              onCreate={patients.openCreateForm}
              onQueryChange={patients.setQuery}
              query={patients.query}
            />

            {shouldShowListRetry(patients.listStatus, patients.listError) ? (
              <StatusMessage title="Unable to load patients" tone="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{patients.listError}</span>
                  <Button
                    disabled={patients.listStatus === 'loading'}
                    onClick={() => void patients.refreshPatients()}
                    type="button"
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              </StatusMessage>
            ) : null}

            {patients.mutationError ? (
              <StatusMessage title="Patient action failed" tone="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{patients.mutationError}</span>
                  <Button
                    disabled={patients.listStatus === 'loading'}
                    onClick={() => void patients.refreshPatients()}
                    type="button"
                    variant="outline"
                  >
                    Refresh list
                  </Button>
                </div>
              </StatusMessage>
            ) : null}

            <PatientTable
              isAdmin={patients.isAdmin}
              isLoading={patients.listStatus === 'loading'}
              onDelete={(patient) => void patients.handleDelete(patient)}
              onDetails={(patient) => void patients.openDetails(patient)}
              onEdit={patients.openEditForm}
              onSort={patients.handleSort}
              patients={patients.patients}
              sortBy={patients.query.sortBy}
              sortDir={patients.query.sortDir}
            />

            <PatientPagination
              isLoading={patients.listStatus === 'loading'}
              onPageChange={(page) =>
                patients.setQuery((current) => ({
                  ...current,
                  page,
                }))
              }
              page={patients.query.page}
              totalPages={patients.totalPages}
              totalPatients={patients.totalPatients}
            />
          </div>

          <aside>
            <Card>
              <CardContent className="p-5">
            {patients.formMode ? (
              <PatientForm
                isSubmitting={patients.isSaving}
                mode={patients.formMode}
                onCancel={patients.cancelForm}
                onSubmit={patients.submitPatientForm}
                patient={patients.editingPatient}
                serverError={patients.formError}
              />
            ) : patients.selectedPatient ? (
              <PatientDetails
                error={patients.detailsError}
                isLoading={patients.detailsStatus === 'loading'}
                onRetry={() =>
                  patients.selectedPatient
                    ? void patients.openDetails(patients.selectedPatient)
                    : undefined
                }
                patient={patients.selectedPatient}
                showRetry={canRetryDetails}
              />
            ) : (
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <h2 className="text-lg font-semibold text-foreground">
                  Patient details
                </h2>
                <p>Select a row to view the full record.</p>
              </div>
            )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
