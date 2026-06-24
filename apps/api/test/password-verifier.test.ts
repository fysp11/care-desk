import { describe, expect, test } from 'vitest';

import { verifyPassword } from '../src/auth/password-verifier.js';

describe('password verifier', () => {
  test('verifies bcrypt demo fixture hashes without native bindings', async () => {
    await expect(
      verifyPassword(
        'admin-password',
        '$2b$10$yl07AH5K.N0Z1g98NjsDdu5qg0hnwGPnDaPIe.58G1eJsX68oIo/.',
      ),
    ).resolves.toBe(true);

    await expect(
      verifyPassword(
        'wrong-password',
        '$2b$10$yl07AH5K.N0Z1g98NjsDdu5qg0hnwGPnDaPIe.58G1eJsX68oIo/.',
      ),
    ).resolves.toBe(false);
  });
});
