import { describe, expect, test } from 'bun:test';

import {
  ApiError,
  ApiAuthError,
  apiRequest,
  buildPatientsUrl,
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient,
} from '../lib/api';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });

const textResponse = (body: string, status = 500): Response =>
  new Response(body, { status });

const catchApiError = async (promise: Promise<unknown>): Promise<ApiError> => {
  let caught: unknown;

  try {
    await promise;
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(ApiError);

  return caught as ApiError;
};

const patientInput = {
  dob: '1984-02-13',
  email: 'ada.brooks@example.com',
  firstName: 'Ada',
  lastName: 'Brooks',
  phoneNumber: '+1 555-0101',
};

const captureGlobalFetch = async <TResult>(
  action: () => Promise<TResult>,
  responseBody: unknown = { ok: true },
): Promise<{
  readonly requestInit: RequestInit;
  readonly requestUrl: URL;
  readonly result: TResult;
}> => {
  const originalFetch = globalThis.fetch;
  let requestInit: RequestInit | undefined;
  let requestUrl: RequestInfo | URL | undefined;

  globalThis.fetch = (async (input, init) => {
    requestUrl = input;
    requestInit = init;

    return jsonResponse(responseBody);
  }) as typeof fetch;

  try {
    const result = await action();

    expect(requestUrl).toBeInstanceOf(URL);
    expect(requestInit).toBeDefined();

    return {
      requestInit: requestInit as RequestInit,
      requestUrl: requestUrl as URL,
      result,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
};

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

  test('trims patient list search and omits blank searches', () => {
    const trimmedUrl = buildPatientsUrl('http://localhost:3001', {
      limit: 10,
      page: 1,
      search: '  Ada Brooks  ',
      sortBy: 'lastName',
      sortDir: 'asc',
    });
    const blankUrl = buildPatientsUrl('http://localhost:3001', {
      limit: 10,
      page: 1,
      search: '   ',
      sortBy: 'lastName',
      sortDir: 'asc',
    });

    expect(trimmedUrl.searchParams.get('search')).toBe('Ada Brooks');
    expect(blankUrl.searchParams.has('search')).toBe(false);
  });

  test('maps 401 responses to auth failure and calls the session failure hook', async () => {
    let authFailureCount = 0;

    const error = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'TOKEN_EXPIRED',
              message: 'Token expired.',
            },
            401,
          ),
        onAuthFailure: () => {
          authFailureCount += 1;
        },
        token: 'expired-token',
      }),
    );

    expect(error).toBeInstanceOf(ApiAuthError);
    expect(error.message).toBe('Token expired.');
    expect(authFailureCount).toBe(1);
  });

  test('maps 401 responses without requiring an auth hook', async () => {
    const error = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'TOKEN_EXPIRED',
              message: 'Token expired.',
            },
            401,
          ),
      }),
    );

    expect(error).toBeInstanceOf(ApiAuthError);
    expect(error.message).toBe('Token expired.');
  });

  test('sends JSON requests with base URL, auth, and content headers', async () => {
    let requestUrl: RequestInfo | URL | undefined;
    let requestInit: RequestInit | undefined;

    const result = await apiRequest<
      { readonly ok: true },
      { readonly name: string }
    >('/patients', {
      baseUrl: 'https://api.example.test',
      body: { name: 'Ada Brooks' },
      fetcher: async (input, init) => {
        requestUrl = input;
        requestInit = init;

        return jsonResponse({ ok: true });
      },
      method: 'POST',
      token: 'demo-token',
    });

    expect(result).toEqual({ ok: true });
    expect(requestUrl).toBeInstanceOf(URL);
    expect((requestUrl as URL).toString()).toBe(
      'https://api.example.test/patients',
    );
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer demo-token',
      'Content-Type': 'application/json',
    });
    expect(requestInit?.body).toBe(JSON.stringify({ name: 'Ada Brooks' }));
  });

  test('uses GET defaults without auth or JSON body headers', async () => {
    let requestInit: RequestInit | undefined;

    await apiRequest('/patients', {
      fetcher: async (_input, init) => {
        requestInit = init;

        return jsonResponse({ items: [] });
      },
    });

    expect(requestInit?.method).toBe('GET');
    expect(requestInit?.headers).toEqual({
      Accept: 'application/json',
    });
    expect(requestInit?.body).toBeUndefined();
  });

  test('returns undefined for 204 responses', async () => {
    const result = await apiRequest('/patients/1', {
      fetcher: async () => new Response(null, { status: 204 }),
      method: 'DELETE',
    });

    expect(result).toBeUndefined();
  });

  test('preserves validation error metadata without calling the auth hook', async () => {
    let authFailureCount = 0;

    const error = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'VALIDATION_ERROR',
              details: {
                email: ['Email must be unique.'],
              },
              message: 'Request validation failed.',
            },
            422,
          ),
        onAuthFailure: () => {
          authFailureCount += 1;
        },
      }),
    );

    expect(error).not.toBeInstanceOf(ApiAuthError);
    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ email: ['Email must be unique.'] });
    expect(error.message).toBe('Request validation failed.');
    expect(authFailureCount).toBe(0);
  });

  test('rejects validation details unless every field is a string array', async () => {
    const mixedFieldError = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'VALIDATION_ERROR',
              details: {
                email: ['Email must be unique.'],
                name: 'Name is required.',
              },
              message: 'Request validation failed.',
            },
            422,
          ),
      }),
    );

    expect(mixedFieldError.details).toBeUndefined();

    const mixedMessageError = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'VALIDATION_ERROR',
              details: {
                email: ['Email must be unique.', 12],
              },
              message: 'Request validation failed.',
            },
            422,
          ),
      }),
    );

    expect(mixedMessageError.details).toBeUndefined();
  });

  test('joins string-array messages from backend validation payloads', async () => {
    const error = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              message: ['First validation error.', 'Second validation error.'],
            },
            400,
          ),
      }),
    );

    expect(error.message).toBe(
      'First validation error. Second validation error.',
    );
  });

  test('falls back to the error field when message is absent or untrusted', async () => {
    const missingMessage = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              error: 'Patient already exists.',
            },
            409,
          ),
      }),
    );

    expect(missingMessage.message).toBe('Patient already exists.');

    const untrustedMessage = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              error: 'Fallback error.',
              message: [404, 'not found'],
            },
            400,
          ),
      }),
    );

    expect(untrustedMessage.message).toBe('Fallback error.');
  });

  test('uses fallback messages for empty message arrays and non-string metadata', async () => {
    const emptyMessage = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              error: 'Fallback error.',
              message: [],
            },
            400,
          ),
      }),
    );

    expect(emptyMessage.message).toBe('Fallback error.');

    const nonStringMetadata = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 123,
              error: 500,
            },
            500,
          ),
      }),
    );

    expect(nonStringMetadata.code).toBeUndefined();
    expect(nonStringMetadata.message).toBe('Request failed with status 500.');
  });

  test('uses response text and status fallbacks for malformed error responses', async () => {
    const textError = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () => textResponse('gateway unavailable', 502),
      }),
    );

    expect(textError.message).toBe('gateway unavailable');

    const emptyError = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () => new Response('', { status: 500 }),
      }),
    );

    expect(emptyError.message).toBe('Request failed with status 500.');
  });

  test('uses raw JSON text for non-object JSON error payloads', async () => {
    const arrayError = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () => jsonResponse(['invalid'], 400),
      }),
    );

    expect(arrayError.message).toBe('["invalid"]');
  });

  test('listPatients sends authenticated GET requests with encoded query params', async () => {
    let authFailureCount = 0;
    const { requestInit, requestUrl, result } = await captureGlobalFetch(
      () =>
        listPatients(
          {
            limit: 25,
            page: 3,
            search: '  Ada Brooks  ',
            sortBy: 'email',
            sortDir: 'desc',
          },
          {
            onAuthFailure: () => {
              authFailureCount += 1;
            },
            token: 'demo-token',
          },
        ),
      {
        data: [],
        limit: 25,
        page: 3,
        total: 0,
      },
    );

    expect(result).toEqual({
      data: [],
      limit: 25,
      page: 3,
      total: 0,
    });
    expect(requestUrl.toString()).toBe(
      'http://localhost:3001/patients?page=3&limit=25&search=Ada+Brooks&sortBy=email&sortDir=desc',
    );
    expect(requestInit.method).toBe('GET');
    expect(requestInit.headers).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer demo-token',
    });
    expect(authFailureCount).toBe(0);
  });

  test('patient wrappers encode IDs and use the expected HTTP methods', async () => {
    const id = 'abc/def with space';
    const authOptions = {
      onAuthFailure() {},
      token: 'demo-token',
    };
    const detailsRequest = await captureGlobalFetch(() =>
      getPatient(id, authOptions),
    );
    const updateRequest = await captureGlobalFetch(() =>
      updatePatient(id, patientInput, authOptions),
    );
    const deleteRequest = await captureGlobalFetch(() =>
      deletePatient(id, authOptions),
    );

    expect(detailsRequest.requestUrl.toString()).toBe(
      'http://localhost:3001/patients/abc%2Fdef%20with%20space',
    );
    expect(detailsRequest.requestInit.method).toBe('GET');

    expect(updateRequest.requestUrl.toString()).toBe(
      'http://localhost:3001/patients/abc%2Fdef%20with%20space',
    );
    expect(updateRequest.requestInit.method).toBe('PUT');
    expect(updateRequest.requestInit.body).toBe(JSON.stringify(patientInput));
    expect(updateRequest.requestInit.headers).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer demo-token',
      'Content-Type': 'application/json',
    });

    expect(deleteRequest.requestUrl.toString()).toBe(
      'http://localhost:3001/patients/abc%2Fdef%20with%20space',
    );
    expect(deleteRequest.requestInit.method).toBe('DELETE');
  });

  test('createPatient sends authenticated JSON POST requests', async () => {
    const { requestInit, requestUrl } = await captureGlobalFetch(() =>
      createPatient(patientInput, {
        onAuthFailure() {},
        token: 'demo-token',
      }),
    );

    expect(requestUrl.toString()).toBe('http://localhost:3001/patients');
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify(patientInput));
    expect(requestInit.headers).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer demo-token',
      'Content-Type': 'application/json',
    });
  });

  test('patient wrappers forward auth failures from 401 responses', async () => {
    const originalFetch = globalThis.fetch;
    let authFailureCount = 0;

    globalThis.fetch = (async () =>
      jsonResponse(
        {
          code: 'TOKEN_EXPIRED',
          message: 'Token expired.',
        },
        401,
      )) as typeof fetch;

    try {
      const error = await catchApiError(
        listPatients(
          {
            limit: 10,
            page: 1,
            search: '',
            sortBy: 'lastName',
            sortDir: 'asc',
          },
          {
            onAuthFailure: () => {
              authFailureCount += 1;
            },
            token: 'expired-token',
          },
        ),
      );

      expect(error).toBeInstanceOf(ApiAuthError);
      expect(error.message).toBe('Token expired.');
      expect(authFailureCount).toBe(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('ignores malformed validation details', async () => {
    const error = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'VALIDATION_ERROR',
              details: {
                email: 'Email must be unique.',
              },
              message: 'Request validation failed.',
            },
            422,
          ),
      }),
    );

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toBeUndefined();
    expect(error.message).toBe('Request validation failed.');

    const nullDetails = await catchApiError(
      apiRequest('/patients', {
        fetcher: async () =>
          jsonResponse(
            {
              code: 'VALIDATION_ERROR',
              details: null,
              message: 'Request validation failed.',
            },
            422,
          ),
      }),
    );

    expect(nullDetails.code).toBe('VALIDATION_ERROR');
    expect(nullDetails.details).toBeUndefined();
    expect(nullDetails.message).toBe('Request validation failed.');
  });
});
