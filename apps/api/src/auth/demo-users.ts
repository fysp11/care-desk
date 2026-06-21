import type { UserRole } from './types.js';

interface DemoUser {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
}

export const demoUsers: readonly DemoUser[] = [
  {
    email: 'admin@example.com',
    id: 'demo-admin',
    passwordHash:
      '$2b$10$yl07AH5K.N0Z1g98NjsDdu5qg0hnwGPnDaPIe.58G1eJsX68oIo/.',
    role: 'admin',
  },
  {
    email: 'user@example.com',
    id: 'demo-user',
    passwordHash:
      '$2b$10$rAprI7r0aWs9e7iAZwvXvuaa8S.ppQeZ22agz5Ylfeyydfv6boVjW',
    role: 'user',
  },
];

export const findDemoUserByEmail = (email: string): DemoUser | undefined => {
  const normalizedEmail = email.trim().toLowerCase();

  return demoUsers.find((user) => user.email === normalizedEmail);
};
