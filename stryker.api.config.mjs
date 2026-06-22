// @ts-check

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  cleanTempDir: 'always',
  commandRunner: {
    command:
      'bun --cwd apps/api db:generate && bun --cwd apps/api test ./test/patients.test.ts ./test/validation.test.ts',
  },
  concurrency: 1,
  coverageAnalysis: 'off',
  ignorePatterns: [
    'apps/api/src/generated/**',
    '**/dist/**',
    'coverage/**',
    'reports/**',
  ],
  jsonReporter: {
    fileName: 'reports/mutation-api/mutation.json',
  },
  htmlReporter: {
    fileName: 'reports/mutation-api/index.html',
  },
  mutate: [
    'apps/api/src/common/validation.ts:6-37',
    'apps/api/src/patients/patients.repository.ts:71-78',
  ],
  reporters: ['clear-text', 'progress', 'json', 'html'],
  testRunner: 'command',
  thresholds: {
    break: 90,
    high: 90,
    low: 90,
  },
  timeoutMS: 20000,
};

export default config;
