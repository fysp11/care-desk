import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import inject from 'light-my-request';

import { AppModule } from '../src/app.module.js';
import type { LoginResponse } from '../src/auth/types/auth.types.js';
import { createValidationPipe } from '../src/common/validation.js';
import { PrismaPatientsRepository } from '../src/patients/patients.repository.js';
import type {
  Patient,
  PatientListResponse,
  PatientWriteInput,
} from '../src/patients/types.js';

interface ApiErrorBody {
  readonly code?: string;
  readonly message?: string;
  readonly details?: Record<string, readonly string[]>;
}

type TestResponse = {
  readonly statusCode: number;
  json: <T = unknown>() => T;
};

const injectRequest = inject as unknown as (
  dispatch: unknown,
  options: unknown,
) => Promise<TestResponse>;

let app: INestApplication | undefined;
let dispatch: unknown;
let patientsRepository: PrismaPatientsRepository;

const request = (options: {
  readonly body?: unknown;
  readonly method: string;
  readonly token?: string;
  readonly url: string;
}): Promise<TestResponse> => {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  if (options.body) {
    headers['content-type'] = 'application/json';
  }

  return injectRequest(dispatch, {
    headers,
    method: options.method,
    payload: options.body as Record<string, unknown> | undefined,
    url: options.url,
  });
};

const loginAs = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await request({
    body: { email, password },
    method: 'POST',
    url: '/auth/login',
  });

  expect(response.statusCode).toBe(200);

  return response.json<LoginResponse>();
};

const demoPatientInput = (
  email = 'nora.frost@example.com',
): PatientWriteInput => ({
  dob: '1990-03-14',
  email,
  firstName: 'Nora',
  lastName: 'Frost',
  phoneNumber: '+1 555-0199',
});

const expectValidationDetails = (
  body: ApiErrorBody,
  fields: readonly string[],
): void => {
  expect(body.code).toBe('VALIDATION_ERROR');
  expect(body.message).toBe('Request validation failed.');
  expect(body.details).toBeDefined();

  for (const field of fields) {
    const messages = body.details?.[field];

    expect(Array.isArray(messages)).toBe(true);
    expect(messages?.length).toBeGreaterThan(0);
    expect(messages?.every((message) => typeof message === 'string')).toBe(
      true,
    );
  }
};

describe('patients API', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    dispatch = app.getHttpAdapter().getInstance();
    patientsRepository = app.get(PrismaPatientsRepository);
  });

  beforeEach(async () => {
    await patientsRepository.reset();
  });

  afterAll(async () => {
    await app?.close();
  });

  test('admin can create, read, update, and delete a patient', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const createResponse = await request({
      body: demoPatientInput('Nora.Frost@Example.com'),
      method: 'POST',
      token: admin.token,
      url: '/patients',
    });

    expect(createResponse.statusCode).toBe(201);

    const createdPatient = createResponse.json<Patient>();
    expect(createdPatient.email).toBe('nora.frost@example.com');
    expect(createdPatient.firstName).toBe('Nora');

    const getResponse = await request({
      method: 'GET',
      token: admin.token,
      url: `/patients/${createdPatient.id}`,
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json<Patient>().id).toBe(createdPatient.id);

    const updateResponse = await request({
      body: {
        ...demoPatientInput('nora.frost@example.com'),
        lastName: 'Gray',
      },
      method: 'PUT',
      token: admin.token,
      url: `/patients/${createdPatient.id}`,
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json<Patient>().lastName).toBe('Gray');

    const deleteResponse = await request({
      method: 'DELETE',
      token: admin.token,
      url: `/patients/${createdPatient.id}`,
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json<{ readonly ok: boolean }>().ok).toBe(true);

    const afterDeleteResponse = await request({
      method: 'GET',
      token: admin.token,
      url: `/patients/${createdPatient.id}`,
    });

    expect(afterDeleteResponse.statusCode).toBe(404);
    expect(afterDeleteResponse.json<ApiErrorBody>().code).toBe(
      'PATIENT_NOT_FOUND',
    );
  });

  test('admin and user can list patients with search, sort, pagination, and safe limit clamping', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const adminListResponse = await request({
      method: 'GET',
      token: admin.token,
      url: '/patients?sortBy=lastName&sortDir=asc&page=2&limit=2',
    });

    expect(adminListResponse.statusCode).toBe(200);

    const adminList = adminListResponse.json<PatientListResponse>();
    expect(adminList.total).toBe(4);
    expect(adminList.page).toBe(2);
    expect(adminList.limit).toBe(2);
    expect(adminList.data.map((patient) => patient.lastName)).toEqual([
      'Diaz',
      'Evans',
    ]);

    const descendingResponse = await request({
      method: 'GET',
      token: admin.token,
      url: '/patients?sortBy=lastName&sortDir=desc&page=1&limit=2',
    });

    expect(descendingResponse.statusCode).toBe(200);
    expect(
      descendingResponse
        .json<PatientListResponse>()
        .data.map((patient) => patient.lastName),
    ).toEqual(['Evans', 'Diaz']);

    const createResponse = await request({
      body: demoPatientInput('latest.patient@example.com'),
      method: 'POST',
      token: admin.token,
      url: '/patients',
    });
    const createdPatient = createResponse.json<Patient>();
    const newestResponse = await request({
      method: 'GET',
      token: admin.token,
      url: '/patients?sortBy=createdAt&sortDir=desc&limit=1',
    });

    expect(createResponse.statusCode).toBe(201);
    expect(newestResponse.statusCode).toBe(200);
    expect(newestResponse.json<PatientListResponse>().data[0]?.id).toBe(
      createdPatient.id,
    );

    const user = await loginAs('user@example.com', 'user-password');
    const searchResponse = await request({
      method: 'GET',
      token: user.token,
      url: '/patients?search=555-0103&sortBy=dob&sortDir=desc&limit=999',
    });

    expect(searchResponse.statusCode).toBe(200);

    const searchList = searchResponse.json<PatientListResponse>();
    expect(searchList.total).toBe(1);
    expect(searchList.limit).toBe(50);
    expect(searchList.data[0]?.email).toBe('mira.diaz@example.com');
  });

  test('unsafe patient list page value returns 400 validation error', async () => {
    const user = await loginAs('user@example.com', 'user-password');
    const hugePage = '9'.repeat(400);
    const response = await request({
      method: 'GET',
      token: user.token,
      url: `/patients?page=${hugePage}`,
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expectValidationDetails(body, ['page']);
  });

  test('unsafe patient list limit value returns 400 validation error', async () => {
    const user = await loginAs('user@example.com', 'user-password');
    const hugeLimit = '9'.repeat(400);
    const response = await request({
      method: 'GET',
      token: user.token,
      url: `/patients?limit=${hugeLimit}`,
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expectValidationDetails(body, ['limit']);
  });

  test('user can view patients but receives 403 on mutations', async () => {
    const user = await loginAs('user@example.com', 'user-password');
    const detailResponse = await request({
      method: 'GET',
      token: user.token,
      url: '/patients/demo-patient-001',
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json<Patient>().email).toBe('ada.brooks@example.com');

    const createResponse = await request({
      body: demoPatientInput(),
      method: 'POST',
      token: user.token,
      url: '/patients',
    });
    const updateResponse = await request({
      body: demoPatientInput('changed.patient@example.com'),
      method: 'PUT',
      token: user.token,
      url: '/patients/demo-patient-001',
    });
    const deleteResponse = await request({
      method: 'DELETE',
      token: user.token,
      url: '/patients/demo-patient-001',
    });

    expect(createResponse.statusCode).toBe(403);
    expect(updateResponse.statusCode).toBe(403);
    expect(deleteResponse.statusCode).toBe(403);
    expect(createResponse.json<ApiErrorBody>().code).toBe('FORBIDDEN');
  });

  test('missing token returns 401 on patient routes', async () => {
    const response = await request({
      method: 'GET',
      url: '/patients',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json<ApiErrorBody>().code).toBe('UNAUTHORIZED');
  });

  test('invalid patient body returns 400 with validation details', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const response = await request({
      body: {
        dob: 'not-a-date',
        email: 'not-an-email',
        firstName: '',
        lastName: 'Patient',
        phoneNumber: 'abc',
      },
      method: 'POST',
      token: admin.token,
      url: '/patients',
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expectValidationDetails(body, ['email', 'dob', 'phoneNumber']);
  });

  test('unknown patient body fields return validation details', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const response = await request({
      body: {
        ...demoPatientInput('unknown.field@example.com'),
        medicalRecordNumber: 'MRN-001',
      },
      method: 'POST',
      token: admin.token,
      url: '/patients',
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expectValidationDetails(body, ['medicalRecordNumber']);
  });

  test('invalid patient list query returns 400', async () => {
    const user = await loginAs('user@example.com', 'user-password');
    const response = await request({
      method: 'GET',
      token: user.token,
      url: '/patients?page=0&limit=-1&sortBy=unknown&sortDir=sideways',
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expectValidationDetails(body, ['page', 'limit', 'sortBy', 'sortDir']);
  });

  test('missing patient returns 404', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const response = await request({
      method: 'GET',
      token: admin.token,
      url: '/patients/missing-patient',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json<ApiErrorBody>().code).toBe('PATIENT_NOT_FOUND');
  });

  test('updating or deleting a missing patient id returns 404', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const updateResponse = await request({
      body: demoPatientInput('missing.patient@example.com'),
      method: 'PUT',
      token: admin.token,
      url: '/patients/missing-patient',
    });
    const deleteResponse = await request({
      method: 'DELETE',
      token: admin.token,
      url: '/patients/missing-patient',
    });

    expect(updateResponse.statusCode).toBe(404);
    expect(deleteResponse.statusCode).toBe(404);
    expect(updateResponse.json<ApiErrorBody>().code).toBe('PATIENT_NOT_FOUND');
    expect(deleteResponse.json<ApiErrorBody>().code).toBe('PATIENT_NOT_FOUND');
  });

  test('duplicate patient email returns 409', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const response = await request({
      body: demoPatientInput('ada.brooks@example.com'),
      method: 'POST',
      token: admin.token,
      url: '/patients',
    });

    expect(response.statusCode).toBe(409);
    expect(response.json<ApiErrorBody>().code).toBe('PATIENT_EMAIL_CONFLICT');
  });

  test('updating a patient to another existing email returns 409', async () => {
    const admin = await loginAs('admin@example.com', 'admin-password');
    const response = await request({
      body: demoPatientInput('theo.carter@example.com'),
      method: 'PUT',
      token: admin.token,
      url: '/patients/demo-patient-001',
    });

    expect(response.statusCode).toBe(409);
    expect(response.json<ApiErrorBody>().code).toBe('PATIENT_EMAIL_CONFLICT');
  });
});
