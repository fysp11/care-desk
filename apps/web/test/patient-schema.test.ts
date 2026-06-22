import { describe, expect, test } from 'bun:test';

import {
  patientFormSchema,
  toPatientPayload,
} from '../lib/patient-schema';

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
});
