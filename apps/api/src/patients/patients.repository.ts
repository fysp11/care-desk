import { Injectable } from '@nestjs/common';

import type {
  Patient,
  PatientListOptions,
  PatientListResponse,
  PatientWriteInput,
} from './types.js';

const nowIso = '2026-06-21T00:00:00.000Z';

const seedPatients: readonly Patient[] = [
  {
    createdAt: nowIso,
    dob: '1984-02-13',
    email: 'ada.brooks@example.com',
    firstName: 'Ada',
    id: 'demo-patient-001',
    lastName: 'Brooks',
    phoneNumber: '+1 555-0101',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1978-11-04',
    email: 'theo.carter@example.com',
    firstName: 'Theo',
    id: 'demo-patient-002',
    lastName: 'Carter',
    phoneNumber: '+1 555-0102',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1992-07-22',
    email: 'mira.diaz@example.com',
    firstName: 'Mira',
    id: 'demo-patient-003',
    lastName: 'Diaz',
    phoneNumber: '+1 555-0103',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1969-05-30',
    email: 'zoe.evans@example.com',
    firstName: 'Zoe',
    id: 'demo-patient-004',
    lastName: 'Evans',
    phoneNumber: '+1 555-0104',
    updatedAt: nowIso,
  },
];

const clonePatient = (patient: Patient): Patient => ({ ...patient });

const normalizeComparable = (value: string): string => value.toLowerCase();

export class InMemoryPatientsRepository {
  private patients = new Map<string, Patient>();

  private nextSequence = 1;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.patients = new Map(
      seedPatients.map((patient) => [patient.id, clonePatient(patient)]),
    );
    this.nextSequence = seedPatients.length + 1;
  }

  list(options: PatientListOptions): PatientListResponse {
    const search = options.search?.toLowerCase();
    const filteredPatients = [...this.patients.values()].filter((patient) => {
      if (!search) {
        return true;
      }

      return [
        patient.firstName,
        patient.lastName,
        patient.email,
        patient.phoneNumber,
      ].some((field) => field.toLowerCase().includes(search));
    });

    const sortedPatients = filteredPatients.toSorted((left, right) => {
      const direction = options.sortDir === 'asc' ? 1 : -1;
      const leftValue = normalizeComparable(left[options.sortBy]);
      const rightValue = normalizeComparable(right[options.sortBy]);
      const primaryComparison = leftValue.localeCompare(rightValue);

      if (primaryComparison !== 0) {
        return primaryComparison * direction;
      }

      return left.id.localeCompare(right.id);
    });

    const start = (options.page - 1) * options.limit;
    const data = sortedPatients
      .slice(start, start + options.limit)
      .map(clonePatient);

    return {
      data,
      limit: options.limit,
      page: options.page,
      total: filteredPatients.length,
    };
  }

  findById(id: string): Patient | undefined {
    const patient = this.patients.get(id);

    return patient ? clonePatient(patient) : undefined;
  }

  findByEmail(email: string): Patient | undefined {
    const normalizedEmail = email.toLowerCase();
    const patient = [...this.patients.values()].find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    return patient ? clonePatient(patient) : undefined;
  }

  create(input: PatientWriteInput): Patient {
    const timestamp = new Date().toISOString();
    const patient: Patient = {
      ...input,
      createdAt: timestamp,
      id: this.nextId(),
      updatedAt: timestamp,
    };

    this.patients.set(patient.id, patient);

    return clonePatient(patient);
  }

  update(id: string, input: PatientWriteInput): Patient | undefined {
    const existingPatient = this.patients.get(id);

    if (!existingPatient) {
      return undefined;
    }

    const patient: Patient = {
      ...existingPatient,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.patients.set(id, patient);

    return clonePatient(patient);
  }

  delete(id: string): boolean {
    return this.patients.delete(id);
  }

  private nextId(): string {
    const id = `demo-patient-${String(this.nextSequence).padStart(3, '0')}`;
    this.nextSequence += 1;

    return id;
  }
}

Injectable()(InMemoryPatientsRepository);
