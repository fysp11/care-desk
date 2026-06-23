import { PrismaClient } from '../apps/api/src/generated/prisma/client.js';
import { seededPatients } from '../apps/api/src/patients/patient-fixtures.js';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://care_desk_user:care_desk_password@127.0.0.1:5432/care_desk';

const isAllowedSeedDatabaseUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === 'postgresql:' &&
      ['127.0.0.1', 'localhost'].includes(parsed.hostname) &&
      parsed.pathname === '/care_desk'
    );
  } catch {
    return false;
  }
};

if (
  process.env.CARE_DESK_ALLOW_SEED_RESET !== 'true' &&
  !isAllowedSeedDatabaseUrl(databaseUrl)
) {
  throw new Error(
    'Refusing to seed a non-local care_desk database without CARE_DESK_ALLOW_SEED_RESET=true.',
  );
}

const adapter = new PrismaPg(databaseUrl);

const prisma = new PrismaClient({ adapter });

await prisma.patient.deleteMany();
await prisma.patient.createMany({
  data: seededPatients.map((patient) => ({
    ...patient,
    createdAt: new Date(patient.createdAt),
    updatedAt: new Date(patient.updatedAt),
  })),
});

await prisma.$disconnect();
