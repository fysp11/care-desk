// @ts-check

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  cleanTempDir: 'always',
  commandRunner: {
    command:
      'bun --cwd apps/api db:generate && bun --cwd apps/api test ./test/patients-repository.test.ts',
  },
  concurrency: 1,
  coverageAnalysis: 'off',
  ignorePatterns: [
    'apps/api/src/generated/**',
    '**/dist/**',
    'coverage/**',
    'reports/**',
  ],
  jsonReporter: { fileName: 'reports/mutation-api-repository/mutation.json' },
  htmlReporter: { fileName: 'reports/mutation-api-repository/index.html' },
  // Keep these ranges aligned with buildOrderBy and tested repository methods.
  mutate: [
    'apps/api/src/patients/patients.repository.ts:72-79',
    'apps/api/src/patients/patients.repository.ts:97-133',
    'apps/api/src/patients/patients.repository.ts:135-207',
  ],
  reporters: ['clear-text', 'progress', 'json', 'html'],
  testRunner: 'command',
  thresholds: { break: 90, high: 90, low: 90 },
  timeoutMS: 20000,
};

export default config;
