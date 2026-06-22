// @ts-check

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  cleanTempDir: 'always',
  commandRunner: {
    command:
      'bun --cwd apps/web test ./test/browser-storage.test.ts ./test/patient-schema.test.ts ./test/workflow.test.ts ./test/failure-simulation.test.ts ./test/session.test.ts ./test/api.test.ts',
  },
  concurrency: 2,
  coverageAnalysis: 'off',
  ignorePatterns: [
    'apps/api/src/generated/**',
    '**/dist/**',
    'coverage/**',
    'reports/**',
  ],
  jsonReporter: {
    fileName: 'reports/mutation/mutation.json',
  },
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },
  mutate: [
    'apps/web/lib/browser-storage.ts',
    'apps/web/lib/patient-schema.ts',
    'apps/web/lib/workflow.ts',
    'apps/web/lib/failure-simulation.ts:40-44',
    'apps/web/lib/failure-simulation.ts:46-97',
    'apps/web/lib/failure-simulation.ts:99-106',
    'apps/web/lib/failure-simulation.ts:106-160',
    'apps/web/lib/session.ts',
    'apps/web/lib/api.ts:61-199',
  ],
  reporters: ['clear-text', 'progress', 'json', 'html'],
  testRunner: 'command',
  thresholds: {
    break: 90,
    high: 90,
    low: 90,
  },
  timeoutMS: 10000,
};

export default config;
