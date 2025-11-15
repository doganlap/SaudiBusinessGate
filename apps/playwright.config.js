/**
 * Playwright Configuration for End-to-End Testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      NEXTAUTH_SECRET: 'test_secret',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_51234567890',
      STRIPE_SECRET_KEY: 'sk_test_51234567890',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    },
  },
  globalSetup: require.resolve('./__tests__/setup/global-setup.js'),
  globalTeardown: require.resolve('./__tests__/setup/global-teardown.js'),
});