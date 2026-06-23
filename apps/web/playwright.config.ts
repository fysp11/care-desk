import { defineConfig, devices } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  reporter: [['list']],
  testDir: './e2e',
  timeout: 45_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'npm run migrate && npm run seed && npm run dev --workspace @care-desk/api',
      cwd: repoRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: 'http://127.0.0.1:3001/patients',
    },
    {
      command: 'npm run dev --workspace @care-desk/web',
      cwd: repoRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: 'http://localhost:3000',
    },
  ],
  workers: 1,
});
