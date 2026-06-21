import 'reflect-metadata';

import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';

export class AppModule {}

Module({
  imports: [AuthModule],
})(AppModule);
