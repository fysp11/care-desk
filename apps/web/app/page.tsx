'use client';

import { FailureSimulationPanel } from '../components/failure-simulation-panel';
import { LoginPanel } from '../components/login-panel';
import { PatientAppHeader } from '../components/patient-app-header';
import { PatientDetails } from '../components/patient-details';
import { PatientForm } from '../components/patient-form';
import { PatientListControls } from '../components/patient-list-controls';
import { PatientPagination } from '../components/patient-pagination';
import { PatientTable } from '../components/patient-table';
import { StatusMessage } from '../components/status-message';
import { useAuthSession } from '../hooks/use-auth-session';
import { useFailureSimulationSettings } from '../hooks/use-failure-simulation-settings';
import { usePatientWorkflow } from '../hooks/use-patient-workflow';
import {
  getWorkflowView,
  shouldShowDetailRetry,
  shouldShowListRetry,
} from '../lib/workflow';

export default function Home() {
  const auth = useAuthSession();
  const failureSimulation = useFailureSimulationSettings();
  const patients = usePatientWorkflow({
    onAuthFailure: auth.handleAuthFailure,
    session: auth.session,
    simulationSettings: failureSimulation.settings,
  });
  const workflowView = getWorkflowView(auth.sessionReady, auth.session);
  const canRetryDetails = shouldShowDetailRetry(
    patients.detailsStatus,
    patients.detailsError,
  );

  if (workflowView === 'checking-session') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <div className="rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
          Checking session...
        </div>
      </main>
    );
  }

  if (workflowView === 'login' || !auth.session) {
    return (
      <LoginPanel
        authNotice={auth.authNotice}
        errors={auth.loginErrors}
        form={auth.loginForm}
        isLoggingIn={auth.isLoggingIn}
        loginError={auth.loginError}
        onDemoLogin={(credentials) => void auth.submitLogin(credentials)}
        onFieldChange={auth.updateLoginField}
        onSubmit={(credentials) => void auth.submitLogin(credentials)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <PatientAppHeader onLogout={auth.handleLogout} session={auth.session} />

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
          <div className="space-y-4">
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
                  <button
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={patients.listStatus === 'loading'}
                    onClick={() => void patients.refreshPatients()}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              </StatusMessage>
            ) : null}

            {patients.mutationError ? (
              <StatusMessage title="Patient action failed" tone="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{patients.mutationError}</span>
                  <button
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={patients.listStatus === 'loading'}
                    onClick={() => void patients.refreshPatients()}
                    type="button"
                  >
                    Refresh list
                  </button>
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

          <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
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
              <div className="space-y-2 text-sm text-slate-600">
                <h2 className="text-lg font-semibold text-slate-950">
                  Patient details
                </h2>
                <p>Select a row to view the full record.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
