import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { LoginDto } from './login.dto.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';
import type { AuthenticatedUser, LoginResponse } from './types.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login(loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }
}

export class AuthProbeController {
  me(user: AuthenticatedUser): { user: AuthenticatedUser } {
    return { user };
  }

  adminOnly(
    user: AuthenticatedUser,
  ): { ok: true; user: AuthenticatedUser } {
    return { ok: true, user };
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

const loginDescriptor = getMethodDescriptor(AuthController.prototype, 'login');
Reflect.defineMetadata('design:paramtypes', [AuthService], AuthController);
Reflect.defineMetadata(
  'design:paramtypes',
  [LoginDto],
  AuthController.prototype,
  'login',
);
Body()(AuthController.prototype, 'login', 0);
HttpCode(HttpStatus.OK)(AuthController.prototype, 'login', loginDescriptor);
Post('login')(AuthController.prototype, 'login', loginDescriptor);
Controller('auth')(AuthController);

const meDescriptor = getMethodDescriptor(AuthProbeController.prototype, 'me');
CurrentUser()(AuthProbeController.prototype, 'me', 0);
UseGuards(JwtAuthGuard)(AuthProbeController.prototype, 'me', meDescriptor);
Get('me')(AuthProbeController.prototype, 'me', meDescriptor);
Controller('auth/probe')(AuthProbeController);

const adminOnlyDescriptor = getMethodDescriptor(
  AuthProbeController.prototype,
  'adminOnly',
);
CurrentUser()(AuthProbeController.prototype, 'adminOnly', 0);
Roles('admin')(
  AuthProbeController.prototype,
  'adminOnly',
  adminOnlyDescriptor,
);
UseGuards(JwtAuthGuard, RolesGuard)(
  AuthProbeController.prototype,
  'adminOnly',
  adminOnlyDescriptor,
);
Get('admin')(
  AuthProbeController.prototype,
  'adminOnly',
  adminOnlyDescriptor,
);
