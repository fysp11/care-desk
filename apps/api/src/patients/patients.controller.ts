import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { ListPatientsDto } from './dto/list-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PatientsService } from './patients.service.js';
import type { Patient, PatientListResponse } from './types.js';

export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  async list(query: ListPatientsDto): Promise<PatientListResponse> {
    return this.patientsService.list(query);
  }

  async getById(id: string): Promise<Patient> {
    return this.patientsService.getById(id);
  }

  async create(body: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(body);
  }

  async update(id: string, body: UpdatePatientDto): Promise<Patient> {
    return this.patientsService.update(id, body);
  }

  async delete(id: string): Promise<{ readonly ok: true }> {
    return this.patientsService.delete(id);
  }
}

const methods = {
  create: 'create',
  delete: 'delete',
  getById: 'getById',
  list: 'list',
  update: 'update',
} as const satisfies Record<keyof PatientsController, keyof PatientsController>;

const getMethodDescriptor = (
  target: object,
  methodName: string,
): PropertyDescriptor => {
  const descriptor = Object.getOwnPropertyDescriptor(target, methodName);

  if (!descriptor) {
    throw new Error(`Missing method descriptor for ${methodName}.`);
  }

  return descriptor;
};

Reflect.defineMetadata(
  'design:paramtypes',
  [PatientsService],
  PatientsController,
);

const listDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  methods.list,
);
Reflect.defineMetadata(
  'design:paramtypes',
  [ListPatientsDto],
  PatientsController.prototype,
  methods.list,
);
Query()(PatientsController.prototype, methods.list, 0);
UseGuards(JwtAuthGuard)(
  PatientsController.prototype,
  methods.list,
  listDescriptor,
);
Get()(PatientsController.prototype, methods.list, listDescriptor);

const getByIdDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  methods.getById,
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String],
  PatientsController.prototype,
  methods.getById,
);
Param('id')(PatientsController.prototype, methods.getById, 0);
UseGuards(JwtAuthGuard)(
  PatientsController.prototype,
  methods.getById,
  getByIdDescriptor,
);
Get(':id')(PatientsController.prototype, methods.getById, getByIdDescriptor);

const createDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  methods.create,
);
Reflect.defineMetadata(
  'design:paramtypes',
  [CreatePatientDto],
  PatientsController.prototype,
  methods.create,
);
Body()(PatientsController.prototype, methods.create, 0);
Roles('admin')(PatientsController.prototype, methods.create, createDescriptor);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  methods.create,
  createDescriptor,
);
Post()(PatientsController.prototype, methods.create, createDescriptor);

const updateDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  methods.update,
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String, UpdatePatientDto],
  PatientsController.prototype,
  methods.update,
);
Param('id')(PatientsController.prototype, methods.update, 0);
Body()(PatientsController.prototype, methods.update, 1);
Roles('admin')(PatientsController.prototype, methods.update, updateDescriptor);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  methods.update,
  updateDescriptor,
);
Put(':id')(PatientsController.prototype, methods.update, updateDescriptor);

const deleteDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  methods.delete,
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String],
  PatientsController.prototype,
  methods.delete,
);
Param('id')(PatientsController.prototype, methods.delete, 0);
Roles('admin')(PatientsController.prototype, methods.delete, deleteDescriptor);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  methods.delete,
  deleteDescriptor,
);
Delete(':id')(PatientsController.prototype, methods.delete, deleteDescriptor);

Controller('patients')(PatientsController);
