// @ts-check

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  cleanTempDir: "always",
  commandRunner: {
    command: "bun --cwd apps/api test ./test/validation.test.ts",
  },
  concurrency: 1,
  coverageAnalysis: "off",
  ignorePatterns: [
    "apps/api/src/generated/**",
    "**/dist/**",
    "coverage/**",
    "reports/**",
  ],
  jsonReporter: {
    fileName: "reports/mutation-api-dto/mutation.json",
  },
  htmlReporter: {
    fileName: "reports/mutation-api-dto/index.html",
  },
  mutate: [
    "apps/api/src/patients/dto/create-patient.dto.ts",
    "apps/api/src/patients/dto/list-patients.dto.ts",
    "apps/api/src/patients/dto/update-patient.dto.ts",
  ],
  reporters: ["clear-text", "progress", "json", "html"],
  testRunner: "command",
  thresholds: {
    break: 90,
    high: 90,
    low: 90,
  },
  timeoutMS: 20000,
};

export default config;
