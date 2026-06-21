import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import {
  AuthController,
  AuthProbeController,
} from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
  DEMO_JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from './jwt.constants.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

export class AuthModule {}

Module({
  controllers: [AuthController, AuthProbeController],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
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
  providers: [AuthService, JwtAuthGuard, RolesGuard],
})(AuthModule);
