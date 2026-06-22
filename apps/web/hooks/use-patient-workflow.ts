'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ApiAuthError,
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient,
} from '../lib/api';
import { toErrorMessage } from '../lib/api-error-message';
import type { FailureSimulationSettings } from '../lib/failure-simulation';
import { withFailureSimulation } from '../lib/failure-simulation';
import type { StoredSession } from '../lib/session';
import type {
  Patient,
  PatientListQuery,
  PatientWriteInput,
} from '../lib/types';
import {
  addPatientToCurrentPage,
  canMutatePatients,
  createOptimisticPatient,
  getOptimisticDeleteTotal,
  getTotalPages,
  nextSortQuery,
  removePatientById,
  replacePatientById,
  replacePatientByIdOrAddToCurrentPage,
  type LoadStatus,
} from '../lib/workflow';

const defaultQuery: PatientListQuery = {
  limit: 10,
  page: 1,
  search: '',
  sortBy: 'lastName',
  sortDir: 'asc',
};

type FormMode = 'create' | 'edit';

interface UsePatientWorkflowOptions {
  readonly onAuthFailure: () => void;
  readonly session: StoredSession | null;
  readonly simulationSettings: FailureSimulationSettings;
}

export function usePatientWorkflow({
  onAuthFailure,
  session,
  simulationSettings,
}: UsePatientWorkflowOptions) {
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

  const resetPatientState = useCallback(() => {
    setPatients([]);
    setTotalPatients(0);
    setListStatus('idle');
    setListError(null);
    setMutationError(null);
    setSelectedPatient(null);
    setDetailsStatus('idle');
    setDetailsError(null);
    setFormMode(null);
    setEditingPatient(undefined);
    setFormError(undefined);
  }, []);

  const handleAuthFailure = useCallback(() => {
    resetPatientState();
    onAuthFailure();
  }, [onAuthFailure, resetPatientState]);

  useEffect(() => {
    if (!session) {
      resetPatientState();
    }
  }, [resetPatientState, session]);

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

  const openDetails = useCallback(
    async (patient: Patient) => {
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
    },
    [handleAuthFailure, session, simulationSettings],
  );

  const handleSort = useCallback((field: PatientListQuery['sortBy']) => {
    setQuery((current) => nextSortQuery(current, field));
  }, []);

  const openCreateForm = useCallback(() => {
    setSelectedPatient(null);
    setEditingPatient(undefined);
    setFormError(undefined);
    setMutationError(null);
    setFormMode('create');
  }, []);

  const openEditForm = useCallback((patient: Patient) => {
    setSelectedPatient(null);
    setEditingPatient(patient);
    setFormError(undefined);
    setMutationError(null);
    setFormMode('edit');
  }, []);

  const cancelForm = useCallback(() => {
    setFormMode(null);
    setEditingPatient(undefined);
    setFormError(undefined);
  }, []);

  const submitPatientForm = useCallback(
    async (payload: PatientWriteInput) => {
      if (!session || !formMode) {
        return;
      }

      if (!canMutatePatients(session)) {
        setFormError(
          'Your role can view patients, but cannot change records.',
        );
        return;
      }

      setIsSaving(true);
      setFormError(undefined);

      const previousPatients = patients;
      const previousTotalPatients = totalPatients;
      const previousSelectedPatient = selectedPatient;
      const previousDetailsStatus = detailsStatus;
      const optimisticTimestamp = new Date().toISOString();
      const optimisticPatient =
        formMode === 'create'
          ? createOptimisticPatient(
              payload,
              `optimistic-${crypto.randomUUID()}`,
              optimisticTimestamp,
            )
          : editingPatient
            ? {
                ...editingPatient,
                ...payload,
                updatedAt: optimisticTimestamp,
              }
            : undefined;

      if (optimisticPatient) {
        setPatients((current) =>
          formMode === 'create'
            ? addPatientToCurrentPage(current, optimisticPatient, query.limit)
            : replacePatientById(current, optimisticPatient),
        );
        setSelectedPatient(optimisticPatient);
        setDetailsStatus('success');

        if (formMode === 'create') {
          setTotalPatients((current) => current + 1);
        }
      }

      let savedPatient: Patient;

      try {
        savedPatient =
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
      } catch (error) {
        if (error instanceof ApiAuthError) {
          return;
        }

        setPatients(previousPatients);
        setTotalPatients(previousTotalPatients);
        setSelectedPatient(previousSelectedPatient);
        setDetailsStatus(previousDetailsStatus);
        setFormError(toErrorMessage(error));
        return;
      } finally {
        setIsSaving(false);
      }

      setPatients((current) =>
        replacePatientByIdOrAddToCurrentPage(
          current,
          formMode === 'create'
            ? (optimisticPatient?.id ?? savedPatient.id)
            : savedPatient.id,
          savedPatient,
          query.limit,
        ),
      );
      setFormMode(null);
      setEditingPatient(undefined);
      setSelectedPatient(savedPatient);
      setDetailsStatus('success');

      await refreshPatients();
    },
    [
      detailsStatus,
      editingPatient,
      formMode,
      handleAuthFailure,
      patients,
      query.limit,
      refreshPatients,
      selectedPatient,
      session,
      simulationSettings,
      totalPatients,
    ],
  );

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
    },
    [
      detailsStatus,
      handleAuthFailure,
      listStatus,
      patients,
      refreshPatients,
      selectedPatient,
      session,
      simulationSettings,
      totalPatients,
    ],
  );

  return {
    cancelForm,
    detailsError,
    detailsStatus,
    editingPatient,
    formError,
    formMode,
    handleDelete,
    handleSort,
    isAdmin: canMutatePatients(session),
    isSaving,
    listError,
    listStatus,
    mutationError,
    openCreateForm,
    openDetails,
    openEditForm,
    patients,
    query,
    refreshPatients,
    selectedPatient,
    setQuery,
    submitPatientForm,
    totalPages,
    totalPatients,
  };
}
