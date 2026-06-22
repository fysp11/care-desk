import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePatientDto } from './dto/create-patient.dto.js';
import { ListPatientsDto } from './dto/list-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { InMemoryPatientsRepository } from './patients.repository.js';
import type {
  Patient,
  PatientListOptions,
  PatientListResponse,
  PatientSortBy,
  PatientSortDir,
  PatientWriteInput,
} from './types.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_SORT_BY = 'lastName' satisfies PatientSortBy;
const DEFAULT_SORT_DIR = 'asc' satisfies PatientSortDir;

export class PatientsService {
  constructor(private readonly patientsRepository: InMemoryPatientsRepository) {}

  list(query: ListPatientsDto): PatientListResponse {
    return this.patientsRepository.list(this.toListOptions(query));
  }

  getById(id: string): Patient {
    const patient = this.patientsRepository.findById(id);

    if (!patient) {
      throw this.notFoundError();
    }

    return patient;
  }

  create(dto: CreatePatientDto): Patient {
    const input = this.toWriteInput(dto);
    this.assertEmailAvailable(input.email);

    return this.patientsRepository.create(input);
  }

  update(id: string, dto: UpdatePatientDto): Patient {
    const existingPatient = this.patientsRepository.findById(id);

    if (!existingPatient) {
      throw this.notFoundError();
    }

    const input = this.toWriteInput(dto);
    this.assertEmailAvailable(input.email, id);

    return this.patientsRepository.update(id, input) ?? existingPatient;
  }

  delete(id: string): { readonly ok: true } {
    const deleted = this.patientsRepository.delete(id);

    if (!deleted) {
      throw this.notFoundError();
    }

    return { ok: true };
  }

  private toListOptions(query: ListPatientsDto): PatientListOptions {
    const requestedLimit = query.limit
      ? Number(query.limit)
      : DEFAULT_LIMIT;
    const search = query.search?.trim();
    const options: PatientListOptions = {
      limit: Math.min(requestedLimit, MAX_LIMIT),
      page: query.page ? Number(query.page) : DEFAULT_PAGE,
      sortBy: (query.sortBy ?? DEFAULT_SORT_BY) as PatientSortBy,
      sortDir: (query.sortDir ?? DEFAULT_SORT_DIR) as PatientSortDir,
    };

    return search ? { ...options, search: search.toLowerCase() } : options;
  }

  private toWriteInput(
    dto: CreatePatientDto | UpdatePatientDto,
  ): PatientWriteInput {
    return {
      dob: dto.dob.trim(),
      email: dto.email.trim().toLowerCase(),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phoneNumber: dto.phoneNumber.trim(),
    };
  }

  private assertEmailAvailable(email: string, currentPatientId?: string): void {
    const existingPatient = this.patientsRepository.findByEmail(email);

    if (existingPatient && existingPatient.id !== currentPatientId) {
      throw new ConflictException({
        code: 'PATIENT_EMAIL_CONFLICT',
        message: 'Patient email already exists.',
      });
    }
  }

  private notFoundError(): NotFoundException {
    return new NotFoundException({
      code: 'PATIENT_NOT_FOUND',
      message: 'Patient was not found.',
    });
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [InMemoryPatientsRepository],
  PatientsService,
);
Injectable()(PatientsService);
