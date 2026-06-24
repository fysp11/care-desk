'use client';

import { useCallback, useState } from 'react';

import { ApiAuthError, getPatient } from '../lib/api';
import { toErrorMessage } from '../lib/api-error-message';
import type { StoredSession } from '../lib/session';
import type { Patient } from '../lib/types';
import type { LoadStatus } from '../lib/workflow';

interface UsePatientDetailsStateOptions {
  readonly onAuthFailure: () => void;
  readonly onOpenDetails: () => void;
  readonly session: StoredSession | null;
}

export function usePatientDetailsState({
  onAuthFailure,
  onOpenDetails,
  session,
}: UsePatientDetailsStateOptions) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsStatus, setDetailsStatus] = useState<LoadStatus>('idle');
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const resetDetailsState = useCallback(() => {
    setSelectedPatient(null);
    setDetailsStatus('idle');
    setDetailsError(null);
  }, []);

  const openDetails = useCallback(
    async (patient: Patient) => {
      if (!session) {
        return;
      }

      onOpenDetails();
      setSelectedPatient(patient);
      setDetailsStatus('loading');
      setDetailsError(null);

      try {
        const freshPatient = await getPatient(patient.id, {
          onAuthFailure,
          token: session.token,
        });

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
    [onAuthFailure, onOpenDetails, session],
  );

  return {
    detailsError,
    detailsStatus,
    openDetails,
    resetDetailsState,
    selectedPatient,
    setDetailsError,
    setDetailsStatus,
    setSelectedPatient,
  };
}
