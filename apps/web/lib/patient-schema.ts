import { z } from 'zod';

import type { Patient, PatientWriteInput } from './types';

const phoneNumberPattern = /^\+?[0-9 ()-]{7,24}$/;
const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

const trimString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const nonBlankText = (label: string, maxLength: number) =>
  z.preprocess(
    trimString,
    z
      .string()
      .min(1, `${label} is required.`)
      .max(maxLength, `${label} must be ${maxLength} characters or fewer.`),
  );

const isValidDateOnly = (value: string): boolean => {
  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isNotFutureDate = (value: string): boolean =>
  value <= new Date().toISOString().slice(0, 10);

export const patientFormSchema = z.object({
  dob: z.preprocess(
    trimString,
    z
      .string()
      .regex(dobPattern, 'Use YYYY-MM-DD format.')
      .refine(isValidDateOnly, 'Enter a valid date of birth.')
      .refine(isNotFutureDate, 'Date of birth cannot be in the future.'),
  ),
  email: z.preprocess(
    normalizeEmail,
    z.email('Enter a valid email address.').max(254, 'Email is too long.'),
  ),
  firstName: nonBlankText('First name', 80),
  lastName: nonBlankText('Last name', 80),
  phoneNumber: z.preprocess(
    trimString,
    z
      .string()
      .regex(
        phoneNumberPattern,
        'Use digits, spaces, parentheses, hyphens, and an optional leading plus.',
      )
      .max(32, 'Phone number is too long.'),
  ),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const emptyPatientFormValues: PatientFormValues = {
  dob: '',
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
};

export const patientToFormValues = (patient: Patient): PatientFormValues => ({
  dob: patient.dob,
  email: patient.email,
  firstName: patient.firstName,
  lastName: patient.lastName,
  phoneNumber: patient.phoneNumber,
});

export const toPatientPayload = (
  values: PatientFormValues,
): PatientWriteInput => ({
  dob: values.dob,
  email: values.email,
  firstName: values.firstName,
  lastName: values.lastName,
  phoneNumber: values.phoneNumber,
});
