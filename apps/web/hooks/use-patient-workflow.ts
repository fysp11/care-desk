'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  ApiAuthError,
  createPatient,
  deletePatient,
  updatePatient,
} from '../lib/api';
import { toErrorMessage } from '../lib/api-error-message';
import type { StoredSession } from '../lib/session';
import type { Patient, PatientWriteInput } from '../lib/types';
import {
  addPatientToCurrentPage,
  canMutatePatients,
  createOptimisticPatient,
  getOptimisticDeleteTotal,
  removePatientById,
  replacePatientById,
  replacePatientByIdOrAddToCurrentPage,
} from '../lib/workflow';
import { usePatientDetailsState } from './use-patient-details-state';
import { usePatientFormState } from './use-patient-form-state';
import { usePatientListState } from './use-patient-list-state';

interface UsePatientWorkflowOptions {
  readonly onAuthFailure: () => void;
  readonly session: StoredSession | null;
}

export function usePatientWorkflow({
  onAuthFailure,
  session,
}: UsePatientWorkflowOptions) {
  const resetPatientStateRef = useRef<() => void>(() => {});
  const handleAuthFailure = useCallback(() => {
    resetPatientStateRef.current();
    onAuthFailure();
  }, [onAuthFailure]);

  const patientList = usePatientListState({
    onAuthFailure: handleAuthFailure,
    session,
  });
  const patientForm = usePatientFormState();
  const closeFormForDetails = useCallback(() => {
    patientForm.setFormMode(null);
  }, [patientForm.setFormMode]);
  const patientDetails = usePatientDetailsState({
    onAuthFailure: handleAuthFailure,
    onOpenDetails: closeFormForDetails,
    session,
  });

  const resetPatientState = useCallback(() => {
    patientList.resetListState();
    patientDetails.resetDetailsState();
    patientForm.resetFormState();
  }, [
    patientDetails.resetDetailsState,
    patientForm.resetFormState,
    patientList.resetListState,
  ]);

  useEffect(() => {
    resetPatientStateRef.current = resetPatientState;
  }, [resetPatientState]);

  useEffect(() => {
    if (!session) {
      resetPatientState();
    }
  }, [resetPatientState, session]);

  const openCreateForm = useCallback(() => {
    patientDetails.setSelectedPatient(null);
    patientList.setMutationError(null);
    patientForm.openCreateForm();
  }, [
    patientDetails.setSelectedPatient,
    patientForm.openCreateForm,
    patientList.setMutationError,
  ]);

  const openEditForm = useCallback(
    (patient: Patient) => {
      patientDetails.setSelectedPatient(null);
      patientList.setMutationError(null);
      patientForm.openEditForm(patient);
    },
    [
      patientDetails.setSelectedPatient,
      patientForm.openEditForm,
      patientList.setMutationError,
    ],
  );

  const submitPatientForm = useCallback(
    async (payload: PatientWriteInput) => {
      if (!session || !patientForm.formMode) {
        return;
      }

      if (!canMutatePatients(session)) {
        patientForm.setFormError(
          'Your role can view patients, but cannot change records.',
        );
        return;
      }

      patientForm.setIsSaving(true);
      patientForm.setFormError(undefined);

      const previousPatients = patientList.patients;
      const previousTotalPatients = patientList.totalPatients;
      const previousSelectedPatient = patientDetails.selectedPatient;
      const previousDetailsStatus = patientDetails.detailsStatus;
      const optimisticTimestamp = new Date().toISOString();
      const optimisticPatient =
        patientForm.formMode === 'create'
          ? createOptimisticPatient(
              payload,
              `optimistic-${crypto.randomUUID()}`,
              optimisticTimestamp,
            )
          : patientForm.editingPatient
            ? {
                ...patientForm.editingPatient,
                ...payload,
                updatedAt: optimisticTimestamp,
              }
            : undefined;

      if (optimisticPatient) {
        patientList.setPatients((current) =>
          patientForm.formMode === 'create'
            ? addPatientToCurrentPage(
                current,
                optimisticPatient,
                patientList.query.limit,
              )
            : replacePatientById(current, optimisticPatient),
        );
        patientDetails.setSelectedPatient(optimisticPatient);
        patientDetails.setDetailsStatus('success');

        if (patientForm.formMode === 'create') {
          patientList.setTotalPatients((current) => current + 1);
        }
      }

      let savedPatient: Patient;

      try {
        savedPatient =
          patientForm.formMode === 'create'
            ? await createPatient(payload, {
                onAuthFailure: handleAuthFailure,
                token: session.token,
              })
            : await updatePatient(patientForm.editingPatient?.id ?? '', payload, {
                onAuthFailure: handleAuthFailure,
                token: session.token,
              });
      } catch (error) {
        if (error instanceof ApiAuthError) {
          return;
        }

        patientList.setPatients(previousPatients);
        patientList.setTotalPatients(previousTotalPatients);
        patientDetails.setSelectedPatient(previousSelectedPatient);
        patientDetails.setDetailsStatus(previousDetailsStatus);
        patientForm.setFormError(toErrorMessage(error));
        return;
      } finally {
        patientForm.setIsSaving(false);
      }

      patientList.setPatients((current) =>
        replacePatientByIdOrAddToCurrentPage(
          current,
          patientForm.formMode === 'create'
            ? (optimisticPatient?.id ?? savedPatient.id)
            : savedPatient.id,
          savedPatient,
          patientList.query.limit,
        ),
      );
      patientForm.setFormMode(null);
      patientForm.setEditingPatient(undefined);
      patientDetails.setSelectedPatient(savedPatient);
      patientDetails.setDetailsStatus('success');

      await patientList.refreshPatients();
    },
    [
      handleAuthFailure,
      patientDetails.detailsStatus,
      patientDetails.selectedPatient,
      patientDetails.setDetailsStatus,
      patientDetails.setSelectedPatient,
      patientForm.editingPatient,
      patientForm.formMode,
      patientForm.setEditingPatient,
      patientForm.setFormError,
      patientForm.setFormMode,
      patientForm.setIsSaving,
      patientList.patients,
      patientList.query.limit,
      patientList.refreshPatients,
      patientList.setPatients,
      patientList.setTotalPatients,
      patientList.totalPatients,
      session,
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

      patientList.setListError(null);
      patientList.setMutationError(null);

      const previousPatients = patientList.patients;
      const previousTotalPatients = patientList.totalPatients;
      const previousListStatus = patientList.listStatus;
      const previousSelectedPatient = patientDetails.selectedPatient;
      const previousDetailsStatus = patientDetails.detailsStatus;
      const nextPatients = removePatientById(previousPatients, patient.id);
      const removedCount = previousPatients.length - nextPatients.length;

      patientList.setPatients(nextPatients);
      patientList.setTotalPatients(
        getOptimisticDeleteTotal(previousTotalPatients, removedCount),
      );

      if (patientDetails.selectedPatient?.id === patient.id) {
        patientDetails.setSelectedPatient(null);
        patientDetails.setDetailsStatus('idle');
      }

      try {
        await deletePatient(patient.id, {
          onAuthFailure: handleAuthFailure,
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
        patientDetails.setSelectedPatient(previousSelectedPatient);
        patientDetails.setDetailsStatus(previousDetailsStatus);
        patientList.setMutationError(toErrorMessage(error));
      }
    },
    [
      handleAuthFailure,
      patientDetails.detailsStatus,
      patientDetails.selectedPatient,
      patientDetails.setDetailsStatus,
      patientDetails.setSelectedPatient,
      patientList.listStatus,
      patientList.patients,
      patientList.refreshPatients,
      patientList.setListError,
      patientList.setListStatus,
      patientList.setMutationError,
      patientList.setPatients,
      patientList.setTotalPatients,
      patientList.totalPatients,
      session,
    ],
  );

  return {
    cancelForm: patientForm.cancelForm,
    detailsError: patientDetails.detailsError,
    detailsStatus: patientDetails.detailsStatus,
    editingPatient: patientForm.editingPatient,
    formError: patientForm.formError,
    formMode: patientForm.formMode,
    handleDelete,
    handleSort: patientList.handleSort,
    isAdmin: canMutatePatients(session),
    isSaving: patientForm.isSaving,
    listError: patientList.listError,
    listStatus: patientList.listStatus,
    mutationError: patientList.mutationError,
    openCreateForm,
    openDetails: patientDetails.openDetails,
    openEditForm,
    patients: patientList.patients,
    query: patientList.query,
    refreshPatients: patientList.refreshPatients,
    selectedPatient: patientDetails.selectedPatient,
    setQuery: patientList.setQuery,
    submitPatientForm,
    totalPages: patientList.totalPages,
    totalPatients: patientList.totalPatients,
  };
}
