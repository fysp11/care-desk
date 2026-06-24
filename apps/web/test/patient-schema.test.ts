import { describe, expect, test } from 'vitest';

import {
  emptyPatientFormValues,
  firstPatientFormErrorMessages,
  patientFormSchema,
  patientToFormValues,
  toPatientPayload,
} from '../lib/patient-schema';
import type { Patient } from '../lib/types';

const validPatientFormInput = {
  dob: '1988-03-14',
  email: 'nora.frost@example.com',
  firstName: 'Nora',
  lastName: 'Frost',
  phoneNumber: '+1 555 0140',
};

const validationMessagesFor = (
  input: Record<string, unknown>,
): Array<{ field: string; message: string }> => {
  const result = patientFormSchema.safeParse(input);

  if (result.success) {
    throw new Error('Expected patient form input to fail validation.');
  }

  return result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

const localDateOnly = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

describe('patient form schema', () => {
  test('normalizes valid patient input for the API payload', () => {
    const parsed = patientFormSchema.parse({
      dob: '1988-03-14',
      email: '  Nora.Frost@Example.com ',
      firstName: ' Nora ',
      lastName: ' Frost ',
      phoneNumber: ' +1 (555) 0140 ',
    });

    expect(toPatientPayload(parsed)).toEqual({
      dob: '1988-03-14',
      email: 'nora.frost@example.com',
      firstName: 'Nora',
      lastName: 'Frost',
      phoneNumber: '+1 (555) 0140',
    });
  });

  test('reports field-specific validation issues', () => {
    const result = patientFormSchema.safeParse({
      dob: '2999-01-01',
      email: 'not-an-email',
      firstName: '   ',
      lastName: '',
      phoneNumber: 'abc',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const fields = result.error.issues
        .map((issue) => issue.path.join('.'))
        .toSorted();

      expect(fields).toEqual([
        'dob',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
      ]);
    }
  });

  test('enforces anchored date and phone formats while allowing local phone numbers', () => {
    expect(
      patientFormSchema.safeParse({
        dob: 'x1988-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '555 0140',
      }).success,
    ).toBe(false);

    expect(
      patientFormSchema.safeParse({
        dob: '1988-03-14x',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '555 0140',
      }).success,
    ).toBe(false);

    expect(
      patientFormSchema.safeParse({
        dob: '1988-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: 'abc +1 555 0140',
      }).success,
    ).toBe(false);

    expect(
      patientFormSchema.safeParse({
        dob: '1988-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '+1 555 0140 ext',
      }).success,
    ).toBe(false);

    expect(
      patientFormSchema.safeParse({
        dob: '1988-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '555 0140',
      }).success,
    ).toBe(true);
  });

  test('rejects invalid calendar dates and accepts today as a non-future date', () => {
    const today = localDateOnly(new Date());

    expect(
      patientFormSchema.safeParse({
        dob: '2025-02-31',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '+1 555 0140',
      }).success,
    ).toBe(false);

    expect(
      patientFormSchema.safeParse({
        dob: today,
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '+1 555 0140',
      }).success,
    ).toBe(true);
  });

  test('checks future dates against the local calendar day', () => {
    const RealDate = globalThis.Date;
    class LocalDateBeforeUtcDate extends RealDate {
      private readonly useLocalOverride: boolean;

      constructor(value?: string | number | Date) {
        if (arguments.length === 0) {
          super('1000-01-02T02:30:00.000Z');
          this.useLocalOverride = true;

          return;
        }

        super(value as string);
        this.useLocalOverride = false;
      }

      override getFullYear(): number {
        return this.useLocalOverride ? 999 : super.getFullYear();
      }

      override getMonth(): number {
        return this.useLocalOverride ? 0 : super.getMonth();
      }

      override getDate(): number {
        return this.useLocalOverride ? 1 : super.getDate();
      }
    }

    globalThis.Date = LocalDateBeforeUtcDate as unknown as DateConstructor;

    try {
      expect(
        patientFormSchema.safeParse({
          ...validPatientFormInput,
          dob: '0999-01-01',
        }).success,
      ).toBe(true);
      expect(
        validationMessagesFor({
          ...validPatientFormInput,
          dob: '0999-01-02',
        }),
      ).toContainEqual({
        field: 'dob',
        message: 'Date of birth cannot be in the future.',
      });
    } finally {
      globalThis.Date = RealDate;
    }
  });

  test('returns precise validation messages for user-facing form errors', () => {
    const result = patientFormSchema.safeParse({
      dob: '2999-01-01',
      email: 'not-an-email',
      firstName: '',
      lastName: '',
      phoneNumber: 'abc',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messagesByField = Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join('.'),
          issue.message,
        ]),
      );

      expect(messagesByField.dob).toBe(
        'Date of birth cannot be in the future.',
      );
      expect(messagesByField.email).toBe('Enter a valid email address.');
      expect(messagesByField.firstName).toBe('First name is required.');
      expect(messagesByField.lastName).toBe('Last name is required.');
      expect(messagesByField.phoneNumber).toBe(
        'Use digits, spaces, parentheses, hyphens, and an optional leading plus.',
      );
    }
  });

  test('keeps date format validation messages specific for malformed dates', () => {
    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        dob: 'x1988-03-14',
      }),
    ).toContainEqual({
      field: 'dob',
      message: 'Use YYYY-MM-DD format.',
    });

    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        dob: '1988-03-14x',
      }),
    ).toContainEqual({
      field: 'dob',
      message: 'Use YYYY-MM-DD format.',
    });
  });

  test('reports a specific message for invalid calendar dates', () => {
    expect(
      patientFormSchema.safeParse({
        ...validPatientFormInput,
        dob: '2024-02-29',
      }).success,
    ).toBe(true);

    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        dob: '2025-02-31',
      }),
    ).toContainEqual({
      field: 'dob',
      message: 'Enter a valid date of birth.',
    });

    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        dob: '2025-02-29',
      }),
    ).toContainEqual({
      field: 'dob',
      message: 'Enter a valid date of birth.',
    });

    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        dob: '1900-02-29',
      }),
    ).toContainEqual({
      field: 'dob',
      message: 'Enter a valid date of birth.',
    });
  });

  test('keeps the first validation issue per field for inline form errors', () => {
    const schemaShapeWithTemporaryField =
      patientFormSchema.shape as typeof patientFormSchema.shape & {
        undefined?: unknown;
      };
    schemaShapeWithTemporaryField.undefined = patientFormSchema.shape.firstName;

    try {
      const messages = firstPatientFormErrorMessages([
        {
          path: ['dob'],
          message: 'Use YYYY-MM-DD format.',
        },
        {
          path: ['dob'],
          message: 'Enter a valid date of birth.',
        },
        {
          path: ['unknown'],
          message: 'Ignored unknown field.',
        },
        {
          path: [0],
          message: 'Ignored non-string field.',
        },
        {
          path: [Symbol('dob')],
          message: 'Ignored symbol field.',
        },
        {
          path: [],
          message: 'Ignored empty path.',
        },
        {
          path: ['email'],
          message: 'Enter a valid email address.',
        },
        {
          path: ['email'],
          message: 'Email is too long.',
        },
      ]);

      expect(messages).toEqual({
        dob: 'Use YYYY-MM-DD format.',
        email: 'Enter a valid email address.',
      });
      expect(messages).not.toHaveProperty('undefined');
    } finally {
      delete schemaShapeWithTemporaryField.undefined;
    }
  });

  test('reports user-facing max length messages for oversized fields', () => {
    const longEmail = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(62)}`;

    expect(
      validationMessagesFor({
        ...validPatientFormInput,
        firstName: 'N'.repeat(81),
        lastName: 'F'.repeat(81),
        email: longEmail,
        phoneNumber: '1'.repeat(33),
      }),
    ).toEqual(
      expect.arrayContaining([
        {
          field: 'firstName',
          message: 'First name must be 80 characters or fewer.',
        },
        {
          field: 'lastName',
          message: 'Last name must be 80 characters or fewer.',
        },
        {
          field: 'email',
          message: 'Email is too long.',
        },
        {
          field: 'phoneNumber',
          message: 'Phone number is too long.',
        },
      ]),
    );
  });

  test('keeps non-string values as validation failures instead of preprocessing crashes', () => {
    expect(() =>
      patientFormSchema.safeParse({
        dob: 123,
        email: 123,
        firstName: 123,
        lastName: 123,
        phoneNumber: 123,
      }),
    ).not.toThrow();

    expect(
      patientFormSchema.safeParse({
        dob: 123,
        email: 123,
        firstName: 123,
        lastName: 123,
        phoneNumber: 123,
      }).success,
    ).toBe(false);
  });

  test('provides empty defaults and maps patient records into form values', () => {
    expect(emptyPatientFormValues).toEqual({
      dob: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    });

    const patient: Patient = {
      createdAt: '2026-01-01T00:00:00.000Z',
      dob: '1988-03-14',
      email: 'nora.frost@example.com',
      firstName: 'Nora',
      id: 'patient-1',
      lastName: 'Frost',
      phoneNumber: '+1 555 0140',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(patientToFormValues(patient)).toEqual({
      dob: '1988-03-14',
      email: 'nora.frost@example.com',
      firstName: 'Nora',
      lastName: 'Frost',
      phoneNumber: '+1 555 0140',
    });
  });
});
