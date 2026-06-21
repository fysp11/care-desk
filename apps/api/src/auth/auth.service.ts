import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { findDemoUserByEmail } from './demo-users.js';
import { JWT_ALGORITHM, JWT_EXPIRES_IN } from './jwt.constants.js';
import type { LoginDto } from './login.dto.js';
import type { JwtPayload, LoginResponse } from './types.js';

export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = findDemoUserByEmail(loginDto.email);

    if (!user) {
      throw this.invalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw this.invalidCredentialsError();
    }

    const payload: JwtPayload = {
      email: user.email,
      role: user.role,
      sub: user.id,
    };

    const token = await this.jwtService.signAsync(payload, {
      algorithm: JWT_ALGORITHM,
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        email: user.email,
        role: user.role,
      },
    };
  }

  private invalidCredentialsError(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is invalid.',
    });
  }
}

Reflect.defineMetadata('design:paramtypes', [JwtService], AuthService);
Injectable()(AuthService);
