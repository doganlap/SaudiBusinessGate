/**
 * Test Configuration and Setup Files
 */

// Jest Configuration
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.clean.js'],
  testMatch: [
    '<rootDir>/services/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/api/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/*.test.{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/scripts/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../apps/web/src/$1',
    '^@/lib/(.*)$': '<rootDir>/../lib/$1',
    '^@/components/(.*)$': '<rootDir>/../apps/web/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/../apps/web/src/pages/$1',
    '^@/services/(.*)$': '<rootDir>/../apps/web/src/services/$1'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '../lib/**/*.{js,ts}',
    '../apps/web/src/**/*.{js,jsx,ts,tsx}',
    '!../apps/web/src/**/*.d.ts',
    '!../apps/web/src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testTimeout: 10000,
  maxWorkers: '50%',
  verbose: true
};