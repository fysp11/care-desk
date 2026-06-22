import { describe, expect, test } from 'bun:test';
import { ConflictException } from '@nestjs/common';

import { PrismaPatientsRepository } from '../src/patients/patients.repository.js';
import type { PrismaService } from '../src/prisma.service.js';
import type { PatientWriteInput } from '../src/patients/types.js';

const prismaPatient = {
  createdAt: new Date('2026-01-02T03:04:05.000Z'),
  dob: '1984-02-13',
  email: 'ada.brooks@example.com',
  firstName: 'Ada',
  id: 'patient-1',
  lastName: 'Brooks',
  phoneNumber: '+1 555-0101',
  updatedAt: new Date('2026-01-03T03:04:05.000Z'),
};

interface PatientFindManyArgs {
  readonly orderBy: readonly Record<string, string>[];
  readonly skip: number;
  readonly take: number;
  readonly where?: unknown;
}

const patientInput = (): PatientWriteInput => ({
  dob: '1984-02-13',
  email: 'ada.brooks@example.com',
  firstName: 'Ada',
  lastName: 'Brooks',
  phoneNumber: '+1 555-0101',
});

const createPrisma = () => {
  const createCalls: Array<{ data: PatientWriteInput }> = [];
  const findManyCalls: PatientFindManyArgs[] = [];
  const findUniqueCalls: unknown[] = [];
  const countCalls: unknown[] = [];
  const updateCalls: Array<{ data: PatientWriteInput; where: { id: string } }> =
    [];
  const prisma = {
    patient: {
      async count(args?: unknown) {
        countCalls.push(args);

        return 7;
      },
      async create(args: { data: PatientWriteInput }) {
        createCalls.push(args);

        return { ...prismaPatient, ...args.data };
      },
      async findMany(args: PatientFindManyArgs) {
        findManyCalls.push(args);

        return [prismaPatient];
      },
      async findUnique(args: unknown) {
        findUniqueCalls.push(args);

        return prismaPatient;
      },
      async update(args: { data: PatientWriteInput; where: { id: string } }) {
        updateCalls.push(args);

        return { ...prismaPatient, ...args.data, id: args.where.id };
      },
    },
  };

  return {
    countCalls,
    createCalls,
    findManyCalls,
    findUniqueCalls,
    prisma: prisma as unknown as PrismaService,
    updateCalls,
  };
};

describe('PrismaPatientsRepository', () => {
  test('lists patients with deterministic ordering, pagination, and search filters', async () => {
    const { countCalls, findManyCalls, prisma } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);

    await expect(
      repository.list({
        limit: 25,
        page: 3,
        search: '  Ada  ',
        sortBy: 'email',
        sortDir: 'desc',
      }),
    ).resolves.toEqual({
      data: [
        {
          createdAt: '2026-01-02T03:04:05.000Z',
          dob: '1984-02-13',
          email: 'ada.brooks@example.com',
          firstName: 'Ada',
          id: 'patient-1',
          lastName: 'Brooks',
          phoneNumber: '+1 555-0101',
          updatedAt: '2026-01-03T03:04:05.000Z',
        },
      ],
      limit: 25,
      page: 3,
      total: 7,
    });

    const expectedWhere = {
      OR: [
        { firstName: { contains: 'Ada', mode: 'insensitive' } },
        { lastName: { contains: 'Ada', mode: 'insensitive' } },
        { email: { contains: 'Ada', mode: 'insensitive' } },
        { phoneNumber: { contains: 'Ada', mode: 'insensitive' } },
      ],
    };

    expect(findManyCalls).toEqual([
      {
        orderBy: [{ email: 'desc' }, { id: 'asc' }],
        skip: 50,
        take: 25,
        where: expectedWhere,
      },
    ]);
    expect(countCalls).toEqual([{ where: expectedWhere }]);
  });

  test('omits the where clause for blank searches while keeping stable ordering', async () => {
    const { countCalls, findManyCalls, prisma } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);

    await repository.list({
      limit: 10,
      page: 1,
      search: '   ',
      sortBy: 'lastName',
      sortDir: 'asc',
    });

    expect(findManyCalls).toEqual([
      {
        orderBy: [{ lastName: 'asc' }, { id: 'asc' }],
        skip: 0,
        take: 10,
      },
    ]);
    expect(countCalls).toEqual([undefined]);
  });

  test('treats omitted search as unfiltered while preserving pagination math', async () => {
    const { countCalls, findManyCalls, prisma } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);

    await repository.list({
      limit: 25,
      page: 3,
      sortBy: 'dob',
      sortDir: 'desc',
    });

    expect(findManyCalls).toEqual([
      {
        orderBy: [{ dob: 'desc' }, { id: 'asc' }],
        skip: 50,
        take: 25,
      },
    ]);
    expect(countCalls).toEqual([undefined]);
  });

  test('maps single-patient reads and writes through Prisma without reshaping write input', async () => {
    const { createCalls, findUniqueCalls, prisma, updateCalls } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);
    const input = patientInput();

    await expect(repository.findById('patient-1')).resolves.toEqual({
      createdAt: '2026-01-02T03:04:05.000Z',
      dob: '1984-02-13',
      email: 'ada.brooks@example.com',
      firstName: 'Ada',
      id: 'patient-1',
      lastName: 'Brooks',
      phoneNumber: '+1 555-0101',
      updatedAt: '2026-01-03T03:04:05.000Z',
    });
    await expect(repository.findByEmail('Ada.Brooks@Example.com')).resolves.toEqual(
      {
        createdAt: '2026-01-02T03:04:05.000Z',
        dob: '1984-02-13',
        email: 'ada.brooks@example.com',
        firstName: 'Ada',
        id: 'patient-1',
        lastName: 'Brooks',
        phoneNumber: '+1 555-0101',
        updatedAt: '2026-01-03T03:04:05.000Z',
      },
    );
    await expect(repository.create(input)).resolves.toMatchObject({
      id: 'patient-1',
      ...input,
    });
    await expect(repository.update('patient-2', input)).resolves.toMatchObject({
      id: 'patient-2',
      ...input,
    });

    expect(findUniqueCalls).toEqual([
      { where: { id: 'patient-1' } },
      { where: { email: 'ada.brooks@example.com' } },
    ]);
    expect(createCalls).toEqual([{ data: input }]);
    expect(updateCalls).toEqual([{ data: input, where: { id: 'patient-2' } }]);
  });

  test('maps Prisma write errors to repository semantics', async () => {
    const { prisma } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);
    const input = patientInput();
    const patientDelegate = prisma.patient as unknown as {
      create: () => Promise<never>;
      update: () => Promise<never>;
    };

    patientDelegate.create = async () => {
      throw { code: 'P2002' };
    };
    patientDelegate.update = async () => {
      throw { code: 'P2002' };
    };

    for (const action of [
      () => repository.create(input),
      () => repository.update('patient-1', input),
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

      throw new Error('Expected Prisma unique conflicts to map to conflict errors.');
    }

    patientDelegate.update = async () => {
      throw { code: 'P2025' };
    };

    await expect(repository.update('missing', input)).resolves.toBeUndefined();
  });

  test('rethrows non-Prisma write errors without remapping them', async () => {
    const { prisma } = createPrisma();
    const repository = new PrismaPatientsRepository(prisma);
    const input = patientInput();
    const patientDelegate = prisma.patient as unknown as {
      create: () => Promise<never>;
      update: () => Promise<never>;
    };
    const createError = new Error('database offline');
    const stringCreateError = 'database offline during create';
    const updateError = { code: 'P9999' };
    const nullUpdateError = null;
    const stringUpdateError = 'database offline';

    patientDelegate.create = async () => {
      throw createError;
    };
    patientDelegate.update = async () => {
      throw updateError;
    };

    await expect(repository.create(input)).rejects.toBe(createError);
    await expect(repository.update('patient-1', input)).rejects.toBe(updateError);

    patientDelegate.create = async () => {
      throw stringCreateError;
    };

    await expect(repository.create(input)).rejects.toBe(stringCreateError);

    patientDelegate.update = async () => {
      throw nullUpdateError;
    };

    await expect(repository.update('patient-1', input)).rejects.toBe(
      nullUpdateError,
    );

    patientDelegate.update = async () => {
      throw stringUpdateError;
    };

    await expect(repository.update('patient-1', input)).rejects.toBe(
      stringUpdateError,
    );
  });
});
