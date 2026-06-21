import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator.js';
import type { AuthenticatedRequest, UserRole } from './types.js';

export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<readonly UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.',
      });
    }

    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Required role is missing.',
      });
    }

    return true;
  }
}

Reflect.defineMetadata('design:paramtypes', [Reflector], RolesGuard);
Injectable()(RolesGuard);
