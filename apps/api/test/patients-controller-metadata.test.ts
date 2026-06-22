import { describe, expect, test } from 'bun:test';
import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants.js';

import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { ROLES_KEY } from '../src/auth/roles.decorator.js';
import { RolesGuard } from '../src/auth/roles.guard.js';
import { CreatePatientDto } from '../src/patients/dto/create-patient.dto.js';
import { ListPatientsDto } from '../src/patients/dto/list-patients.dto.js';
import { UpdatePatientDto } from '../src/patients/dto/update-patient.dto.js';
import { PatientsController } from '../src/patients/patients.controller.js';
import type { PatientsService } from '../src/patients/patients.service.js';
import type { Patient } from '../src/patients/types.js';

const metadataFor = (methodName: keyof PatientsController) => {
  const method = PatientsController.prototype[methodName];

  return {
    args: Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      PatientsController,
      methodName,
    ) as Record<string, { readonly data?: string; readonly index: number }>,
    guards: Reflect.getMetadata(GUARDS_METADATA, method) as unknown[],
    method: Reflect.getMetadata(METHOD_METADATA, method) as RequestMethod,
    paramTypes: Reflect.getMetadata(
      'design:paramtypes',
      PatientsController.prototype,
      methodName,
    ) as unknown[],
    path: Reflect.getMetadata(PATH_METADATA, method) as string,
    roles: Reflect.getMetadata(ROLES_KEY, method) as
      | readonly string[]
      | undefined,
  };
};

const expectRouteArg = (
  args: Record<string, { readonly data?: string; readonly index: number }>,
  expected: { readonly data?: string; readonly index: number },
): void => {
  expect(Object.values(args)).toContainEqual(expect.objectContaining(expected));
};

const patient = (id: string, overrides: Partial<Patient> = {}): Patient => ({
  createdAt: '2026-01-02T03:04:05.000Z',
  dob: '1984-02-13',
  email: 'ada.brooks@example.com',
  firstName: 'Ada',
  id,
  lastName: 'Brooks',
  phoneNumber: '+1 555-0101',
  updatedAt: '2026-01-03T03:04:05.000Z',
  ...overrides,
});

const createController = () => {
  const calls: Array<readonly unknown[]> = [];
  const service = {
    async create(body: unknown) {
      calls.push(['create', body]);

      return patient('created-patient');
    },
    async delete(id: string) {
      calls.push(['delete', id]);

      return { ok: true };
    },
    async getById(id: string) {
      calls.push(['getById', id]);

      return patient(id);
    },
    async list(query: unknown) {
      calls.push(['list', query]);

      return { data: [], limit: 10, page: 1, total: 0 };
    },
    async update(id: string, body: unknown) {
      calls.push(['update', id, body]);

      return patient(id, body as Partial<Patient>);
    },
  } as unknown as PatientsService;

  return {
    calls,
    controller: new PatientsController(service),
  };
};

describe('PatientsController metadata', () => {
  test('keeps the patients route prefix and service constructor metadata', () => {
    expect(Reflect.getMetadata(PATH_METADATA, PatientsController)).toBe(
      'patients',
    );
    expect(
      Reflect.getMetadata('design:paramtypes', PatientsController),
    ).toEqual([expect.any(Function)]);
  });

  test('keeps read routes authenticated without admin roles', () => {
    expect(metadataFor('list')).toMatchObject({
      guards: [JwtAuthGuard],
      method: RequestMethod.GET,
      paramTypes: [ListPatientsDto],
      path: '/',
      roles: undefined,
    });
    expectRouteArg(metadataFor('list').args, { index: 0 });

    expect(metadataFor('getById')).toMatchObject({
      guards: [JwtAuthGuard],
      method: RequestMethod.GET,
      paramTypes: [String],
      path: ':id',
      roles: undefined,
    });
    expectRouteArg(metadataFor('getById').args, {
      data: 'id',
      index: 0,
    });
  });

  test('keeps mutation routes authenticated and admin-only', () => {
    expect(metadataFor('create')).toMatchObject({
      guards: [JwtAuthGuard, RolesGuard],
      method: RequestMethod.POST,
      paramTypes: [CreatePatientDto],
      path: '/',
      roles: ['admin'],
    });
    expectRouteArg(metadataFor('create').args, { index: 0 });

    expect(metadataFor('update')).toMatchObject({
      guards: [JwtAuthGuard, RolesGuard],
      method: RequestMethod.PUT,
      paramTypes: [String, UpdatePatientDto],
      path: ':id',
      roles: ['admin'],
    });
    expectRouteArg(metadataFor('update').args, {
      data: 'id',
      index: 0,
    });
    expectRouteArg(metadataFor('update').args, { index: 1 });

    expect(metadataFor('delete')).toMatchObject({
      guards: [JwtAuthGuard, RolesGuard],
      method: RequestMethod.DELETE,
      paramTypes: [String],
      path: ':id',
      roles: ['admin'],
    });
    expectRouteArg(metadataFor('delete').args, {
      data: 'id',
      index: 0,
    });
  });

  test('delegates requests to PatientsService without reshaping arguments', async () => {
    const { calls, controller } = createController();
    const query = { page: '1' };
    const body = { email: 'ada@example.com' };

    await expect(controller.list(query as ListPatientsDto)).resolves.toEqual({
      data: [],
      limit: 10,
      page: 1,
      total: 0,
    });
    await expect(controller.getById('patient-1')).resolves.toEqual({
      ...patient('patient-1'),
    });
    await expect(controller.create(body as CreatePatientDto)).resolves.toEqual(
      patient('created-patient'),
    );
    await expect(
      controller.update('patient-1', body as UpdatePatientDto),
    ).resolves.toEqual({
      ...patient('patient-1', { email: 'ada@example.com' }),
    });
    await expect(controller.delete('patient-1')).resolves.toEqual({ ok: true });

    expect(calls).toEqual([
      ['list', query],
      ['getById', 'patient-1'],
      ['create', body],
      ['update', 'patient-1', body],
      ['delete', 'patient-1'],
    ]);
  });
});
