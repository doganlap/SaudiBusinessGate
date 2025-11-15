/**
 * End-to-End Testing Suite for License Management System
 * Tests complete user workflows including subscription lifecycle, billing, and license management
 */

import { test, expect } from '@playwright/test';

// Test configuration
const baseURL = process.env.TEST_URL || 'http://localhost:3000';
const testTenant = {
  email: 'test@example.com',
  password: 'TestPass123!',
  tenantName: 'Test Tenant Corp'
};

const platformAdmin = {
  email: 'admin@platform.com',
  password: 'AdminPass123!',
  role: 'platform_admin'
};

// Mock Stripe card details for testing
const testCard = {
  number: '4242424242424242',
  expiry: '12/25',
  cvc: '123',
  zip: '12345'
};

test.describe('License Management System E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start each test with a fresh session
    await page.goto(baseURL);
    
    // Set up any global test data or mocks
    await page.addInitScript(() => {
      // Mock Stripe.js for testing
      window.Stripe = () => ({
        elements: () => ({
          create: () => ({
            mount: () => {},
            on: () => {},
            destroy: () => {}
          }),
          getElement: () => ({
            getValue: () => ({
              complete: true,
              empty: false,
              error: null
            })
          })
        }),
        confirmCardPayment: () => Promise.resolve({
          paymentIntent: { status: 'succeeded' }
        }),
        createPaymentMethod: () => Promise.resolve({
          paymentMethod: { id: 'pm_test_card' }
        })
      });
    });
  });

  test.describe('User Authentication and Onboarding', () => {
    
    test('new tenant registration and onboarding flow', async ({ page }) => {
      // Navigate to registration
      await page.goto(`${baseURL}/register`);
      
      // Fill registration form
      await page.fill('[data-testid="tenant-name"]', testTenant.tenantName);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.fill('[data-testid="confirm-password"]', testTenant.password);
      
      // Submit registration
      await page.click('[data-testid="register-button"]');
      
      // Should be redirected to onboarding
      await expect(page).toHaveURL(`${baseURL}/onboarding`);
      await expect(page.locator('[data-testid="onboarding-title"]')).toContainText('Welcome');
      
      // Complete onboarding steps
      await page.click('[data-testid="continue-setup"]');
      
      // Select initial plan
      await page.click('[data-testid="select-professional-plan"]');
      await page.click('[data-testid="continue-billing"]');
      
      // Should be redirected to billing setup
      await expect(page).toHaveURL(`${baseURL}/billing/setup`);
    });

    test('tenant login and dashboard access', async ({ page }) => {
      // Login as tenant admin
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
      
      // Should be redirected to dashboard
      await expect(page).toHaveURL(`${baseURL}/dashboard`);
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back');
      
      // Verify license status is displayed
      await expect(page.locator('[data-testid="license-status"]')).toContainText('Professional');
    });
  });

  test.describe('Subscription Management Workflow', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as tenant admin before each test
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(`${baseURL}/dashboard`);
    });

    test('create subscription with payment method', async ({ page }) => {
      // Navigate to billing
      await page.click('[data-testid="billing-nav"]');
      await expect(page).toHaveURL(`${baseURL}/billing`);
      
      // Should see billing setup if no subscription
      if (await page.locator('[data-testid="setup-subscription"]').isVisible()) {
        // Set up new subscription
        await page.click('[data-testid="setup-subscription"]');
        
        // Select plan
        await page.click('[data-testid="select-professional"]');
        
        // Choose billing period
        await page.click('[data-testid="monthly-billing"]');
        
        // Add payment method
        await page.click('[data-testid="add-payment-method"]');
        
        // Fill card details (mocked Stripe elements)
        await page.fill('[data-testid="card-number"]', testCard.number);
        await page.fill('[data-testid="card-expiry"]', testCard.expiry);
        await page.fill('[data-testid="card-cvc"]', testCard.cvc);
        await page.fill('[data-testid="card-zip"]', testCard.zip);
        
        // Submit subscription
        await page.click('[data-testid="create-subscription"]');
        
        // Wait for success message
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Subscription created successfully');
        
        // Verify subscription details
        await expect(page.locator('[data-testid="current-plan"]')).toContainText('Professional Plan');
        await expect(page.locator('[data-testid="billing-amount"]')).toContainText('$299');
      }
    });

    test('upgrade subscription plan', async ({ page }) => {
      // Navigate to billing
      await page.click('[data-testid="billing-nav"]');
      await page.click('[data-testid="subscription-tab"]');
      
      // Click upgrade plan
      await page.click('[data-testid="change-plan"]');
      
      // Select enterprise plan
      await page.click('[data-testid="select-enterprise"]');
      
      // Review upgrade details
      await expect(page.locator('[data-testid="upgrade-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-amount"]')).toContainText('$999');
      
      // Confirm upgrade
      await page.click('[data-testid="confirm-upgrade"]');
      
      // Wait for upgrade completion
      await expect(page.locator('[data-testid="upgrade-success"]')).toContainText('Plan upgraded successfully');
      
      // Verify new plan details
      await expect(page.locator('[data-testid="current-plan"]')).toContainText('Enterprise Plan');
    });

    test('add and manage payment methods', async ({ page }) => {
      // Navigate to payment methods
      await page.click('[data-testid="billing-nav"]');
      await page.click('[data-testid="payment-methods-tab"]');
      
      // Add new payment method
      await page.click('[data-testid="add-payment-method"]');
      
      // Fill new card details
      await page.fill('[data-testid="card-number"]', '5555555555554444'); // Mastercard
      await page.fill('[data-testid="card-expiry"]', '06/26');
      await page.fill('[data-testid="card-cvc"]', '456');
      
      // Save payment method
      await page.click('[data-testid="save-payment-method"]');
      
      // Verify payment method added
      await expect(page.locator('[data-testid="payment-method-list"]')).toContainText('**** 4444');
      
      // Set as default
      await page.click('[data-testid="set-default-pm-2"]');
      await expect(page.locator('[data-testid="default-indicator"]')).toContainText('Default');
      
      // Delete old payment method
      await page.click('[data-testid="delete-pm-1"]');
      await page.click('[data-testid="confirm-delete"]');
      
      // Verify payment method removed
      await expect(page.locator('[data-testid="payment-method-list"]')).not.toContainText('**** 4242');
    });

    test('view billing history and download invoices', async ({ page }) => {
      // Navigate to billing history
      await page.click('[data-testid="billing-nav"]');
      await page.click('[data-testid="billing-history-tab"]');
      
      // Verify invoices are displayed
      await expect(page.locator('[data-testid="invoice-list"]')).toBeVisible();
      
      // Check invoice details
      const firstInvoice = page.locator('[data-testid="invoice-item"]').first();
      await expect(firstInvoice).toContainText('$299.00');
      await expect(firstInvoice).toContainText('Paid');
      
      // Download invoice
      const downloadPromise = page.waitForDownload();
      await firstInvoice.locator('[data-testid="download-invoice"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('cancel subscription', async ({ page }) => {
      // Navigate to subscription management
      await page.click('[data-testid="billing-nav"]');
      await page.click('[data-testid="subscription-tab"]');
      
      // Click cancel subscription
      await page.click('[data-testid="cancel-subscription"]');
      
      // Select cancellation reason
      await page.selectOption('[data-testid="cancel-reason"]', 'switching_provider');
      await page.fill('[data-testid="cancel-feedback"]', 'Testing cancellation flow');
      
      // Choose cancellation timing
      await page.click('[data-testid="cancel-at-period-end"]');
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancellation"]');
      
      // Verify cancellation
      await expect(page.locator('[data-testid="cancellation-notice"]')).toContainText('will be canceled');
      await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Cancel at period end');
    });
  });

  test.describe('Usage Monitoring and Analytics', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
    });

    test('view usage dashboard and analytics', async ({ page }) => {
      // Navigate to usage dashboard
      await page.click('[data-testid="usage-nav"]');
      
      // Verify usage overview
      await expect(page.locator('[data-testid="usage-title"]')).toContainText('Usage Dashboard');
      
      // Check usage metrics
      await expect(page.locator('[data-testid="users-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="storage-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-usage"]')).toBeVisible();
      
      // Verify progress bars
      const userProgress = page.locator('[data-testid="users-progress"]');
      const userPercentage = await userProgress.getAttribute('aria-valuenow');
      expect(parseInt(userPercentage)).toBeGreaterThanOrEqual(0);
      expect(parseInt(userPercentage)).toBeLessThanOrEqual(100);
      
      // Switch to different time periods
      await page.click('[data-testid="weekly-view"]');
      await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
      
      await page.click('[data-testid="monthly-view"]');
      await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
    });

    test('usage limit warnings and upgrade prompts', async ({ page }) => {
      // Mock high usage scenario
      await page.route('**/api/usage/analytics', route => {
        route.fulfill({
          json: {
            currentPlan: 'professional',
            limits: { users: 50, storage: 200, apiCalls: 50000 },
            current: { users: 48, storage: 190, apiCalls: 47000 },
            percentages: { users: 96, storage: 95, apiCalls: 94 }
          }
        });
      });
      
      await page.click('[data-testid="usage-nav"]');
      
      // Should see warning messages
      await expect(page.locator('[data-testid="usage-warning"]')).toContainText('Approaching limit');
      
      // Should see upgrade suggestion
      await expect(page.locator('[data-testid="upgrade-suggestion"]')).toBeVisible();
      
      // Click upgrade suggestion
      await page.click('[data-testid="upgrade-now"]');
      
      // Should redirect to upgrade page
      await expect(page).toHaveURL(`${baseURL}/upgrade`);
    });
  });

  test.describe('Platform Administration', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as platform admin
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', platformAdmin.email);
      await page.fill('[data-testid="password"]', platformAdmin.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(`${baseURL}/admin`);
    });

    test('manage tenant licenses', async ({ page }) => {
      // Navigate to license management
      await page.click('[data-testid="licenses-nav"]');
      
      // Verify license overview
      await expect(page.locator('[data-testid="total-licenses"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-licenses"]')).toBeVisible();
      
      // Search for specific tenant
      await page.fill('[data-testid="license-search"]', 'Test Tenant');
      await page.keyboard.press('Enter');
      
      // Verify filtered results
      await expect(page.locator('[data-testid="license-list"]')).toContainText('Test Tenant');
      
      // View license details
      await page.click('[data-testid="view-license-details"]');
      
      // Verify license information
      await expect(page.locator('[data-testid="license-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="license-id"]')).toBeVisible();
      await expect(page.locator('[data-testid="license-status"]')).toContainText('Active');
    });

    test('monitor renewals pipeline', async ({ page }) => {
      // Navigate to renewals
      await page.click('[data-testid="renewals-nav"]');
      
      // Verify pipeline overview
      await expect(page.locator('[data-testid="pipeline-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
      
      // Filter by urgency
      await page.click('[data-testid="urgent-filter"]');
      
      // Should show only urgent renewals
      const urgentRenewals = page.locator('[data-testid="renewal-item"]');
      const count = await urgentRenewals.count();
      
      for (let i = 0; i < count; i++) {
        const item = urgentRenewals.nth(i);
        const daysText = await item.locator('[data-testid="days-to-expiry"]').textContent();
        const days = parseInt(daysText);
        expect(days).toBeLessThanOrEqual(30);
      }
      
      // Update renewal status
      if (count > 0) {
        await urgentRenewals.first().locator('[data-testid="status-select"]').selectOption('contact_made');
        await expect(page.locator('[data-testid="status-update-success"]')).toBeVisible();
      }
    });

    test('manage cron jobs and automation', async ({ page }) => {
      // Navigate to cron jobs management
      await page.click('[data-testid="automation-nav"]');
      
      // Verify job list
      await expect(page.locator('[data-testid="cron-jobs-list"]')).toBeVisible();
      
      // Check job statuses
      const jobs = page.locator('[data-testid="cron-job-item"]');
      const jobCount = await jobs.count();
      
      expect(jobCount).toBeGreaterThan(0);
      
      // Toggle job status
      const firstJob = jobs.first();
      const currentStatus = await firstJob.locator('[data-testid="job-status"]').textContent();
      
      await firstJob.locator('[data-testid="toggle-job"]').click();
      
      // Verify status changed
      const newStatus = await firstJob.locator('[data-testid="job-status"]').textContent();
      expect(newStatus).not.toBe(currentStatus);
      
      // View job logs
      await firstJob.locator('[data-testid="view-logs"]').click();
      await expect(page.locator('[data-testid="job-logs-modal"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('handle payment failures gracefully', async ({ page }) => {
      // Mock payment failure
      await page.addInitScript(() => {
        window.Stripe = () => ({
          elements: () => ({
            create: () => ({
              mount: () => {},
              on: () => {},
              destroy: () => {}
            })
          }),
          confirmCardPayment: () => Promise.resolve({
            error: {
              code: 'card_declined',
              message: 'Your card was declined.'
            }
          })
        });
      });
      
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
      
      // Try to add payment method
      await page.click('[data-testid="billing-nav"]');
      await page.click('[data-testid="payment-methods-tab"]');
      await page.click('[data-testid="add-payment-method"]');
      
      // Fill card details
      await page.fill('[data-testid="card-number"]', testCard.number);
      await page.fill('[data-testid="card-expiry"]', testCard.expiry);
      await page.fill('[data-testid="card-cvc"]', testCard.cvc);
      
      // Submit (should fail)
      await page.click('[data-testid="save-payment-method"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('card was declined');
    });

    test('handle API timeouts and network errors', async ({ page }) => {
      // Mock API timeout
      await page.route('**/api/billing/**', route => {
        setTimeout(() => route.abort(), 5000); // Timeout after 5s
      });
      
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="billing-nav"]');
      
      // Should show loading state then error
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 });
      
      // Retry button should work
      await page.click('[data-testid="retry-button"]');
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('handle expired sessions', async ({ page }) => {
      await page.goto(`${baseURL}/login`);
      await page.fill('[data-testid="email"]', testTenant.email);
      await page.fill('[data-testid="password"]', testTenant.password);
      await page.click('[data-testid="login-button"]');
      
      // Clear session storage to simulate expired session
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      });
      
      // Try to access protected page
      await page.click('[data-testid="billing-nav"]');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/.*login.*/);
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    
    test('page load performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${baseURL}/billing`);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        };
      });
      
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    });

    test('keyboard navigation accessibility', async ({ page }) => {
      await page.goto(`${baseURL}/billing`);
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with Enter
      await page.keyboard.press('Enter');
      
      // Check for ARIA labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });
  });
});