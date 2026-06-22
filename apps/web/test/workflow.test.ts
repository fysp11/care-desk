import { describe, expect, test } from 'bun:test';

import type { StoredSession } from '../lib/session';
import type { Patient, PatientListQuery } from '../lib/types';
import {
  canMutatePatients,
  getOptimisticDeleteTotal,
  getTotalPages,
  getWorkflowView,
  nextSortQuery,
  removePatientById,
  shouldShowDetailRetry,
  shouldShowListRetry,
} from '../lib/workflow';

const adminSession: StoredSession = {
  token: 'admin-token',
  user: {
    email: 'admin@example.com',
    role: 'admin',
  },
};

const userSession: StoredSession = {
  token: 'user-token',
  user: {
    email: 'user@example.com',
    role: 'user',
  },
};

const defaultQuery: PatientListQuery = {
  limit: 10,
  page: 3,
  search: 'Ada',
  sortBy: 'lastName',
  sortDir: 'asc',
};

const patients: readonly Patient[] = [
  {
    createdAt: '2026-01-01T00:00:00.000Z',
    dob: '1988-03-14',
    email: 'nora.frost@example.com',
    firstName: 'Nora',
    id: 'patient-1',
    lastName: 'Frost',
    phoneNumber: '+1 (555) 0140',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    createdAt: '2026-01-02T00:00:00.000Z',
    dob: '1991-07-09',
    email: 'miles.reed@example.com',
    firstName: 'Miles',
    id: 'patient-2',
    lastName: 'Reed',
    phoneNumber: '+1 (555) 0199',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('frontend workflow decisions', () => {
  test('chooses the expected app view from session readiness and session state', () => {
    expect(getWorkflowView(false, null)).toBe('checking-session');
    expect(getWorkflowView(true, null)).toBe('login');
    expect(getWorkflowView(true, adminSession)).toBe('patients');
  });

  test('gates mutation controls by role while keeping user workflow view-only', () => {
    expect(canMutatePatients(adminSession)).toBe(true);
    expect(canMutatePatients(userSession)).toBe(false);
    expect(canMutatePatients(null)).toBe(false);
  });

  test('resets pagination and toggles sort direction for table headings', () => {
    expect(nextSortQuery(defaultQuery, 'lastName')).toEqual({
      ...defaultQuery,
      page: 1,
      sortDir: 'desc',
    });

    expect(nextSortQuery(defaultQuery, 'dob')).toEqual({
      ...defaultQuery,
      page: 1,
      sortBy: 'dob',
      sortDir: 'asc',
    });
  });

  test('keeps pagination stable for empty lists and invalid local limits', () => {
    expect(getTotalPages(0, 10)).toBe(1);
    expect(getTotalPages(41, 10)).toBe(5);
    expect(getTotalPages(41, 0)).toBe(41);
  });

  test('shows retry only when the patient list is in an error state with a message', () => {
    expect(shouldShowListRetry('error', 'Network failed.')).toBe(true);
    expect(shouldShowListRetry('error', null)).toBe(false);
    expect(shouldShowListRetry('loading', 'Network failed.')).toBe(false);
    expect(shouldShowListRetry('success', 'Network failed.')).toBe(false);
  });

  test('shows detail retry only for recoverable detail errors', () => {
    expect(shouldShowDetailRetry('error', 'Record failed.')).toBe(true);
    expect(shouldShowDetailRetry('error', null)).toBe(false);
    expect(shouldShowDetailRetry('loading', 'Record failed.')).toBe(false);
  });

  test('computes optimistic delete removal and total rollback inputs', () => {
    expect(removePatientById(patients, 'patient-1')).toEqual([patients[1]]);
    expect(removePatientById(patients, 'missing')).toEqual(patients);
    expect(getOptimisticDeleteTotal(12, 1)).toBe(11);
    expect(getOptimisticDeleteTotal(0, 1)).toBe(0);
  });
});
