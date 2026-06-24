import type {
  Patient,
  PatientListOptions,
  PatientListResponse,
  PatientWriteInput,
} from './types.js';

export const PATIENTS_REPOSITORY = Symbol('PatientsRepository');

export interface PatientsRepository {
  findById(id: string): Promise<Patient | undefined>;
  findByEmail(email: string): Promise<Patient | undefined>;
  list(options: PatientListOptions): Promise<PatientListResponse>;
  create(input: PatientWriteInput): Promise<Patient>;
  update(id: string, input: PatientWriteInput): Promise<Patient | undefined>;
  delete(id: string): Promise<boolean>;
}

export interface ResettablePatientsRepository {
  reset(): Promise<void>;
}
