import {
  Injectable,
  UnauthorizedException,
  Inject,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { DEMO_JWT_SECRET, JWT_ALGORITHM } from '../jwt.constants.js';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
  JwtPayload,
  UserRole,
} from '../types/auth.types.js';

const isUserRole = (role: unknown): role is UserRole =>
  role === 'admin' || role === 'user';

const isJwtPayload = (payload: unknown): payload is JwtPayload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.email === 'string' &&
    isUserRole(candidate.role)
  );
};

const getBearerToken = (
  authorization: string | readonly string[] | undefined,
): string | undefined => {
  const header = Array.isArray(authorization)
    ? authorization[0]
    : authorization;

  if (!header) {
    return undefined;
  }

  const match = /^Bearer\s+(.+)$/.exec(header);

  return match?.[1];
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: [JWT_ALGORITHM],
        secret: DEMO_JWT_SECRET,
      });

      if (!isJwtPayload(payload)) {
        throw new UnauthorizedException();
      }

      request.user = this.toAuthenticatedUser(payload);

      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication token is invalid or expired.',
      });
    }
  }

  private toAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
    return {
      email: payload.email,
      id: payload.sub,
      role: payload.role,
    };
  }
}
