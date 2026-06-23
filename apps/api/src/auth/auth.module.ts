import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
  DEMO_JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from './jwt.constants.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  controllers: [AuthController],
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
})
export class AuthModule {}
