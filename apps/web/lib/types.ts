export type UserRole = 'admin' | 'user';

export interface AuthUser {
  readonly email: string;
  readonly role: UserRole;
}

export interface LoginResponse {
  readonly token: string;
  readonly user: AuthUser;
}

export interface Patient {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dob: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PatientWriteInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly dob: string;
}

export const PATIENT_SORT_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'dob',
  'createdAt',
  'updatedAt',
] as const;

export type PatientSortBy = (typeof PATIENT_SORT_FIELDS)[number];

export type PatientSortDir = 'asc' | 'desc';

export interface PatientListQuery {
  readonly page: number;
  readonly limit: number;
  readonly search: string;
  readonly sortBy: PatientSortBy;
  readonly sortDir: PatientSortDir;
}

export interface PatientListResponse {
  readonly data: readonly Patient[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export type ValidationDetails = Record<string, string[]>;
