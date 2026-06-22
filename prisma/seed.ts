import { PrismaClient } from '../apps/api/src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const now = new Date('2026-06-21T00:00:00.000Z');
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

const seedPatients = [
  {
    createdAt: now,
    dob: '1984-02-13',
    email: 'ada.brooks@example.com',
    firstName: 'Ada',
    id: 'demo-patient-001',
    lastName: 'Brooks',
    phoneNumber: '+1 555-0101',
    updatedAt: now,
  },
  {
    createdAt: now,
    dob: '1978-11-04',
    email: 'theo.carter@example.com',
    firstName: 'Theo',
    id: 'demo-patient-002',
    lastName: 'Carter',
    phoneNumber: '+1 555-0102',
    updatedAt: now,
  },
  {
    createdAt: now,
    dob: '1992-07-22',
    email: 'mira.diaz@example.com',
    firstName: 'Mira',
    id: 'demo-patient-003',
    lastName: 'Diaz',
    phoneNumber: '+1 555-0103',
    updatedAt: now,
  },
  {
    createdAt: now,
    dob: '1969-05-30',
    email: 'zoe.evans@example.com',
    firstName: 'Zoe',
    id: 'demo-patient-004',
    lastName: 'Evans',
    phoneNumber: '+1 555-0104',
    updatedAt: now,
  },
];

await prisma.patient.deleteMany();
await prisma.patient.createMany({
  data: seedPatients,
});

await prisma.$disconnect();
