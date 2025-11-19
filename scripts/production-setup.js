/**
 * Production Setup Script
 * Comprehensive setup for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execute(command, description) {
  log(`\n📍 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} - Success`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Failed`, 'red');
    return false;
  }
}

function checkEnvFile() {
  log('\n🔍 Checking environment configuration...', 'bright');

  const envPath = path.join(__dirname, '..', '.env.production');
  if (!fs.existsSync(envPath)) {
    log('❌ .env.production not found!', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check for placeholder values
  const placeholders = [
    'sk_test_placeholder',
    'pk_test_placeholder',
    'whsec_placeholder',
    'your-webhook-secret-key',
    'your-license-encryption-key-change-in-production',
  ];

  const foundPlaceholders = placeholders.filter(p => envContent.includes(p));

  if (foundPlaceholders.length > 0) {
    log('\n⚠️  WARNING: Placeholder values found in .env.production:', 'yellow');
    foundPlaceholders.forEach(p => log(`   - ${p}`, 'yellow'));
    log('\n   Please update these values before deploying to production!', 'yellow');
  } else {
    log('✅ No placeholder values detected', 'green');
  }

  return true;
}

function checkDatabase() {
  log('\n🗄️  Checking database connection...', 'bright');

  try {
    execSync('node scripts/test-db-connection.js', { stdio: 'inherit' });
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed', 'red');
    log('   Run: npm run db:setup && npm run db:seed:all', 'yellow');
    return false;
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════╗', 'bright');
  log('║   🚀 Saudi Store - Production Setup          ║', 'bright');
  log('╚═══════════════════════════════════════════════╝', 'bright');

  const steps = [
    {
      name: 'Environment Check',
      fn: () => checkEnvFile(),
      required: true,
    },
    {
      name: 'Database Connection',
      fn: () => checkDatabase(),
      required: false,
    },
    {
      name: 'Generate Prisma Client',
      fn: () => execute('npx prisma generate', 'Generating Prisma Client'),
      required: true,
    },
    {
      name: 'Build Application',
      fn: () => execute('npm run build', 'Building Application'),
      required: true,
    },
  ];

  let failed = false;

  for (const step of steps) {
    const success = step.fn();
    if (!success && step.required) {
      failed = true;
      log(`\n❌ Required step "${step.name}" failed. Aborting.`, 'red');
      break;
    }
  }

  if (!failed) {
    log('\n╔═══════════════════════════════════════════════╗', 'green');
    log('║   ✅ Production Setup Complete!               ║', 'green');
    log('╚═══════════════════════════════════════════════╝', 'green');

    log('\n📋 Next Steps:', 'bright');
    log('   1. Review .env.production for any placeholder values', 'blue');
    log('   2. Set up database: npm run db:setup && npm run db:seed:all', 'blue');
    log('   3. Start production server: npm run start', 'blue');
    log('   4. Deploy to production: vercel --prod', 'blue');

    log('\n📊 Production Checklist:', 'bright');
    log('   [ ] Database seeded with real data', 'yellow');
    log('   [ ] Stripe production keys configured', 'yellow');
    log('   [ ] Email service configured', 'yellow');
    log('   [ ] Monitoring (Sentry) configured', 'yellow');
    log('   [ ] Domain & SSL configured', 'yellow');
    log('   [ ] Security review completed', 'yellow');
  } else {
    log('\n╔═══════════════════════════════════════════════╗', 'red');
    log('║   ❌ Production Setup Failed                  ║', 'red');
    log('╚═══════════════════════════════════════════════╝', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
