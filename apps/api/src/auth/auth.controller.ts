import {
  Body,
  Controller,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import type { LoginResponse } from './types/auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    this.login = this.login.bind(this);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    if (!this.authService) {
      throw new InternalServerErrorException({
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Login service is unavailable.',
      });
    }

    return this.authService.login(loginDto);
  }
}
