import { describe, expect, test, vi } from 'vitest';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma.service.js';

describe('app bootstrap', () => {
  test('does not connect Prisma during application startup', async () => {
    const connect = vi
      .spyOn(PrismaService.prototype, '$connect')
      .mockRejectedValue(new Error('Prisma should connect lazily.'));

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });

    await app.close();

    expect(connect).not.toHaveBeenCalled();
  });
});
