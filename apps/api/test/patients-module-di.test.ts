import { describe, expect, test } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../src/prisma.service.js';
import {
  DEMO_JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from '../src/auth/jwt.constants.js';
import { PatientsController } from '../src/patients/patients.controller.js';
import { PatientsModule } from '../src/patients/patients.module.js';
import {
  PATIENTS_REPOSITORY,
  type PatientsRepository,
} from '../src/patients/patients.repository.contract.js';
import { PrismaPatientsRepository } from '../src/patients/patients.repository.js';
import { PatientsService } from '../src/patients/patients.service.js';

// @nestjs/jwt registers this provider token at runtime, but its constants
// subpath is not type-resolvable under this repo's NodeNext setup.
const JWT_MODULE_OPTIONS_TOKEN = 'JWT_MODULE_OPTIONS';

describe('patients module DI', () => {
  test('binds the repository token to the Prisma repository provider', async () => {
    const prisma = {
      patient: {
        async count() {
          return 0;
        },
        async findMany() {
          return [];
        },
      },
    };
    const moduleRef = await Test.createTestingModule({
      imports: [PatientsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    try {
      const repositoryByToken =
        moduleRef.get<PatientsRepository>(PATIENTS_REPOSITORY);
      const repositoryByClass = moduleRef.get(PrismaPatientsRepository);
      const service = moduleRef.get(PatientsService);
      const controller = moduleRef.get(PatientsController);
      const jwtService = moduleRef.get(JwtService);

      expect(repositoryByToken).toBe(repositoryByClass);
      expect(service).toBeInstanceOf(PatientsService);
      expect(controller).toBeInstanceOf(PatientsController);
      await expect(service.list({})).resolves.toEqual({
        data: [],
        limit: 10,
        page: 1,
        total: 0,
      });

      const token = jwtService.sign({ sub: 'clinician-1' });
      const tokenParts = token.split('.');
      const [encodedHeader, encodedPayload] = tokenParts as [
        string,
        string,
        string,
      ];
      const header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString(),
      ) as { alg?: string };
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString(),
      ) as { exp?: number; iat?: number; sub?: string };
      const hs384Token = new JwtService({
        secret: DEMO_JWT_SECRET,
        signOptions: { algorithm: 'HS384' },
      }).sign({ sub: 'clinician-1' });
      const jwtOptions = moduleRef.get(JWT_MODULE_OPTIONS_TOKEN, {
        strict: false,
      });

      expect(tokenParts).toHaveLength(3);
      expect(header.alg).toBe(JWT_ALGORITHM);
      expect(payload.sub).toBe('clinician-1');
      expect(typeof payload.exp).toBe('number');
      expect(payload.exp).toBeGreaterThan(payload.iat ?? 0);
      expect(() => jwtService.verify(hs384Token)).toThrow();
      expect(jwtOptions).toMatchObject({
        signOptions: {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_EXPIRES_IN,
        },
        verifyOptions: {
          algorithms: [JWT_ALGORITHM],
        },
      });
    } finally {
      await moduleRef.close();
    }
  });
});
