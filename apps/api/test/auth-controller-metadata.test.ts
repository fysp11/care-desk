import { describe, expect, test } from 'bun:test';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants.js';

import {
  AuthController,
  AuthProbeController,
} from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { LoginDto } from '../src/auth/login.dto.js';
import { ROLES_KEY } from '../src/auth/roles.decorator.js';
import { RolesGuard } from '../src/auth/roles.guard.js';
import type { AuthenticatedUser } from '../src/auth/types.js';

type ControllerClass = typeof AuthController | typeof AuthProbeController;
type ControllerInstance = AuthController | AuthProbeController;

const metadataFor = (
  controller: ControllerClass,
  prototype: ControllerInstance,
  methodName: string,
) => {
  const method = prototype[methodName as keyof ControllerInstance];

  return {
    args: Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      controller,
      methodName,
    ) as Record<string, { readonly data?: string; readonly index: number }>,
    guards: Reflect.getMetadata(GUARDS_METADATA, method) as unknown[],
    httpCode: Reflect.getMetadata(HTTP_CODE_METADATA, method) as
      | number
      | undefined,
    method: Reflect.getMetadata(METHOD_METADATA, method) as RequestMethod,
    paramTypes: Reflect.getMetadata(
      'design:paramtypes',
      prototype,
      methodName,
    ) as unknown[] | undefined,
    path: Reflect.getMetadata(PATH_METADATA, method) as string,
    roles: Reflect.getMetadata(ROLES_KEY, method) as
      | readonly string[]
      | undefined,
  };
};

const expectRouteArg = (
  args: Record<string, { readonly data?: string; readonly index: number }>,
  expected: { readonly data?: string; readonly index: number },
): void => {
  expect(Object.values(args)).toContainEqual(expect.objectContaining(expected));
};

const user: AuthenticatedUser = {
  email: 'admin@example.com',
  id: 'demo-admin',
  role: 'admin',
};

describe('auth controller metadata', () => {
  test('keeps login public with the expected route, status, body, and service injection', async () => {
    const loginResult = {
      token: 'demo-token',
      user: {
        email: user.email,
        role: user.role,
      },
    };
    const calls: unknown[] = [];
    const authService = {
      async login(body: unknown) {
        calls.push(body);

        return loginResult;
      },
    } as unknown as AuthService;
    const controller = new AuthController(authService);
    const body = {
      email: 'admin@example.com',
      password: 'admin-password',
    } as LoginDto;

    expect(Reflect.getMetadata(PATH_METADATA, AuthController)).toBe('auth');
    expect(Reflect.getMetadata('design:paramtypes', AuthController)).toEqual([
      AuthService,
    ]);
    expect(
      metadataFor(AuthController, AuthController.prototype, 'login'),
    ).toMatchObject({
      guards: undefined,
      httpCode: HttpStatus.OK,
      method: RequestMethod.POST,
      paramTypes: [LoginDto],
      path: 'login',
      roles: undefined,
    });
    expectRouteArg(
      metadataFor(AuthController, AuthController.prototype, 'login').args,
      { index: 0 },
    );

    await expect(controller.login(body)).resolves.toBe(loginResult);
    expect(calls).toEqual([body]);
  });

  test('keeps probe routes authenticated and admin route role-protected', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AuthProbeController)).toBe(
      'auth/probe',
    );

    const meMetadata = metadataFor(
      AuthProbeController,
      AuthProbeController.prototype,
      'me',
    );
    expect(meMetadata).toMatchObject({
      guards: [JwtAuthGuard],
      method: RequestMethod.GET,
      path: 'me',
      roles: undefined,
    });
    expectRouteArg(meMetadata.args, { index: 0 });

    const adminMetadata = metadataFor(
      AuthProbeController,
      AuthProbeController.prototype,
      'adminOnly',
    );
    expect(adminMetadata).toMatchObject({
      guards: [JwtAuthGuard, RolesGuard],
      method: RequestMethod.GET,
      path: 'admin',
      roles: ['admin'],
    });
    expectRouteArg(adminMetadata.args, { index: 0 });
  });

  test('probe handlers return the authenticated user without reshaping it', () => {
    const controller = new AuthProbeController();

    expect(controller.me(user)).toEqual({ user });
    expect(controller.adminOnly(user)).toEqual({ ok: true, user });
  });
});
