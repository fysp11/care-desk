import { describe, expect, test } from 'vitest';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants.js';

import { AuthController } from '../src/auth/auth.controller.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { AuthService } from '../src/auth/auth.service.js';
import { LoginDto } from '../src/auth/dto/login.dto.js';
import type { LoginResponse } from '../src/auth/types/auth.types.js';

type ControllerClass = typeof AuthController;
type ControllerInstance = AuthController;

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
  };
};

const expectRouteArg = (
  args: Record<string, { readonly data?: string; readonly index: number }>,
  expected: { readonly data?: string; readonly index: number },
): void => {
  expect(Object.values(args)).toContainEqual(expect.objectContaining(expected));
};

describe('auth controller metadata', () => {
  test('keeps login public with the expected route, status, body, and service injection', async () => {
    const loginResult = {
      token: 'demo-token',
      user: {
        email: 'admin@example.com',
        role: 'admin',
      },
    } satisfies LoginResponse;
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
    });
    expectRouteArg(
      metadataFor(AuthController, AuthController.prototype, 'login').args,
      { index: 0 },
    );

    await expect(controller.login(body)).resolves.toBe(loginResult);
    expect(calls).toEqual([body]);
  });

  test('keeps production auth module scoped to the login controller', () => {
    expect(Reflect.getMetadata('controllers', AuthModule)).toEqual([
      AuthController,
    ]);
  });
});
