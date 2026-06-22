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

  list(query: ListPatientsDto): PatientListResponse {
    return this.patientsService.list(query);
  }

  getById(id: string): Patient {
    return this.patientsService.getById(id);
  }

  create(body: CreatePatientDto): Patient {
    return this.patientsService.create(body);
  }

  update(id: string, body: UpdatePatientDto): Patient {
    return this.patientsService.update(id, body);
  }

  delete(id: string): { readonly ok: true } {
    return this.patientsService.delete(id);
  }
}

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

const listDescriptor = getMethodDescriptor(PatientsController.prototype, 'list');
Reflect.defineMetadata(
  'design:paramtypes',
  [ListPatientsDto],
  PatientsController.prototype,
  'list',
);
Query()(PatientsController.prototype, 'list', 0);
UseGuards(JwtAuthGuard)(PatientsController.prototype, 'list', listDescriptor);
Get()(PatientsController.prototype, 'list', listDescriptor);

const getByIdDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  'getById',
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String],
  PatientsController.prototype,
  'getById',
);
Param('id')(PatientsController.prototype, 'getById', 0);
UseGuards(JwtAuthGuard)(
  PatientsController.prototype,
  'getById',
  getByIdDescriptor,
);
Get(':id')(PatientsController.prototype, 'getById', getByIdDescriptor);

const createDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  'create',
);
Reflect.defineMetadata(
  'design:paramtypes',
  [CreatePatientDto],
  PatientsController.prototype,
  'create',
);
Body()(PatientsController.prototype, 'create', 0);
Roles('admin')(
  PatientsController.prototype,
  'create',
  createDescriptor,
);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  'create',
  createDescriptor,
);
Post()(PatientsController.prototype, 'create', createDescriptor);

const updateDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  'update',
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String, UpdatePatientDto],
  PatientsController.prototype,
  'update',
);
Param('id')(PatientsController.prototype, 'update', 0);
Body()(PatientsController.prototype, 'update', 1);
Roles('admin')(
  PatientsController.prototype,
  'update',
  updateDescriptor,
);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  'update',
  updateDescriptor,
);
Put(':id')(PatientsController.prototype, 'update', updateDescriptor);

const deleteDescriptor = getMethodDescriptor(
  PatientsController.prototype,
  'delete',
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String],
  PatientsController.prototype,
  'delete',
);
Param('id')(PatientsController.prototype, 'delete', 0);
Roles('admin')(
  PatientsController.prototype,
  'delete',
  deleteDescriptor,
);
UseGuards(JwtAuthGuard, RolesGuard)(
  PatientsController.prototype,
  'delete',
  deleteDescriptor,
);
Delete(':id')(PatientsController.prototype, 'delete', deleteDescriptor);

Controller('patients')(PatientsController);
