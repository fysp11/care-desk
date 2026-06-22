import 'reflect-metadata';

import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';
import { PatientsModule } from './patients/patients.module.js';

export class AppModule {}

Module({
  imports: [AuthModule, PatientsModule],
})(AppModule);
