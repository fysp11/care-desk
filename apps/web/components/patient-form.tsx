'use client';

import { useEffect, useMemo } from 'react';
import {
  useForm,
  type FieldErrors,
  type FieldPath,
  type Resolver,
  type UseFormRegisterReturn,
} from 'react-hook-form';

import {
  emptyPatientFormValues,
  patientFormSchema,
  patientToFormValues,
  toPatientPayload,
  type PatientFormValues,
} from '../lib/patient-schema';
import type { Patient, PatientWriteInput } from '../lib/types';

interface PatientFormProps {
  readonly isSubmitting: boolean;
  readonly mode: 'create' | 'edit';
  readonly onCancel: () => void;
  readonly onSubmit: (payload: PatientWriteInput) => Promise<void>;
  readonly patient?: Patient | undefined;
  readonly serverError?: string | undefined;
}

const fieldLabels: Record<FieldPath<PatientFormValues>, string> = {
  dob: 'Date of birth',
  email: 'Email',
  firstName: 'First name',
  lastName: 'Last name',
  phoneNumber: 'Phone number',
};

const patientResolver: Resolver<PatientFormValues> = async (values) => {
  const result = patientFormSchema.safeParse(values);

  if (result.success) {
    return {
      errors: {},
      values: result.data,
    };
  }

  const errors: FieldErrors<PatientFormValues> = {};

  for (const issue of result.error.issues) {
    const [field] = issue.path;

    if (typeof field !== 'string' || !(field in fieldLabels)) {
      continue;
    }

    errors[field as FieldPath<PatientFormValues>] = {
      message: issue.message,
      type: 'validation',
    };
  }

  return {
    errors,
    values: {},
  };
};

export function PatientForm({
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  patient,
  serverError,
}: PatientFormProps) {
  const defaultValues = useMemo(
    () => (patient ? patientToFormValues(patient) : emptyPatientFormValues),
    [patient],
  );
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<PatientFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: patientResolver,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(toPatientPayload(values));
  });

  const title = mode === 'create' ? 'Create patient' : 'Edit patient';

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          All fields are required and validated before submission.
        </p>
      </div>

      {serverError ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          role="alert"
        >
          {serverError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          error={errors.firstName?.message}
          label="First name"
          registration={register('firstName')}
        />
        <FormField
          autoComplete="family-name"
          error={errors.lastName?.message}
          label="Last name"
          registration={register('lastName')}
        />
      </div>

      <FormField
        autoComplete="email"
        error={errors.email?.message}
        label="Email"
        registration={register('email')}
        type="email"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          label="Phone number"
          registration={register('phoneNumber')}
          type="tel"
        />
        <FormField
          error={errors.dob?.message}
          label="Date of birth"
          registration={register('dob')}
          type="date"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting || (!isDirty && mode === 'edit')}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  readonly autoComplete?: string | undefined;
  readonly error?: string | undefined;
  readonly label: string;
  readonly registration: UseFormRegisterReturn<FieldPath<PatientFormValues>>;
  readonly type?: string | undefined;
}

function FormField({
  autoComplete,
  error,
  label,
  registration,
  type = 'text',
}: FormFieldProps) {
  const id = registration.name;

  return (
    <label className="block text-sm font-medium text-slate-800" htmlFor={id}>
      {label}
      <input
        {...registration}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-slate-100"
        id={id}
        type={type}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-700" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
