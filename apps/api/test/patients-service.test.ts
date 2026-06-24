import { describe, expect, test } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PatientsService } from '../src/patients/patients.service.js';
import {
  PATIENTS_REPOSITORY,
  type PatientsRepository,
} from '../src/patients/patients.repository.contract.js';
import type {
  Patient,
  PatientListOptions,
  PatientListResponse,
  PatientWriteInput,
} from '../src/patients/types.js';

const demoPatient: Patient = {
  createdAt: '2026-01-01T00:00:00.000Z',
  dob: '1990-03-14',
  email: 'nora.frost@example.com',
  firstName: 'Nora',
  id: 'patient-1',
  lastName: 'Frost',
  phoneNumber: '+1 555-0199',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const patientDto = (): PatientWriteInput => ({
  dob: ' 1990-03-14 ',
  email: ' Nora.Frost@Example.com ',
  firstName: ' Nora ',
  lastName: ' Frost ',
  phoneNumber: ' +1 555-0199 ',
});

interface RepositoryState {
  readonly createdInputs: PatientWriteInput[];
  readonly deletedIds: string[];
  readonly emailLookups: string[];
  readonly listOptions: PatientListOptions[];
  readonly updatedInputs: Array<{
    readonly id: string;
    readonly input: PatientWriteInput;
  }>;
}

const createRepository = (
  overrides: Partial<PatientsRepository> = {},
): PatientsRepository & { readonly state: RepositoryState } => {
  const state: RepositoryState = {
    createdInputs: [],
    deletedIds: [],
    emailLookups: [],
    listOptions: [],
    updatedInputs: [],
  };
  const repository: PatientsRepository & { readonly state: RepositoryState } = {
    state,
    async create(input) {
      state.createdInputs.push(input);

      return { ...demoPatient, ...input };
    },
    async delete(id) {
      state.deletedIds.push(id);

      return true;
    },
    async findByEmail(email) {
      state.emailLookups.push(email);

      return undefined;
    },
    async findById(id) {
      return id === demoPatient.id ? demoPatient : undefined;
    },
    async list(options) {
      state.listOptions.push(options);

      return {
        data: [],
        limit: options.limit,
        page: options.page,
        total: 0,
      } satisfies PatientListResponse;
    },
    async update(id, input) {
      state.updatedInputs.push({ id, input });

      return { ...demoPatient, ...input, id };
    },
    ...overrides,
  };

  return repository;
};

describe('patients service', () => {
  test('resolves through the repository injection token', async () => {
    const repository = createRepository();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PATIENTS_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();
    const service = moduleRef.get(PatientsService);

    await service.list({});

    expect(repository.state.listOptions).toEqual([
      {
        limit: 10,
        page: 1,
        sortBy: 'lastName',
        sortDir: 'asc',
      },
    ]);
  });

  test('normalizes patient list query options before repository access', async () => {
    const repository = createRepository();
    const service = new PatientsService(repository);

    await service.list({
      limit: '999',
      page: '2',
      search: '  Nora Frost  ',
      sortBy: 'email',
      sortDir: 'desc',
    });
    await service.list({});

    expect(repository.state.listOptions).toEqual([
      {
        limit: 50,
        page: 2,
        search: 'nora frost',
        sortBy: 'email',
        sortDir: 'desc',
      },
      {
        limit: 10,
        page: 1,
        sortBy: 'lastName',
        sortDir: 'asc',
      },
    ]);
  });

  test('returns existing patients by id', async () => {
    const repository = createRepository();
    const service = new PatientsService(repository);

    await expect(service.getById(demoPatient.id)).resolves.toEqual(demoPatient);
  });

  test('normalizes create payloads and checks canonical email conflicts', async () => {
    const repository = createRepository();
    const service = new PatientsService(repository);

    await service.create(patientDto());

    expect(repository.state.emailLookups).toEqual(['nora.frost@example.com']);
    expect(repository.state.createdInputs).toEqual([
      {
        dob: '1990-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '+1 555-0199',
      },
    ]);
  });

  test('rejects create and update payloads when another patient owns the email', async () => {
    const repository = createRepository({
      async findByEmail() {
        return { ...demoPatient, id: 'other-patient' };
      },
    });
    const service = new PatientsService(repository);

    for (const action of [
      () => service.create(patientDto()),
      () => service.update(demoPatient.id, patientDto()),
    ]) {
      try {
        await action();
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect((error as ConflictException).getResponse()).toEqual({
          code: 'PATIENT_EMAIL_CONFLICT',
          message: 'Patient email already exists.',
        });
        continue;
      }

      throw new Error('Expected email conflict.');
    }
  });

  test('allows updates when the canonical email belongs to the same patient', async () => {
    const repository = createRepository({
      async findByEmail() {
        return demoPatient;
      },
    });
    const service = new PatientsService(repository);

    await expect(service.update(demoPatient.id, patientDto())).resolves.toEqual(
      {
        ...demoPatient,
        dob: '1990-03-14',
        email: 'nora.frost@example.com',
        firstName: 'Nora',
        lastName: 'Frost',
        phoneNumber: '+1 555-0199',
      },
    );
  });

  test('normalizes update payloads and returns the existing patient if the repository reports no update', async () => {
    const repository = createRepository();
    repository.update = async (id, input) => {
      repository.state.updatedInputs.push({ id, input });

      return undefined;
    };
    const service = new PatientsService(repository);

    await expect(service.update(demoPatient.id, patientDto())).resolves.toEqual(
      demoPatient,
    );
    expect(repository.state.updatedInputs).toEqual([
      {
        id: demoPatient.id,
        input: {
          dob: '1990-03-14',
          email: 'nora.frost@example.com',
          firstName: 'Nora',
          lastName: 'Frost',
          phoneNumber: '+1 555-0199',
        },
      },
    ]);
  });

  test('throws not-found errors for missing patients', async () => {
    const repository = createRepository({
      async delete() {
        return false;
      },
      async findById() {
        return undefined;
      },
    });
    const service = new PatientsService(repository);

    for (const action of [
      () => service.getById('missing'),
      () => service.update('missing', patientDto()),
      () => service.delete('missing'),
    ]) {
      try {
        await action();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toEqual({
          code: 'PATIENT_NOT_FOUND',
          message: 'Patient was not found.',
        });
        continue;
      }

      throw new Error('Expected patient not found.');
    }
  });

  test('returns an ok response when delete succeeds', async () => {
    const repository = createRepository();
    const service = new PatientsService(repository);

    await expect(service.delete(demoPatient.id)).resolves.toEqual({ ok: true });
    expect(repository.state.deletedIds).toEqual([demoPatient.id]);
  });
});
