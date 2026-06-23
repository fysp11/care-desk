import type {
  Prisma,
  Patient as PrismaPatient,
} from '../generated/prisma/client.js';
import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';
import { seededPatients } from './patient-fixtures.js';
import type {
  PatientsRepository,
  ResettablePatientsRepository,
} from './patients.repository.contract.js';
import type {
  Patient,
  PatientListOptions,
  PatientListResponse,
  PatientWriteInput,
} from './types.js';

const mapPatient = (patient: PrismaPatient): Patient => ({
  createdAt: patient.createdAt.toISOString(),
  dob: patient.dob,
  email: patient.email,
  firstName: patient.firstName,
  id: patient.id,
  lastName: patient.lastName,
  phoneNumber: patient.phoneNumber,
  updatedAt: patient.updatedAt.toISOString(),
});

const buildOrderBy = ({
  sortBy,
  sortDir,
}: PatientListOptions): Prisma.PatientOrderByWithRelationInput[] =>
  [
    { [sortBy]: sortDir },
    { id: 'asc' },
  ] as Prisma.PatientOrderByWithRelationInput[];

@Injectable()
export class PrismaPatientsRepository
  implements PatientsRepository, ResettablePatientsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async reset(): Promise<void> {
    await this.prisma.patient.deleteMany();
    await this.prisma.patient.createMany({
      data: seededPatients.map((patient) => ({
        ...patient,
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt),
        dob: patient.dob,
      })),
    });
  }

  async list(options: PatientListOptions): Promise<PatientListResponse> {
    const search = options.search?.trim();
    const where: Prisma.PatientWhereInput | undefined = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [patients, total] = await Promise.all([
      where
        ? this.prisma.patient.findMany({
            orderBy: buildOrderBy(options),
            skip: (options.page - 1) * options.limit,
            take: options.limit,
            where,
          })
        : this.prisma.patient.findMany({
            orderBy: buildOrderBy(options),
            skip: (options.page - 1) * options.limit,
            take: options.limit,
          }),
      where
        ? this.prisma.patient.count({ where })
        : this.prisma.patient.count(),
    ]);

    return {
      data: patients.map(mapPatient),
      limit: options.limit,
      page: options.page,
      total,
    };
  }

  async findById(id: string): Promise<Patient | undefined> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });

    return patient ? mapPatient(patient) : undefined;
  }

  async findByEmail(email: string): Promise<Patient | undefined> {
    const patient = await this.prisma.patient.findUnique({
      where: { email: email.toLowerCase() },
    });

    return patient ? mapPatient(patient) : undefined;
  }

  async create(input: PatientWriteInput): Promise<Patient> {
    try {
      const patient = await this.prisma.patient.create({
        data: input,
      });

      return mapPatient(patient);
    } catch (error: unknown) {
      if (this.isPrismaConflictError(error)) {
        throw new ConflictException({
          code: 'PATIENT_EMAIL_CONFLICT',
          message: 'Patient email already exists.',
        });
      }

      throw error;
    }
  }

  async update(
    id: string,
    input: PatientWriteInput,
  ): Promise<Patient | undefined> {
    try {
      const patient = await this.prisma.patient.update({
        data: input,
        where: { id },
      });

      return mapPatient(patient);
    } catch (error: unknown) {
      if (this.isPrismaConflictError(error)) {
        throw new ConflictException({
          code: 'PATIENT_EMAIL_CONFLICT',
          message: 'Patient email already exists.',
        });
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        return undefined;
      }

      throw error;
    }
  }

  private isPrismaConflictError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    );
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.patient.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }
}
