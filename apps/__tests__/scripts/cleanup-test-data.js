/**
 * Test Data Cleanup Script
 * Removes all test data and resets test environment
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Delete in reverse order to respect foreign key constraints
    
    console.log('Deleting cron job logs...');
    await prisma.cronJobLog.deleteMany({
      where: {
        OR: [
          { jobName: { contains: 'test' } },
          { details: { path: ['test'], equals: true } }
        ]
      }
    });

    console.log('Deleting license events...');
    await prisma.licenseEvent.deleteMany({
      where: {
        tenantId: {
          in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
        }
      }
    });

    console.log('Deleting billing events...');
    await prisma.billingEvent.deleteMany({
      where: {
        tenantId: {
          in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
        }
      }
    });

    console.log('Deleting payment methods...');
    await prisma.paymentMethod.deleteMany({
      where: {
        tenantId: {
          in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
        }
      }
    });

    console.log('Deleting subscriptions...');
    await prisma.subscription.deleteMany({
      where: {
        tenantId: {
          in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
        }
      }
    });

    console.log('Deleting user sessions...');
    await prisma.session.deleteMany({
      where: {
        user: {
          tenantId: {
            in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
          }
        }
      }
    });

    console.log('Deleting user accounts...');
    await prisma.account.deleteMany({
      where: {
        user: {
          tenantId: {
            in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
          }
        }
      }
    });

    console.log('Deleting users...');
    await prisma.user.deleteMany({
      where: {
        OR: [
          {
            tenantId: {
              in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
            }
          },
          {
            email: {
              in: ['test@example.com', 'admin@platform.com', 'john@acme.com', 'sarah@beta.com', 'mike@gamma.com']
            }
          }
        ]
      }
    });

    console.log('Deleting licenses...');
    await prisma.license.deleteMany({
      where: {
        tenantId: {
          in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
        }
      }
    });

    console.log('Deleting tenants...');
    await prisma.tenant.deleteMany({
      where: {
        OR: [
          {
            id: {
              in: ['tenant-acme-123', 'tenant-beta-456', 'tenant-gamma-789', 'tenant-test-123']
            }
          },
          {
            email: {
              in: ['test@example.com', 'admin@acme.com', 'admin@beta.com', 'admin@gamma.com']
            }
          }
        ]
      }
    });

    // Clean up any remaining test data based on patterns
    console.log('Cleaning up remaining test data...');
    
    // Delete any entities with test markers
    await prisma.tenant.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Test' } },
          { email: { contains: 'test' } },
          { stripeCustomerId: { contains: 'test' } }
        ]
      }
    });

    await prisma.billingEvent.deleteMany({
      where: {
        data: {
          path: ['subscriptionId'],
          string_contains: 'test'
        }
      }
    });

    // Reset auto-increment sequences if using PostgreSQL
    if (process.env.DATABASE_URL?.includes('postgresql')) {
      console.log('Resetting sequences...');
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Tenant"', 'id'), 1, false);`;
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);`;
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"License"', 'id'), 1, false);`;
    }

    console.log('✅ Test data cleanup completed successfully');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  cleanupTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { cleanupTestData };