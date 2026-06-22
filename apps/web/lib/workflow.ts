import type { StoredSession } from './session';
import type { Patient, PatientListQuery, PatientSortBy } from './types';

export type WorkflowView = 'checking-session' | 'login' | 'patients';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export const getWorkflowView = (
  sessionReady: boolean,
  session: StoredSession | null,
): WorkflowView => {
  if (!sessionReady) {
    return 'checking-session';
  }

  return session ? 'patients' : 'login';
};

export const canMutatePatients = (
  session: StoredSession | null,
): boolean => session?.user.role === 'admin';

export const getTotalPages = (
  totalPatients: number,
  limit: number,
): number => Math.max(1, Math.ceil(totalPatients / Math.max(1, limit)));

export const shouldShowListRetry = (
  status: LoadStatus,
  error: string | null,
): boolean => status === 'error' && Boolean(error);

export const shouldShowDetailRetry = (
  status: LoadStatus,
  error: string | null,
): boolean => status === 'error' && Boolean(error);

export const nextSortQuery = (
  current: PatientListQuery,
  field: PatientSortBy,
): PatientListQuery => ({
  ...current,
  page: 1,
  sortBy: field,
  sortDir:
    current.sortBy === field && current.sortDir === 'asc' ? 'desc' : 'asc',
});

export const removePatientById = (
  patients: readonly Patient[],
  patientId: string,
): readonly Patient[] =>
  patients.filter((patient) => patient.id !== patientId);

export const getOptimisticDeleteTotal = (
  totalPatients: number,
  removedCount: number,
): number => Math.max(0, totalPatients - Math.max(0, removedCount));
