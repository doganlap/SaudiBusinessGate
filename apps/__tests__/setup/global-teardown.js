/**
 * Global Teardown for Playwright Tests
 * Cleans up test environment and data
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  try {
    // 1. Clean up Stripe test data
    console.log('💳 Cleaning up Stripe test data...');
    await cleanupStripeTestData();
    
    // 2. Clean up test database
    console.log('📊 Cleaning up test database...');
    await execAsync('npm run db:test:cleanup');
    
    // 3. Clean up test files
    console.log('📁 Cleaning up test files...');
    await cleanupTestFiles();
    
    console.log('✅ Test environment cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error);
    // Don't exit with error code as this shouldn't fail the tests
  }
}

async function cleanupStripeTestData() {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    // Delete test products (this will also delete associated prices)
    const testProducts = ['prod_test_basic', 'prod_test_professional', 'prod_test_enterprise'];
    
    for (const productId of testProducts) {
      try {
        await stripe.products.del(productId);
        console.log(`✅ Deleted test product: ${productId}`);
      } catch (error) {
        if (error.code !== 'resource_missing') {
          console.warn(`⚠️  Could not delete product ${productId}:`, error.message);
        }
      }
    }
    
    // Clean up any test customers and subscriptions
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });
    
    for (const customer of customers.data) {
      if (customer.metadata?.test === 'true' || customer.email?.includes('test@')) {
        // Cancel any active subscriptions
        if (customer.subscriptions) {
          for (const subscription of customer.subscriptions.data) {
            if (subscription.status === 'active') {
              await stripe.subscriptions.cancel(subscription.id);
            }
          }
        }
        
        // Delete customer
        await stripe.customers.del(customer.id);
        console.log(`✅ Deleted test customer: ${customer.email}`);
      }
    }
    
  } catch (error) {
    console.warn('⚠️  Error cleaning up Stripe test data:', error.message);
  }
}

async function cleanupTestFiles() {
  try {
    // Remove test artifacts
    await execAsync('rm -rf test-results coverage playwright-report');
    console.log('✅ Test artifacts cleaned up');
  } catch (error) {
    // Ignore errors for cleanup
    console.log('ℹ️  No test artifacts to clean up');
  }
}

export default globalTeardown;