'use client';

import { useCallback, useState } from 'react';

import type { Patient } from '../lib/types';

export type FormMode = 'create' | 'edit';

export function usePatientFormState() {
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const resetFormState = useCallback(() => {
    setFormMode(null);
    setEditingPatient(undefined);
    setFormError(undefined);
    setIsSaving(false);
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingPatient(undefined);
    setFormError(undefined);
    setFormMode('create');
  }, []);

  const openEditForm = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setFormError(undefined);
    setFormMode('edit');
  }, []);

  const cancelForm = useCallback(() => {
    setFormMode(null);
    setEditingPatient(undefined);
    setFormError(undefined);
  }, []);

  return {
    cancelForm,
    editingPatient,
    formError,
    formMode,
    isSaving,
    openCreateForm,
    openEditForm,
    resetFormState,
    setEditingPatient,
    setFormError,
    setFormMode,
    setIsSaving,
  };
}
