import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://care_desk_user:care_desk_password@127.0.0.1:5432/care_desk';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg(databaseUrl);

    super({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
