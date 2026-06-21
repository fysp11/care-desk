import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { createValidationPipe } from './common/validation.js';

const port = Number(process.env.PORT ?? 3001);

const app = await NestFactory.create(AppModule);
app.useGlobalPipes(createValidationPipe());

await app.listen(port);
