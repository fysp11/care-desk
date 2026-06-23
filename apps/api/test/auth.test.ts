import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import {
  Controller,
  Get,
  Module,
  UseGuards,
  type INestApplication,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import inject from 'light-my-request';

import { AuthModule } from '../src/auth/auth.module.js';
import { CurrentUser } from '../src/auth/decorators/current-user.decorator.js';
import { Roles } from '../src/auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../src/auth/guards/roles.guard.js';
import {
  DEMO_JWT_SECRET,
  JWT_ALGORITHM,
} from '../src/auth/jwt.constants.js';
import type {
  AuthenticatedUser,
  JwtPayload,
  LoginResponse,
} from '../src/auth/types/auth.types.js';
import { createValidationPipe } from '../src/common/validation.js';

type VerifiedPayload = JwtPayload & {
  readonly exp: number;
  readonly iat: number;
};

interface ApiErrorBody {
  readonly code?: string;
  readonly message?: string;
}

let app: INestApplication | undefined;
type TestResponse = {
  readonly statusCode: number;
  json: <T = unknown>() => T;
};

const injectRequest = inject as unknown as (
  dispatch: unknown,
  options: unknown,
) => Promise<TestResponse>;

let dispatch: unknown;
let jwtService: JwtService;

type PublicProbeUser = {
  readonly id: string;
  readonly email: string;
  readonly role: AuthenticatedUser['role'];
};

const toPublicProbeUser = (user: AuthenticatedUser): PublicProbeUser => ({
  email: user.email,
  id: user.id,
  role: user.role,
});

@Controller('auth/probe')
class AuthProbeTestController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): { readonly user: PublicProbeUser } {
    return { user: toPublicProbeUser(user) };
  }

  @Get('admin')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  adminOnly(
    @CurrentUser() user: AuthenticatedUser,
  ): { readonly ok: true; readonly user: PublicProbeUser } {
    return { ok: true, user: toPublicProbeUser(user) };
  }
}

@Module({
  controllers: [AuthProbeTestController],
  imports: [
    AuthModule,
    JwtModule.register({
      secret: DEMO_JWT_SECRET,
      signOptions: {
        algorithm: JWT_ALGORITHM,
      },
      verifyOptions: {
        algorithms: [JWT_ALGORITHM],
      },
    }),
  ],
})
class AuthProbeTestModule {}

const postLogin = (body: unknown): Promise<TestResponse> =>
  injectRequest(dispatch, {
    method: 'POST',
    payload: body as Record<string, unknown>,
    url: '/auth/login',
    headers: {
      'content-type': 'application/json',
    },
  });

const loginAs = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await postLogin({ email, password });

  expect(response.statusCode).toBe(200);

  return response.json<LoginResponse>();
};

const getProbe = async (
  path: '/auth/probe/me' | '/auth/probe/admin',
  token?: string,
): Promise<TestResponse> => {
  const headers: Record<string, string> = {};

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return injectRequest(dispatch, {
    headers,
    method: 'GET',
    url: path,
  });
};

describe('auth trust boundary', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthProbeTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    dispatch = app.getHttpAdapter().getInstance();
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app?.close();
  });

  test('admin login returns a JWT with sub, email, role, algorithm, and expiry', async () => {
    const response = await postLogin({
      email: 'admin@example.com',
      password: 'admin-password',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<LoginResponse>();
    expect(body.user.email).toBe('admin@example.com');
    expect(body.user.role).toBe('admin');
    expect(typeof body.token).toBe('string');

    const [header] = body.token.split('.');
    const decodedHeader = JSON.parse(
      Buffer.from(header ?? '', 'base64url').toString('utf8'),
    ) as { alg?: string };

    expect(decodedHeader.alg).toBe(JWT_ALGORITHM);

    const payload = await jwtService.verifyAsync<VerifiedPayload>(body.token, {
      algorithms: [JWT_ALGORITHM],
      secret: DEMO_JWT_SECRET,
    });

    expect(payload.sub).toBe('demo-admin');
    expect(payload.email).toBe('admin@example.com');
    expect(payload.role).toBe('admin');
    expect(payload.exp > payload.iat).toBe(true);
  });

  test('user login succeeds with the seeded user credentials', async () => {
    const response = await postLogin({
      email: 'user@example.com',
      password: 'user-password',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<LoginResponse>();
    expect(body.user.email).toBe('user@example.com');
    expect(body.user.role).toBe('user');
    expect(typeof body.token).toBe('string');
  });

  test('invalid login body returns 400', async () => {
    const response = await postLogin({
      email: 'not-an-email',
    });

    expect(response.statusCode).toBe(400);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  test('wrong credentials return 401', async () => {
    const response = await postLogin({
      email: 'admin@example.com',
      password: 'wrong-password',
    });

    expect(response.statusCode).toBe(401);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('INVALID_CREDENTIALS');
  });

  test('missing token on an authenticated route returns 401', async () => {
    const response = await getProbe('/auth/probe/me');

    expect(response.statusCode).toBe(401);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('malformed token on an authenticated route returns 401', async () => {
    const response = await getProbe('/auth/probe/me', 'not-a-jwt');

    expect(response.statusCode).toBe(401);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('JWT signed with a different secret on an authenticated route returns 401', async () => {
    const forgedToken = await jwtService.signAsync(
      {
        email: 'user@example.com',
        role: 'user',
        sub: 'demo-user',
      } satisfies JwtPayload,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: '15m',
        secret: 'not-the-demo-jwt-secret',
      },
    );

    const response = await getProbe('/auth/probe/me', forgedToken);

    expect(response.statusCode).toBe(401);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('expired token on an authenticated route returns 401', async () => {
    const expiredToken = await jwtService.signAsync(
      {
        email: 'user@example.com',
        role: 'user',
        sub: 'demo-user',
      } satisfies JwtPayload,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: -1,
        secret: DEMO_JWT_SECRET,
      },
    );

    const response = await getProbe('/auth/probe/me', expiredToken);

    expect(response.statusCode).toBe(401);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('user token on the admin-only route returns 403', async () => {
    const login = await loginAs('user@example.com', 'user-password');
    const response = await getProbe('/auth/probe/admin', login.token);

    expect(response.statusCode).toBe(403);

    const body = response.json<ApiErrorBody>();
    expect(body.code).toBe('FORBIDDEN');
  });

  test('admin token on the admin-only route succeeds', async () => {
    const login = await loginAs('admin@example.com', 'admin-password');
    const response = await getProbe('/auth/probe/admin', login.token);

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      readonly ok: boolean;
      readonly user: LoginResponse['user'];
    }>();

    expect(body.ok).toBe(true);
    expect(body.user.email).toBe('admin@example.com');
    expect(body.user.role).toBe('admin');
  });
});
