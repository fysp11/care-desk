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
  firstPatientFormErrorMessages,
  patientFormSchema,
  patientToFormValues,
  toPatientPayload,
  type PatientFormValues,
} from '../lib/patient-schema';
import type { Patient, PatientWriteInput } from '../lib/types';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PatientFormProps {
  readonly isSubmitting: boolean;
  readonly mode: 'create' | 'edit';
  readonly onCancel: () => void;
  readonly onSubmit: (payload: PatientWriteInput) => Promise<void>;
  readonly patient?: Patient | undefined;
  readonly serverError?: string | undefined;
}

const patientResolver: Resolver<PatientFormValues> = async (values) => {
  const result = patientFormSchema.safeParse(values);

  if (result.success) {
    return {
      errors: {},
      values: result.data,
    };
  }

  const errors: FieldErrors<PatientFormValues> = {};

  const messages = firstPatientFormErrorMessages(result.error.issues);

  for (const [field, message] of Object.entries(messages)) {
    errors[field as FieldPath<PatientFormValues>] = {
      message,
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
    <form className="flex flex-col gap-4" noValidate onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">
          All fields are required and validated before submission.
        </p>
      </div>

      {serverError ? (
        <Alert role="alert" variant="destructive">
          {serverError}
        </Alert>
      ) : null}

      <FieldGroup className="sm:grid sm:grid-cols-2">
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
      </FieldGroup>

      <FormField
        autoComplete="email"
        error={errors.email?.message}
        label="Email"
        registration={register('email')}
        type="email"
      />

      <FieldGroup className="sm:grid sm:grid-cols-2">
        <FormField
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          label="Phone number"
          registration={register('phoneNumber')}
          type="tel"
        />
        <FormField
          error={errors.dob?.message}
          inputMode="numeric"
          label="Date of birth"
          placeholder="YYYY-MM-DD"
          registration={register('dob')}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || (!isDirty && mode === 'edit')}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  readonly autoComplete?: string | undefined;
  readonly error?: string | undefined;
  readonly inputMode?: 'numeric' | undefined;
  readonly label: string;
  readonly placeholder?: string | undefined;
  readonly registration: UseFormRegisterReturn<FieldPath<PatientFormValues>>;
  readonly type?: string | undefined;
}

function FormField({
  autoComplete,
  error,
  inputMode,
  label,
  placeholder,
  registration,
  type = 'text',
}: FormFieldProps) {
  const id = registration.name;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...registration}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
      />
      {error ? (
        <FieldError id={`${id}-error`}>
          {error}
        </FieldError>
      ) : placeholder ? (
        <FieldDescription>{placeholder}</FieldDescription>
      ) : null}
    </Field>
  );
}
