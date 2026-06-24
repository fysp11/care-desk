import type {
  LoginResponse,
  Patient,
  PatientListQuery,
  PatientListResponse,
  PatientWriteInput,
  ValidationDetails,
} from './types';

export const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

interface ApiErrorOptions {
  readonly code?: string | undefined;
  readonly details?: ValidationDetails | undefined;
  readonly message: string;
  readonly status: number;
}

export class ApiError extends Error {
  readonly code?: string;
  readonly details?: ValidationDetails;
  readonly status: number;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;

    if (options.code) {
      this.code = options.code;
    }

    if (options.details) {
      this.details = options.details;
    }
  }
}

export class ApiAuthError extends ApiError {
  constructor(options: ApiErrorOptions) {
    super(options);
    this.name = 'ApiAuthError';
  }
}

interface ApiRequestOptions<TBody> {
  readonly baseUrl?: string;
  readonly body?: TBody;
  readonly fetcher?: Fetcher;
  readonly method?: 'DELETE' | 'GET' | 'POST' | 'PUT';
  readonly onAuthFailure?: () => void;
  readonly token?: string;
}

interface AuthenticatedRequestOptions {
  readonly onAuthFailure: () => void;
  readonly token: string;
}

interface ApiErrorPayload {
  readonly code?: string | undefined;
  readonly details?: ValidationDetails | undefined;
  readonly error?: string | undefined;
  readonly message?: string | readonly string[] | undefined;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidationDetails = (value: unknown): value is ValidationDetails =>
  isRecord(value) &&
  Object.values(value).every(
    (messages) =>
      Array.isArray(messages) &&
      messages.every((message) => typeof message === 'string'),
  );

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((message) => typeof message === 'string');

const parseErrorPayload = async (
  response: Response,
): Promise<ApiErrorPayload> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text) as unknown;

    if (!isRecord(parsed)) {
      return { message: text };
    }

    return {
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      details: isValidationDetails(parsed.details) ? parsed.details : undefined,
      error: typeof parsed.error === 'string' ? parsed.error : undefined,
      message:
        typeof parsed.message === 'string' || isStringArray(parsed.message)
          ? parsed.message
          : undefined,
    };
  } catch {
    return { message: text };
  }
};

const messageFromPayload = (
  payload: ApiErrorPayload,
  fallback: string,
): string => {
  if (typeof payload.message === 'string') {
    return payload.message;
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    return payload.message.join(' ');
  }

  return payload.error ?? fallback;
};

const toUrl = (path: string | URL, baseUrl: string): URL =>
  path instanceof URL ? path : new URL(path, baseUrl);

export const buildPatientsUrl = (
  baseUrl: string,
  query: PatientListQuery,
): URL => {
  const url = new URL('/patients', baseUrl);

  url.searchParams.set('page', String(query.page));
  url.searchParams.set('limit', String(query.limit));

  if (query.search.trim()) {
    url.searchParams.set('search', query.search.trim());
  }

  url.searchParams.set('sortBy', query.sortBy);
  url.searchParams.set('sortDir', query.sortDir);

  return url;
};

export const apiRequest = async <TResponse, TBody = unknown>(
  path: string | URL,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> => {
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const request: RequestInit = {
    headers,
    method,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(options.body);
  }

  const response = await fetcher(
    toUrl(path, options.baseUrl ?? DEFAULT_API_BASE_URL),
    request,
  );

  if (response.ok) {
    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  const payload = await parseErrorPayload(response);
  const message = messageFromPayload(
    payload,
    `Request failed with status ${response.status}.`,
  );
  const ErrorClass = response.status === 401 ? ApiAuthError : ApiError;

  if (response.status === 401) {
    options.onAuthFailure?.();
  }

  throw new ErrorClass({
    code: payload.code,
    details: payload.details,
    message,
    status: response.status,
  });
};

export const login = (body: {
  readonly email: string;
  readonly password: string;
}): Promise<LoginResponse> =>
  apiRequest<LoginResponse, typeof body>('/auth/login', {
    body,
    method: 'POST',
  });

export const listPatients = (
  query: PatientListQuery,
  options: AuthenticatedRequestOptions,
): Promise<PatientListResponse> =>
  apiRequest<PatientListResponse>(
    buildPatientsUrl(DEFAULT_API_BASE_URL, query),
    {
      onAuthFailure: options.onAuthFailure,
      token: options.token,
    },
  );

export const getPatient = (
  id: string,
  options: AuthenticatedRequestOptions,
): Promise<Patient> =>
  apiRequest<Patient>(`/patients/${encodeURIComponent(id)}`, {
    onAuthFailure: options.onAuthFailure,
    token: options.token,
  });

export const createPatient = (
  body: PatientWriteInput,
  options: AuthenticatedRequestOptions,
): Promise<Patient> =>
  apiRequest<Patient, PatientWriteInput>('/patients', {
    body,
    method: 'POST',
    onAuthFailure: options.onAuthFailure,
    token: options.token,
  });

export const updatePatient = (
  id: string,
  body: PatientWriteInput,
  options: AuthenticatedRequestOptions,
): Promise<Patient> =>
  apiRequest<Patient, PatientWriteInput>(
    `/patients/${encodeURIComponent(id)}`,
    {
      body,
      method: 'PUT',
      onAuthFailure: options.onAuthFailure,
      token: options.token,
    },
  );

export const deletePatient = (
  id: string,
  options: AuthenticatedRequestOptions,
): Promise<{ readonly ok: true }> =>
  apiRequest<{ readonly ok: true }>(`/patients/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    onAuthFailure: options.onAuthFailure,
    token: options.token,
  });
