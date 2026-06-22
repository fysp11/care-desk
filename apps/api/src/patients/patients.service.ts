import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PATIENTS_REPOSITORY,
  type PatientsRepository,
} from './patients.repository.contract.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { ListPatientsDto } from './dto/list-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
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
  constructor(
    @Inject(PATIENTS_REPOSITORY)
    private readonly patientsRepository: PatientsRepository,
  ) {}

  async list(query: ListPatientsDto): Promise<PatientListResponse> {
    return this.patientsRepository.list(this.toListOptions(query));
  }

  async getById(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findById(id);

    if (!patient) {
      throw this.notFoundError();
    }

    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    const input = this.toWriteInput(dto);
    await this.assertEmailAvailable(input.email);

    return this.patientsRepository.create(input);
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const existingPatient = await this.patientsRepository.findById(id);

    if (!existingPatient) {
      throw this.notFoundError();
    }

    const input = this.toWriteInput(dto);
    await this.assertEmailAvailable(input.email, id);

    const updated = await this.patientsRepository.update(id, input);

    return updated ?? existingPatient;
  }

  async delete(id: string): Promise<{ readonly ok: true }> {
    const deleted = await this.patientsRepository.delete(id);

    if (!deleted) {
      throw this.notFoundError();
    }

    return { ok: true };
  }

  private toListOptions(query: ListPatientsDto): PatientListOptions {
    const requestedLimit = query.limit ? Number(query.limit) : DEFAULT_LIMIT;
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

  private async assertEmailAvailable(
    email: string,
    currentPatientId?: string,
  ): Promise<void> {
    const existingPatient = await this.patientsRepository.findByEmail(email);

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

Injectable()(PatientsService);
