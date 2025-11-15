/**
 * Test Database Seeding Script
 * Creates comprehensive test data for all test scenarios
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Create test tenants
    const tenants = await Promise.all([
      prisma.tenant.create({
        data: {
          id: 'tenant-acme-123',
          name: 'Acme Corporation',
          email: 'admin@acme.com',
          status: 'active',
          plan: 'professional',
          stripeCustomerId: 'cus_test_acme_123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      }),
      prisma.tenant.create({
        data: {
          id: 'tenant-beta-456',
          name: 'Beta LLC',
          email: 'admin@beta.com',
          status: 'active',
          plan: 'enterprise',
          stripeCustomerId: 'cus_test_beta_456',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date()
        }
      }),
      prisma.tenant.create({
        data: {
          id: 'tenant-gamma-789',
          name: 'Gamma Industries',
          email: 'admin@gamma.com',
          status: 'trial',
          plan: 'basic',
          stripeCustomerId: 'cus_test_gamma_789',
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Created test tenants');

    // Create test licenses
    const licenses = await Promise.all([
      prisma.license.create({
        data: {
          id: 'lic-acme-123',
          tenantId: 'tenant-acme-123',
          type: 'professional',
          status: 'active',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          maxUsers: 50,
          maxStorage: 200,
          features: ['advanced_analytics', 'api_access', 'custom_integrations'],
          usage: {
            currentUsers: 35,
            currentStorage: 180
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      }),
      prisma.license.create({
        data: {
          id: 'lic-beta-456',
          tenantId: 'tenant-beta-456',
          type: 'enterprise',
          status: 'active',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-01-31'),
          maxUsers: 200,
          maxStorage: 1000,
          features: ['advanced_analytics', 'api_access', 'custom_integrations', 'enterprise_sso', 'priority_support'],
          usage: {
            currentUsers: 75,
            currentStorage: 500
          },
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date()
        }
      }),
      prisma.license.create({
        data: {
          id: 'lic-gamma-789',
          tenantId: 'tenant-gamma-789',
          type: 'basic',
          status: 'trial',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-04-01'), // Expiring soon
          maxUsers: 10,
          maxStorage: 50,
          features: ['basic_analytics'],
          usage: {
            currentUsers: 5,
            currentStorage: 25
          },
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Created test licenses');

    // Create test users
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-acme-admin',
          name: 'John Smith',
          email: 'john@acme.com',
          password: hashedPassword,
          role: 'tenant_admin',
          tenantId: 'tenant-acme-123',
          emailVerified: new Date(),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          id: 'user-beta-admin',
          name: 'Sarah Johnson',
          email: 'sarah@beta.com',
          password: hashedPassword,
          role: 'tenant_admin',
          tenantId: 'tenant-beta-456',
          emailVerified: new Date(),
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          id: 'user-gamma-admin',
          name: 'Mike Wilson',
          email: 'mike@gamma.com',
          password: hashedPassword,
          role: 'tenant_admin',
          tenantId: 'tenant-gamma-789',
          emailVerified: new Date(),
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Created test users');

    // Create billing events
    await Promise.all([
      prisma.billingEvent.create({
        data: {
          tenantId: 'tenant-acme-123',
          eventType: 'subscription_created',
          data: {
            subscriptionId: 'sub_test_acme_123',
            planId: 'professional',
            amount: 299,
            status: 'active'
          },
          createdAt: new Date('2024-01-01')
        }
      }),
      prisma.billingEvent.create({
        data: {
          tenantId: 'tenant-acme-123',
          eventType: 'payment_succeeded',
          data: {
            invoiceId: 'in_test_acme_123',
            amount: 299,
            currency: 'usd'
          },
          createdAt: new Date('2024-02-01')
        }
      }),
      prisma.billingEvent.create({
        data: {
          tenantId: 'tenant-beta-456',
          eventType: 'subscription_created',
          data: {
            subscriptionId: 'sub_test_beta_456',
            planId: 'enterprise',
            amount: 999,
            status: 'active'
          },
          createdAt: new Date('2024-02-01')
        }
      })
    ]);

    console.log('✅ Created billing events');

    // Create license events
    await Promise.all([
      prisma.licenseEvent.create({
        data: {
          tenantId: 'tenant-acme-123',
          type: 'license_created',
          userId: 'user-acme-admin',
          timestamp: new Date('2024-01-01'),
          data: { licenseType: 'professional' }
        }
      }),
      prisma.licenseEvent.create({
        data: {
          tenantId: 'tenant-acme-123',
          type: 'user_added',
          userId: 'user-acme-123',
          timestamp: new Date('2024-01-15'),
          data: { currentUsers: 36 }
        }
      }),
      prisma.licenseEvent.create({
        data: {
          tenantId: 'tenant-beta-456',
          type: 'license_created',
          userId: 'user-beta-admin',
          timestamp: new Date('2024-02-01'),
          data: { licenseType: 'enterprise' }
        }
      })
    ]);

    console.log('✅ Created license events');

    // Create cron job logs
    await Promise.all([
      prisma.cronJobLog.create({
        data: {
          jobName: 'license_expiry_check',
          status: 'success',
          startTime: new Date('2024-03-01T06:00:00Z'),
          endTime: new Date('2024-03-01T06:00:30Z'),
          details: { processed: 150, warnings: 2 },
          createdAt: new Date('2024-03-01T06:00:30Z')
        }
      }),
      prisma.cronJobLog.create({
        data: {
          jobName: 'usage_tracking',
          status: 'success',
          startTime: new Date('2024-03-01T12:00:00Z'),
          endTime: new Date('2024-03-01T12:05:00Z'),
          details: { tenantsProcessed: 150, usageUpdated: 148 },
          createdAt: new Date('2024-03-01T12:05:00Z')
        }
      })
    ]);

    console.log('✅ Created cron job logs');

    console.log('🎉 Test data seeding completed successfully');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedTestData };