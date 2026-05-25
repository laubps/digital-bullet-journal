// jest.config.js — intentionally .js (not .ts) because Jest loads
// this file before any TypeScript transformation is in place.
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Points to the Next.js app root so next/jest can load next.config.ts
  // and .env files during tests.
  dir: './',
});

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Mirror the @/* path alias from tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
  ],
};

module.exports = createJestConfig(customConfig);
