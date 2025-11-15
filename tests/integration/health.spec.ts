/**
 * Integration Test Suite
 * Tests all critical system integrations
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';

test.describe('System Health Checks', () => {
  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('services');
  });

  test('should have database service configured', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    expect(data.services).toHaveProperty('database');
    expect(['up', 'down']).toContain(data.services.database.status);
  });

  test('should have redis service configured', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    expect(data.services).toHaveProperty('redis');
    expect(['up', 'down']).toContain(data.services.redis.status);
  });
});

test.describe('Application Routes', () => {
  test('home page should load in English', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await expect(page).toHaveTitle(/DoganHub/i);
  });

  test('home page should load in Arabic', async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    await expect(page).toHaveTitle(/DoganHub/i);
    
    // Check RTL direction for Arabic
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/login`);
    await expect(page.locator('form')).toBeVisible();
  });

  test('dashboard page should redirect unauthenticated users', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/dashboard`);
    
    // Should redirect to login
    await page.waitForURL(/login/);
    expect(page.url()).toContain('login');
  });
});

test.describe('API Endpoints', () => {
  test('auth session endpoint should respond', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/session`);
    expect([200, 401]).toContain(response.status());
  });

  test('billing plans endpoint should respond', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/billing/plans`);
    expect([200, 401, 404]).toContain(response.status());
  });
});

test.describe('Environment Configuration', () => {
  test('should have required environment variables', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    expect(data.services.environment.status).toBe('up');
  });

  test('should have metadata about the system', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    expect(data.metadata).toHaveProperty('nodeVersion');
    expect(data.metadata).toHaveProperty('platform');
    expect(data.metadata).toHaveProperty('memory');
  });
});
