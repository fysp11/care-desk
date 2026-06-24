import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { createCorsOriginCallback } from './common/cors.js';
import { createValidationPipe } from './common/validation.js';

export const bootstrapApi = async (): Promise<void> => {
  const port = Number(process.env.PORT ?? 3001);
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    origin: createCorsOriginCallback(),
  });

  const config = new DocumentBuilder()
    .setTitle('Care Desk API')
    .setDescription('The Care Desk API description')
    .setVersion('1.0')
    .addTag('care')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(createValidationPipe());

  await app.listen(port);
};
