import { z } from 'zod';

import type { Patient, PatientWriteInput } from './types';

const phoneNumberPattern = /^\+?[0-9 ()-]{7,32}$/;
const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
const dateOnlyLength = 'YYYY-MM-DD'.length;

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

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, dateOnlyLength) === value
  );
};

const localDateOnly = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const isNotFutureDate = (value: string): boolean =>
  value <= localDateOnly(new Date());

interface PatientFormIssue {
  readonly message: string;
  readonly path: readonly PropertyKey[];
}

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
      .max(32, 'Phone number is too long.')
      .regex(
        phoneNumberPattern,
        'Use digits, spaces, parentheses, hyphens, and an optional leading plus.',
      ),
  ),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
export type PatientFormErrorMessages = Partial<
  Record<keyof PatientFormValues, string>
>;

export const firstPatientFormErrorMessages = (
  issues: readonly PatientFormIssue[],
): PatientFormErrorMessages => {
  const messages: PatientFormErrorMessages = {};

  for (const issue of issues) {
    const [field] = issue.path;

    if (field === undefined) {
      continue;
    }

    if (!Object.hasOwn(patientFormSchema.shape, field)) {
      continue;
    }

    const formField = field as keyof PatientFormValues;

    messages[formField] ??= issue.message;
  }

  return messages;
};

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
