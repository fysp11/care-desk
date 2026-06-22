import { describe, expect, test } from 'bun:test';

import {
  ApiAuthError,
  apiRequest,
  buildPatientsUrl,
} from '../lib/api';

describe('frontend API helpers', () => {
  test('builds the patient list URL with search, sort, and pagination', () => {
    const url = buildPatientsUrl('http://localhost:3001', {
      limit: 5,
      page: 2,
      search: 'Ada Brooks',
      sortBy: 'dob',
      sortDir: 'desc',
    });

    expect(url.toString()).toBe(
      'http://localhost:3001/patients?page=2&limit=5&search=Ada+Brooks&sortBy=dob&sortDir=desc',
    );
  });

  test('maps 401 responses to auth failure and calls the session failure hook', async () => {
    let authFailureCount = 0;

    try {
      await apiRequest('/patients', {
        fetcher: async () =>
          new Response(
            JSON.stringify({
              code: 'TOKEN_EXPIRED',
              message: 'Token expired.',
            }),
            {
              headers: { 'content-type': 'application/json' },
              status: 401,
            },
          ),
        onAuthFailure: () => {
          authFailureCount += 1;
        },
        token: 'expired-token',
      });

      throw new Error('apiRequest should throw for 401 responses.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiAuthError);
      expect((error as ApiAuthError).message).toBe('Token expired.');
      expect(authFailureCount).toBe(1);
    }
  });
});
