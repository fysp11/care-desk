import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import {
  DEMO_JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from '../auth/jwt.constants.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { PatientsController } from './patients.controller.js';
import { InMemoryPatientsRepository } from './patients.repository.js';
import { PatientsService } from './patients.service.js';

export class PatientsModule {}

Module({
  controllers: [PatientsController],
  imports: [
    JwtModule.register({
      secret: DEMO_JWT_SECRET,
      signOptions: {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_EXPIRES_IN,
      },
      verifyOptions: {
        algorithms: [JWT_ALGORITHM],
      },
    }),
  ],
  providers: [
    InMemoryPatientsRepository,
    JwtAuthGuard,
    PatientsService,
    RolesGuard,
  ],
})(PatientsModule);
