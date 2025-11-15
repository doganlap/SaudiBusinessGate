/**
 * Global Setup for Playwright Tests
 * Prepares test environment, database, and test data
 */

import { chromium } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup() {
  console.log('🚀 Setting up test environment...');

  try {
    // 1. Setup test database
    console.log('📊 Setting up test database...');
    await execAsync('npm run db:test:setup');
    
    // 2. Run database migrations
    console.log('🔄 Running database migrations...');
    await execAsync('npm run db:test:migrate');
    
    // 3. Seed test data
    console.log('🌱 Seeding test data...');
    await execAsync('npm run db:test:seed');
    
    // 4. Setup Stripe test fixtures
    console.log('💳 Setting up Stripe test fixtures...');
    await setupStripeTestFixtures();
    
    // 5. Setup test users and authentication
    console.log('👤 Setting up test users...');
    await setupTestUsers();
    
    console.log('✅ Test environment setup completed successfully');
    
  } catch (error) {
    console.error('❌ Test environment setup failed:', error);
    process.exit(1);
  }
}

async function setupStripeTestFixtures() {
  // Create test products and prices in Stripe
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    // Create test products
    const basicProduct = await stripe.products.create({
      id: 'prod_test_basic',
      name: 'Basic Plan (Test)',
      description: 'Test basic plan',
      metadata: { test: 'true' }
    });
    
    const proProduct = await stripe.products.create({
      id: 'prod_test_professional',
      name: 'Professional Plan (Test)',
      description: 'Test professional plan',
      metadata: { test: 'true' }
    });
    
    const entProduct = await stripe.products.create({
      id: 'prod_test_enterprise',
      name: 'Enterprise Plan (Test)',
      description: 'Test enterprise plan',
      metadata: { test: 'true' }
    });
    
    // Create test prices
    await stripe.prices.create({
      id: 'price_basic_monthly_test',
      product: basicProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { test: 'true' }
    });
    
    await stripe.prices.create({
      id: 'price_pro_monthly_test',
      product: proProduct.id,
      unit_amount: 29900, // $299.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { test: 'true' }
    });
    
    await stripe.prices.create({
      id: 'price_ent_monthly_test',
      product: entProduct.id,
      unit_amount: 99900, // $999.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { test: 'true' }
    });
    
    console.log('✅ Stripe test fixtures created');
    
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('ℹ️  Stripe test fixtures already exist');
    } else {
      throw error;
    }
  }
}

async function setupTestUsers() {
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  
  const prisma = new PrismaClient();
  
  try {
    // Create test tenant
    const testTenant = await prisma.tenant.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: 'tenant-test-123',
        name: 'Test Tenant Corp',
        email: 'test@example.com',
        status: 'active',
        plan: 'professional',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: 'user-test-123',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'tenant_admin',
        tenantId: testTenant.id,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Create platform admin
    const adminPassword = await bcrypt.hash('AdminPass123!', 12);
    
    await prisma.user.upsert({
      where: { email: 'admin@platform.com' },
      update: {},
      create: {
        id: 'user-admin-123',
        name: 'Platform Admin',
        email: 'admin@platform.com',
        password: adminPassword,
        role: 'platform_admin',
        tenantId: 'platform',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Create test license
    await prisma.license.upsert({
      where: { tenantId: testTenant.id },
      update: {},
      create: {
        id: 'lic-test-123',
        tenantId: testTenant.id,
        type: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUsers: 50,
        maxStorage: 200,
        features: ['advanced_analytics', 'api_access', 'custom_integrations'],
        usage: {
          currentUsers: 25,
          currentStorage: 150
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test users and data created');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;