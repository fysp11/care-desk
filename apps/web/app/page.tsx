'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { PatientForm } from '../components/patient-form';
import { PatientTable } from '../components/patient-table';
import { StatusMessage } from '../components/status-message';
import {
  ApiAuthError,
  ApiError,
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  login,
  updatePatient,
} from '../lib/api';
import {
  defaultFailureSimulationSettings,
  failureSimulationTargets,
  isLocalFailureSimulationHost,
  readFailureSimulationSettings,
  saveFailureSimulationSettings,
  withFailureSimulation,
  type FailureSimulationSettings,
  type FailureSimulationTargetSelection,
} from '../lib/failure-simulation';
import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
  type StoredSession,
} from '../lib/session';
import type {
  Patient,
  PatientListQuery,
  PatientWriteInput,
} from '../lib/types';
import {
  canMutatePatients,
  getOptimisticDeleteTotal,
  getTotalPages,
  getWorkflowView,
  nextSortQuery,
  removePatientById,
  shouldShowDetailRetry,
  shouldShowListRetry,
  type LoadStatus,
} from '../lib/workflow';

const demoCredentials = {
  admin: {
    email: 'admin@example.com',
    password: 'admin-password',
  },
  user: {
    email: 'user@example.com',
    password: 'user-password',
  },
} as const;

const defaultQuery: PatientListQuery = {
  limit: 10,
  page: 1,
  search: '',
  sortBy: 'lastName',
  sortDir: 'asc',
};

type LoginErrors = Partial<Record<'email' | 'password', string>>;
type FormMode = 'create' | 'edit';

const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const details = error.details
      ? Object.entries(error.details)
          .flatMap(([field, messages]) =>
            messages.map((message) => `${field}: ${message}`),
          )
          .join(' ')
      : '';

    return details ? `${error.message} ${details}` : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
};

const validateLogin = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = {};

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password.trim()) {
    errors.password = 'Enter a password.';
  }

  return errors;
};

export default function Home() {
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [query, setQuery] = useState<PatientListQuery>(defaultQuery);
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [listStatus, setListStatus] = useState<LoadStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsStatus, setDetailsStatus] = useState<LoadStatus>('idle');
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [simulationAvailable, setSimulationAvailable] = useState(false);
  const [simulationSettings, setSimulationSettings] =
    useState<FailureSimulationSettings>(defaultFailureSimulationSettings);

  useEffect(() => {
    const storedSession = readStoredSession(window.localStorage);
    const canUseSimulation = isLocalFailureSimulationHost(
      window.location.hostname,
    );

    if (storedSession) {
      setSession(storedSession);
    }

    setSimulationAvailable(canUseSimulation);

    if (canUseSimulation) {
      setSimulationSettings(
        readFailureSimulationSettings(window.localStorage),
      );
    }

    setSessionReady(true);
  }, []);

  const handleAuthFailure = useCallback(() => {
    clearStoredSession(window.localStorage);
    setSession(null);
    setPatients([]);
    setSelectedPatient(null);
    setFormMode(null);
    setMutationError(null);
    setAuthNotice('Your session expired or was rejected. Please sign in again.');
  }, []);

  const updateSimulationSettings = useCallback(
    (settings: FailureSimulationSettings) => {
      setSimulationSettings(settings);
      saveFailureSimulationSettings(window.localStorage, settings);
    },
    [],
  );

  const refreshPatients = useCallback(async () => {
    if (!session) {
      return;
    }

    setListStatus('loading');
    setListError(null);
    setMutationError(null);

    try {
      const response = await withFailureSimulation(
        'list',
        simulationSettings,
        () =>
          listPatients(query, {
            onAuthFailure: handleAuthFailure,
            token: session.token,
          }),
      );

      setPatients(response.data);
      setTotalPatients(response.total);
      setListStatus('success');
    } catch (error) {
      if (error instanceof ApiAuthError) {
        return;
      }

      setListError(toErrorMessage(error));
      setListStatus('error');
    }
  }, [handleAuthFailure, query, session, simulationSettings]);

  useEffect(() => {
    void refreshPatients();
  }, [refreshPatients]);

  const totalPages = useMemo(
    () => getTotalPages(totalPatients, query.limit),
    [query.limit, totalPatients],
  );
  const isAdmin = canMutatePatients(session);
  const workflowView = getWorkflowView(sessionReady, session);
  const canRetryDetails = shouldShowDetailRetry(detailsStatus, detailsError);

  const submitLogin = async (
    credentials: typeof loginForm,
  ): Promise<void> => {
    const errors = validateLogin(credentials.email, credentials.password);
    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await login({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      const nextSession = {
        token: response.token,
        user: response.user,
      };

      saveStoredSession(window.localStorage, nextSession);
      setSession(nextSession);
      setAuthNotice(null);
      setLoginForm({
        email: '',
        password: '',
      });
    } catch (error) {
      setLoginError(toErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession(window.localStorage);
    setSession(null);
    setPatients([]);
      setSelectedPatient(null);
      setFormMode(null);
      setMutationError(null);
      setAuthNotice('You have signed out.');
  };

  const openDetails = async (patient: Patient) => {
    if (!session) {
      return;
    }

    setFormMode(null);
    setSelectedPatient(patient);
    setDetailsStatus('loading');
    setDetailsError(null);

    try {
      const freshPatient = await withFailureSimulation(
        'detail',
        simulationSettings,
        () =>
          getPatient(patient.id, {
            onAuthFailure: handleAuthFailure,
            token: session.token,
          }),
      );

      setSelectedPatient(freshPatient);
      setDetailsStatus('success');
    } catch (error) {
      if (error instanceof ApiAuthError) {
        return;
      }

      setDetailsError(toErrorMessage(error));
      setDetailsStatus('error');
    }
  };

  const handleSort = (field: PatientListQuery['sortBy']) => {
    setQuery((current) => nextSortQuery(current, field));
  };

  const openCreateForm = () => {
    setSelectedPatient(null);
    setEditingPatient(undefined);
    setFormError(undefined);
    setMutationError(null);
    setFormMode('create');
  };

  const openEditForm = (patient: Patient) => {
    setSelectedPatient(null);
    setEditingPatient(patient);
    setFormError(undefined);
    setMutationError(null);
    setFormMode('edit');
  };

  const submitPatientForm = async (payload: PatientWriteInput) => {
    if (!session || !formMode) {
      return;
    }

    setIsSaving(true);
    setFormError(undefined);

    try {
      const savedPatient =
        formMode === 'create'
          ? await withFailureSimulation('create', simulationSettings, () =>
              createPatient(payload, {
                onAuthFailure: handleAuthFailure,
                token: session.token,
              }),
            )
          : await withFailureSimulation('edit', simulationSettings, () =>
              updatePatient(editingPatient?.id ?? '', payload, {
                onAuthFailure: handleAuthFailure,
                token: session.token,
              }),
            );

      setFormMode(null);
      setEditingPatient(undefined);
      setSelectedPatient(savedPatient);
      setDetailsStatus('success');
      await refreshPatients();
    } catch (error) {
      if (error instanceof ApiAuthError) {
        return;
      }

      setFormError(toErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${patient.firstName} ${patient.lastName}?`,
    );

    if (!confirmed) {
      return;
    }

    setListError(null);
    setMutationError(null);

    const previousPatients = patients;
    const previousTotalPatients = totalPatients;
    const previousListStatus = listStatus;
    const previousSelectedPatient = selectedPatient;
    const previousDetailsStatus = detailsStatus;
    const nextPatients = removePatientById(previousPatients, patient.id);
    const removedCount = previousPatients.length - nextPatients.length;

    setPatients(nextPatients);
    setTotalPatients(
      getOptimisticDeleteTotal(previousTotalPatients, removedCount),
    );

    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
      setDetailsStatus('idle');
    }

    try {
      await withFailureSimulation('delete', simulationSettings, () =>
        deletePatient(patient.id, {
          onAuthFailure: handleAuthFailure,
          token: session.token,
        }),
      );

      await refreshPatients();
    } catch (error) {
      if (error instanceof ApiAuthError) {
        return;
      }

      setPatients(previousPatients);
      setTotalPatients(previousTotalPatients);
      setListStatus(previousListStatus);
      setSelectedPatient(previousSelectedPatient);
      setDetailsStatus(previousDetailsStatus);
      setMutationError(toErrorMessage(error));
    }
  };

  if (workflowView === 'checking-session') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <div className="rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
          Checking session...
        </div>
      </main>
    );
  }

  if (workflowView === 'login' || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-lg">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-800">
              Care Desk
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Patients management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in with a demo role to manage or review patient records.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoggingIn}
              onClick={() => void submitLogin(demoCredentials.admin)}
              type="button"
            >
              Admin demo
            </button>
            <button
              className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoggingIn}
              onClick={() => void submitLogin(demoCredentials.user)}
              type="button"
            >
              User demo
            </button>
          </div>

          {authNotice ? (
            <div className="mt-4">
              <StatusMessage tone="warning">{authNotice}</StatusMessage>
            </div>
          ) : null}

          {loginError ? (
            <div className="mt-4">
              <StatusMessage tone="error">{loginError}</StatusMessage>
            </div>
          ) : null}

          <form
            className="mt-5 space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void submitLogin(loginForm);
            }}
          >
            <label className="block text-sm font-medium text-slate-800" htmlFor="email">
              Email
              <input
                aria-invalid={loginErrors.email ? 'true' : 'false'}
                aria-describedby={loginErrors.email ? 'email-error' : undefined}
                autoComplete="email"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                id="email"
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                type="email"
                value={loginForm.email}
              />
              {loginErrors.email ? (
                <span className="mt-1 block text-xs font-medium text-red-700" id="email-error">
                  {loginErrors.email}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-800" htmlFor="password">
              Password
              <input
                aria-invalid={loginErrors.password ? 'true' : 'false'}
                aria-describedby={
                  loginErrors.password ? 'password-error' : undefined
                }
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                id="password"
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                type="password"
                value={loginForm.password}
              />
              {loginErrors.password ? (
                <span className="mt-1 block text-xs font-medium text-red-700" id="password-error">
                  {loginErrors.password}
                </span>
              ) : null}
            </label>

            <button
              className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoggingIn}
              type="submit"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
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
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        {!isAdmin ? (
          <StatusMessage tone="info">
            View-only role: patient details are available, while create, edit,
            and delete controls are hidden. The API still enforces this with
            server-side authorization.
          </StatusMessage>
        ) : null}

        {simulationAvailable ? (
          <FailureSimulationPanel
            onChange={updateSimulationSettings}
            settings={simulationSettings}
          />
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <label className="block flex-1 text-sm font-medium text-slate-800" htmlFor="patient-search">
                  Search patients
                  <input
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    id="patient-search"
                    onChange={(event) =>
                      setQuery((current) => ({
                        ...current,
                        page: 1,
                        search: event.target.value,
                      }))
                    }
                    placeholder="Name, email, or phone"
                    type="search"
                    value={query.search}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-800" htmlFor="page-size">
                  Rows
                  <select
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:w-28"
                    id="page-size"
                    onChange={(event) =>
                      setQuery((current) => ({
                        ...current,
                        limit: Number(event.target.value),
                        page: 1,
                      }))
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
                    onClick={openCreateForm}
                    type="button"
                  >
                    New patient
                  </button>
                ) : null}
              </div>
            </div>

            {shouldShowListRetry(listStatus, listError) ? (
              <StatusMessage title="Unable to load patients" tone="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{listError}</span>
                  <button
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={listStatus === 'loading'}
                    onClick={() => void refreshPatients()}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              </StatusMessage>
            ) : null}

            {mutationError ? (
              <StatusMessage title="Patient action failed" tone="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{mutationError}</span>
                  <button
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={listStatus === 'loading'}
                    onClick={() => void refreshPatients()}
                    type="button"
                  >
                    Refresh list
                  </button>
                </div>
              </StatusMessage>
            ) : null}

            <PatientTable
              isAdmin={isAdmin}
              isLoading={listStatus === 'loading'}
              onDelete={(patient) => void handleDelete(patient)}
              onDetails={(patient) => void openDetails(patient)}
              onEdit={openEditForm}
              onSort={handleSort}
              patients={patients}
              sortBy={query.sortBy}
              sortDir={query.sortDir}
            />

            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                Page <span className="font-semibold">{query.page}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
                <span className="ml-2 text-slate-500">
                  {totalPatients} total
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={query.page <= 1 || listStatus === 'loading'}
                  onClick={() =>
                    setQuery((current) => ({
                      ...current,
                      page: Math.max(1, current.page - 1),
                    }))
                  }
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={query.page >= totalPages || listStatus === 'loading'}
                  onClick={() =>
                    setQuery((current) => ({
                      ...current,
                      page: Math.min(totalPages, current.page + 1),
                    }))
                  }
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            {formMode ? (
              <PatientForm
                isSubmitting={isSaving}
                mode={formMode}
                onCancel={() => {
                  setFormMode(null);
                  setEditingPatient(undefined);
                  setFormError(undefined);
                }}
                onSubmit={submitPatientForm}
                patient={editingPatient}
                serverError={formError}
              />
            ) : selectedPatient ? (
              <PatientDetails
                error={detailsError}
                isLoading={detailsStatus === 'loading'}
                onRetry={() => void openDetails(selectedPatient)}
                patient={selectedPatient}
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

function PatientDetails({
  error,
  isLoading,
  onRetry,
  patient,
  showRetry,
}: {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly onRetry: () => void;
  readonly patient: Patient;
  readonly showRetry: boolean;
}) {
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
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function FailureSimulationPanel({
  onChange,
  settings,
}: {
  readonly onChange: (settings: FailureSimulationSettings) => void;
  readonly settings: FailureSimulationSettings;
}) {
  const update = (next: Partial<FailureSimulationSettings>) => {
    onChange({
      ...settings,
      ...next,
    });
  };

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 font-semibold">
          <input
            checked={settings.enabled}
            className="h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
            onChange={(event) => update({ enabled: event.target.checked })}
            type="checkbox"
          />
          Local reliability simulation
        </label>
        <span className="rounded bg-white/70 px-2 py-1 text-xs font-semibold uppercase text-amber-900">
          {settings.enabled ? 'On' : 'Off'}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <label className="block font-medium" htmlFor="simulation-target">
          Fail target
          <select
            className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!settings.enabled}
            id="simulation-target"
            onChange={(event) =>
              update({
                target: event.target.value as FailureSimulationTargetSelection,
              })
            }
            value={settings.target}
          >
            <option value="all">All requests</option>
            {failureSimulationTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>
        </label>

        <label className="block font-medium" htmlFor="simulation-latency">
          Latency
          <select
            className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!settings.enabled}
            id="simulation-latency"
            onChange={(event) =>
              update({ latencyMs: Number(event.target.value) })
            }
            value={settings.latencyMs}
          >
            <option value={0}>0 ms</option>
            <option value={300}>300 ms</option>
            <option value={600}>600 ms</option>
            <option value={1200}>1200 ms</option>
          </select>
        </label>
      </div>
    </section>
  );
}
