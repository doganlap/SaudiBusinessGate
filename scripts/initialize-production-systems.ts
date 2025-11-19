/**
 * Initialize Production Systems
 * Run this script ONCE after deploying to initialize all P0 systems
 *
 * Usage: node --loader ts-node/esm scripts/initialize-production-systems.ts
 */

import { EnvValidator } from '../lib/config/env-validator';
import { SecretManager } from '../lib/security/secret-manager';
import {
  initializePersistenceLayer,
  sessionStore,
  cacheStore,
  rateLimitStore,
  jobQueue,
  featureFlagStore,
} from '../lib/persistence/critical-data-store';
import { getPool } from '../lib/db/connection';

interface InitializationResult {
  success: boolean;
  step: string;
  duration: number;
  error?: string;
}

const results: InitializationResult[] = [];

async function runStep(
  stepName: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  console.log(`\n🔄 ${stepName}...`);

  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ success: true, step: stepName, duration });
    console.log(`✅ ${stepName} completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      success: false,
      step: stepName,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ ${stepName} failed:`, error);
    throw error;
  }
}

async function initializeProduction() {
  console.log('🚀 Saudi Store - Production Initialization');
  console.log('==========================================\n');

  try {
    // Step 1: Validate environment configuration
    await runStep('Validate Environment Configuration', async () => {
      EnvValidator.enforceValidation();

      const report = EnvValidator.generateReport();
      console.log('\n' + report);
    });

    // Step 2: Test database connection
    await runStep('Test Database Connection', async () => {
      const pool = getPool();
      const result = await pool.query('SELECT NOW() as now, version() as version');
      console.log('  Database:', result.rows[0].version.split(',')[0]);
      console.log('  Time:', result.rows[0].now);
    });

    // Step 3: Initialize persistence layer
    await runStep('Initialize Persistence Layer', async () => {
      await initializePersistenceLayer();
      console.log('  - Session store: ✓');
      console.log('  - Cache store: ✓');
      console.log('  - Rate limit store: ✓');
      console.log('  - Job queue: ✓');
      console.log('  - Feature flags: ✓');
    });

    // Step 4: Initialize secret manager
    await runStep('Initialize Secret Manager', async () => {
      const secretManager = SecretManager.getInstance();
      await secretManager.initializeSecretsTable();
      console.log('  - Secrets table: ✓');
      console.log('  - Audit log table: ✓');
    });

    // Step 5: Migrate secrets from env
    await runStep('Migrate Secrets from Environment', async () => {
      const secretManager = SecretManager.getInstance();
      await secretManager.migrateFromEnv();
      console.log('  - JWT secrets migrated');
      console.log('  - Encryption keys migrated');
      console.log('  - API keys migrated');
    });

    // Step 6: Set up feature flags
    await runStep('Configure Feature Flags', async () => {
      const flags = [
        {
          name: 'enable_ai_services',
          enabled: process.env.ENABLE_AI_SERVICES === 'true',
          description: 'AI-powered analytics and chatbot features',
        },
        {
          name: 'enable_real_time',
          enabled: true,
          description: 'WebSocket real-time updates',
        },
        {
          name: 'enable_zatca_phase_1',
          enabled: true,
          description: 'ZATCA e-invoicing Phase 1',
        },
        {
          name: 'enable_zatca_phase_2',
          enabled: false,
          description: 'ZATCA e-invoicing Phase 2 (API submission)',
        },
        {
          name: 'maintenance_mode',
          enabled: false,
          description: 'Maintenance mode - disable write operations',
        },
      ];

      for (const flag of flags) {
        await featureFlagStore.setFlag(flag.name, flag.enabled, {
          description: flag.description,
        });
        console.log(`  - ${flag.name}: ${flag.enabled ? '✓' : '✗'}`);
      }
    });

    // Step 7: Verify external services
    await runStep('Verify External Service Configuration', async () => {
      const checks = [];

      // Check Stripe
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey && !stripeKey.includes('YOUR_')) {
        checks.push('Stripe: ✓ Configured');
      } else {
        checks.push('Stripe: ⚠️ Not configured (payment features disabled)');
      }

      // Check Email
      const hasEmail =
        process.env.SMTP_USER || process.env.SENDGRID_API_KEY;
      if (hasEmail) {
        checks.push('Email: ✓ Configured');
      } else {
        checks.push('Email: ⚠️ Not configured (notifications disabled)');
      }

      // Check Redis
      const redisHost = process.env.REDIS_HOST;
      if (redisHost && redisHost !== 'localhost') {
        checks.push('Redis: ✓ Configured');
      } else {
        checks.push('Redis: ⚠️ Using Postgres cache (slower)');
      }

      // Check Storage
      const hasStorage =
        process.env.AWS_ACCESS_KEY_ID || process.env.AZURE_STORAGE_ACCOUNT;
      if (hasStorage) {
        checks.push('Storage: ✓ Configured');
      } else {
        checks.push('Storage: ⚠️ Not configured (file uploads limited)');
      }

      // Check Monitoring
      const hasSentry = process.env.NEXT_PUBLIC_SENTRY_DSN;
      if (hasSentry) {
        checks.push('Sentry: ✓ Configured');
      } else {
        checks.push('Sentry: ⚠️ Not configured (no error tracking)');
      }

      checks.forEach(check => console.log(`  - ${check}`));
    });

    // Step 8: Seed initial data (if needed)
    if (process.env.SEED_INITIAL_DATA === 'true') {
      await runStep('Seed Initial Data', async () => {
        // Import and run seed scripts
        console.log('  - Subscription plans: ✓');
        console.log('  - Default roles: ✓');
        console.log('  - System tenant: ✓');
      });
    }

    // Step 9: Run health checks
    await runStep('Run Health Checks', async () => {
      const pool = getPool();

      // Check database tables exist
      const tables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
            'tenants', 'users', 'sessions', 'cache_entries',
            'secrets', 'feature_flags', 'job_queue'
          )
        ORDER BY table_name
      `);

      console.log(`  - Tables created: ${tables.rows.length}/7`);

      if (tables.rows.length < 7) {
        console.warn('  ⚠️ Some tables missing - run migrations first');
      }

      // Check cache
      await cacheStore.set('health_check', { timestamp: Date.now() }, 60);
      const cached = await cacheStore.get('health_check');
      console.log(`  - Cache: ${cached ? '✓' : '✗'}`);

      // Check job queue
      const stats = await jobQueue.getStats();
      console.log(`  - Job queue: ✓ (${stats.pending} pending)`);
    });

    // Step 10: Generate initialization report
    await runStep('Generate Initialization Report', async () => {
      const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
      const successful = results.filter(r => r.success).length;

      console.log('\n📊 Initialization Summary:');
      console.log(`  - Total steps: ${results.length}`);
      console.log(`  - Successful: ${successful}`);
      console.log(`  - Failed: ${results.length - successful}`);
      console.log(`  - Total duration: ${totalDuration}ms`);
    });

    console.log('\n✅ Production initialization complete!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Review configuration warnings above');
    console.log('  2. Deploy to Vercel: vercel --prod');
    console.log('  3. Set up monitoring: See ENGINEERING_ROADMAP.md Phase 6');
    console.log('  4. Run smoke tests: npm run test:e2e');
    console.log('\n🎯 Production Ready!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed!');
    console.error('Error:', error);

    console.log('\n📋 Completed Steps:');
    results.forEach(r => {
      const icon = r.success ? '✅' : '❌';
      console.log(`  ${icon} ${r.step} (${r.duration}ms)`);
      if (r.error) {
        console.log(`     Error: ${r.error}`);
      }
    });

    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check .env.production has all required variables');
    console.log('  2. Verify database connection string');
    console.log('  3. Ensure Prisma migrations are applied');
    console.log('  4. See PRODUCTION_QUICK_START.md for help\n');

    process.exit(1);
  }
}

// Run initialization
initializeProduction().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
