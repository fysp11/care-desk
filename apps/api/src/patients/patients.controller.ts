import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { ListPatientsDto } from './dto/list-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PatientsService } from './patients.service.js';
import type { Patient, PatientListResponse } from './types.js';

@Controller('patients')
export class PatientsController {
  constructor(
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query() query: ListPatientsDto): Promise<PatientListResponse> {
    return this.patientsService.list(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.getById(id);
  }

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(body);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string): Promise<{ readonly ok: true }> {
    return this.patientsService.delete(id);
  }
}
