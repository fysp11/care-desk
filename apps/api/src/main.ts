import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { createValidationPipe } from './common/validation.js';

const port = Number(process.env.PORT ?? 3001);
const localBrowserOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const app = await NestFactory.create(AppModule);
app.enableCors({
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || localBrowserOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }

    callback(
      new Error('Origin is not allowed by the local development CORS policy.'),
      false,
    );
  },
});

const config = new DocumentBuilder()
  .setTitle('Cats example')
  .setDescription('The cats API description')
  .setVersion('1.0')
  .addTag('cats')
  .build();
const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, documentFactory);


app.useGlobalPipes(createValidationPipe());

await app.listen(port);
