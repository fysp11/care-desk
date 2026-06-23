import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaService } from '../prisma.service.js';
import { PatientsController } from './patients.controller.js';
import { PATIENTS_REPOSITORY } from './patients.repository.contract.js';
import { PrismaPatientsRepository } from './patients.repository.js';
import { PatientsService } from './patients.service.js';

@Module({
  controllers: [PatientsController],
  imports: [AuthModule],
  providers: [
    PrismaService,
    PrismaPatientsRepository,
    {
      provide: PATIENTS_REPOSITORY,
      useExisting: PrismaPatientsRepository,
    },
    PatientsService,
  ],
})
export class PatientsModule {}
