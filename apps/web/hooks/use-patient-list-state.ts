'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiAuthError, listPatients } from '../lib/api';
import { toErrorMessage } from '../lib/api-error-message';
import type { StoredSession } from '../lib/session';
import type { Patient, PatientListQuery } from '../lib/types';
import {
  getTotalPages,
  nextSortQuery,
  type LoadStatus,
} from '../lib/workflow';

const defaultQuery: PatientListQuery = {
  limit: 10,
  page: 1,
  search: '',
  sortBy: 'lastName',
  sortDir: 'asc',
};

interface UsePatientListStateOptions {
  readonly onAuthFailure: () => void;
  readonly session: StoredSession | null;
}

export function usePatientListState({
  onAuthFailure,
  session,
}: UsePatientListStateOptions) {
  const [query, setQuery] = useState<PatientListQuery>(defaultQuery);
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [listStatus, setListStatus] = useState<LoadStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const resetListState = useCallback(() => {
    setPatients([]);
    setTotalPatients(0);
    setListStatus('idle');
    setListError(null);
    setMutationError(null);
  }, []);

  const refreshPatients = useCallback(async () => {
    if (!session) {
      return;
    }

    setListStatus('loading');
    setListError(null);
    setMutationError(null);

    try {
      const response = await listPatients(query, {
        onAuthFailure,
        token: session.token,
      });

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
  }, [onAuthFailure, query, session]);

  useEffect(() => {
    void refreshPatients();
  }, [refreshPatients]);

  const totalPages = useMemo(
    () => getTotalPages(totalPatients, query.limit),
    [query.limit, totalPatients],
  );

  const handleSort = useCallback((field: PatientListQuery['sortBy']) => {
    setQuery((current) => nextSortQuery(current, field));
  }, []);

  return {
    handleSort,
    listError,
    listStatus,
    mutationError,
    patients,
    query,
    refreshPatients,
    resetListState,
    setListError,
    setListStatus,
    setMutationError,
    setPatients,
    setQuery,
    setTotalPatients,
    totalPages,
    totalPatients,
  };
}
