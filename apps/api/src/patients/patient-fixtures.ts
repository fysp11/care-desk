import type { Patient } from './types.js';

const nowIso = '2026-06-21T00:00:00.000Z';

export const seededPatients: readonly Patient[] = [
  {
    createdAt: nowIso,
    dob: '1984-02-13',
    email: 'ada.brooks@example.com',
    firstName: 'Ada',
    id: 'demo-patient-001',
    lastName: 'Brooks',
    phoneNumber: '+1 555-0101',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1978-11-04',
    email: 'theo.carter@example.com',
    firstName: 'Theo',
    id: 'demo-patient-002',
    lastName: 'Carter',
    phoneNumber: '+1 555-0102',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1992-07-22',
    email: 'mira.diaz@example.com',
    firstName: 'Mira',
    id: 'demo-patient-003',
    lastName: 'Diaz',
    phoneNumber: '+1 555-0103',
    updatedAt: nowIso,
  },
  {
    createdAt: nowIso,
    dob: '1969-05-30',
    email: 'zoe.evans@example.com',
    firstName: 'Zoe',
    id: 'demo-patient-004',
    lastName: 'Evans',
    phoneNumber: '+1 555-0104',
    updatedAt: nowIso,
  },
];
