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
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import type {
  AuthenticatedUser,
  LoginResponse,
} from './types/auth.types.js';

type PublicUserDto = {
  id: string;
  email: string;
  role: AuthenticatedUser['role'];
};

function toPublicUser(user: AuthenticatedUser): PublicUserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }
}

@Controller('auth/probe')
export class AuthProbeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): { user: PublicUserDto } {
    return { user: toPublicUser(user) };
  }

  @Get('admin')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  adminOnly(
    @CurrentUser() user: AuthenticatedUser,
  ): { ok: true; user: PublicUserDto } {
    return { ok: true, user: toPublicUser(user) };
  }
}
