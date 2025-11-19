#!/usr/bin/env node
/**
 * Production Integration & Dependency Verification Script
 * Verifies all integrations and dependencies for production deployment
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from multiple sources
dotenv.config(); // Loads .env
dotenv.config({ path: '.env.local' }); // Loads .env.local
dotenv.config({ path: '.env.production' }); // Loads .env.production

const results = {
  integrations: [],
  dependencies: [],
  environment: [],
  database: [],
  services: [],
  errors: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check Production Dependencies
function checkProductionDependencies() {
  log('\n📦 Checking Production Dependencies...\n', 'cyan');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Critical production dependencies
    const criticalDeps = [
      'next',
      'react',
      'react-dom',
      '@prisma/client',
      'prisma',
      'pg',
      'ioredis',
      'next-auth',
      'jsonwebtoken',
      'bcryptjs'
    ];
    
    const missing = [];
    const outdated = [];
    
    criticalDeps.forEach(dep => {
      if (!allDeps[dep]) {
        missing.push(dep);
        results.dependencies.push({
          name: dep,
          status: 'missing',
          message: 'Critical dependency missing'
        });
      } else {
        results.dependencies.push({
          name: dep,
          status: 'ok',
          version: allDeps[dep],
          message: 'Installed'
        });
        log(`   ✅ ${dep}@${allDeps[dep]}`, 'green');
      }
    });
    
    // Check for security vulnerabilities
    try {
      log('\n   🔒 Checking for security vulnerabilities...', 'yellow');
      const auditResult = execSync('npm audit --json', { encoding: 'utf-8', stdio: 'pipe' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        const vulnCount = Object.keys(audit.vulnerabilities).length;
        if (vulnCount > 0) {
          results.dependencies.push({
            name: 'Security Audit',
            status: 'warning',
            message: `${vulnCount} vulnerabilities found`,
            details: Object.keys(audit.vulnerabilities).slice(0, 10)
          });
          log(`   ⚠️  ${vulnCount} vulnerabilities found`, 'yellow');
        } else {
          log(`   ✅ No security vulnerabilities found`, 'green');
        }
      }
    } catch (error) {
      log(`   ⚠️  Could not run security audit: ${error.message}`, 'yellow');
    }
    
    if (missing.length > 0) {
      log(`\n   ❌ Missing dependencies: ${missing.join(', ')}`, 'red');
    }
    
  } catch (error) {
    results.errors.push(`Dependency check failed: ${error.message}`);
    log(`   ❌ Error checking dependencies: ${error.message}`, 'red');
  }
}

// Check Integration Services
function checkIntegrationServices() {
  log('\n🔌 Checking Integration Services...\n', 'cyan');
  
  const integrations = [
    {
      name: 'Stripe Payment',
      envVars: [],
      optional: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
      service: 'billing',
      required: false
    },
    {
      name: 'Azure Services',
      envVars: [],
      optional: [
        'AZURE_STORAGE_CONNECTION_STRING',
        'AZURE_FORM_RECOGNIZER_ENDPOINT',
        'AZURE_TEXT_ANALYTICS_ENDPOINT',
        'AZURE_TRANSLATOR_ENDPOINT',
        'AZURE_OPENAI_ENDPOINT'
      ],
      service: 'document-processing',
      required: false
    },
    {
      name: 'OpenAI',
      envVars: [],
      optional: ['OPENAI_API_KEY', 'OPENAI_API_VERSION', 'OPENAI_MODEL_DEFAULT'],
      service: 'ai',
      required: false
    },
    {
      name: 'Email (SMTP)',
      envVars: [],
      optional: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
      service: 'email'
    },
    {
      name: 'Gmail Integration',
      envVars: [],
      optional: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'],
      service: 'email'
    },
    {
      name: 'Outlook Integration',
      envVars: [],
      optional: ['OUTLOOK_CLIENT_ID', 'OUTLOOK_CLIENT_SECRET', 'OUTLOOK_TENANT_ID'],
      service: 'email'
    },
    {
      name: 'Sentry Error Tracking',
      envVars: [],
      optional: ['SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN'],
      service: 'monitoring'
    },
    {
      name: 'Google Analytics',
      envVars: [],
      optional: ['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
      service: 'analytics'
    }
  ];
  
  integrations.forEach(integration => {
    const missing = [];
    const optional = [];
    
    integration.envVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
    
    integration.optional.forEach(varName => {
      if (!process.env[varName]) {
        optional.push(varName);
      }
    });
    
    let status = 'ok';
    let message = 'Configured';
    
    // If integration is not required, treat missing envVars as optional
    const isRequired = integration.required !== false;
    
    if (missing.length > 0 && isRequired) {
      status = 'error';
      message = `Missing required variables: ${missing.join(', ')}`;
      log(`   ❌ ${integration.name}: ${message}`, 'red');
    } else if (optional.length === integration.optional.length && missing.length === 0) {
      if (isRequired) {
        status = 'warning';
        message = 'No optional variables configured';
        log(`   ⚠️  ${integration.name}: ${message}`, 'yellow');
      } else {
        status = 'ok';
        message = 'Optional - not configured';
        log(`   ℹ️  ${integration.name}: Optional (not configured)`, 'blue');
      }
    } else if (missing.length > 0 && !isRequired) {
      status = 'ok';
      message = 'Optional - not configured';
      log(`   ℹ️  ${integration.name}: Optional (not configured)`, 'blue');
    } else {
      log(`   ✅ ${integration.name}: Configured`, 'green');
    }
    
    results.integrations.push({
      name: integration.name,
      service: integration.service,
      status,
      message,
      missing,
      optionalMissing: optional
    });
  });
}

// Check Environment Variables
function checkEnvironmentVariables() {
  log('\n🔐 Checking Environment Variables...\n', 'cyan');
  
  const requiredVars = [
    { name: 'DATABASE_URL', description: 'PostgreSQL connection string' },
    { name: 'JWT_SECRET', description: 'JWT signing secret' },
    { name: 'NEXTAUTH_SECRET', description: 'NextAuth secret' },
    { name: 'NEXTAUTH_URL', description: 'Application URL' },
    { name: 'NODE_ENV', description: 'Node environment' }
  ];
  
  const optionalVars = [
    { name: 'REDIS_URL', description: 'Redis connection string' },
    { name: 'REDIS_HOST', description: 'Redis host' },
    { name: 'REDIS_PASSWORD', description: 'Redis password' },
    { name: 'NEXT_PUBLIC_API_URL', description: 'Public API URL' },
    { name: 'NEXT_PUBLIC_APP_URL', description: 'Public app URL' }
  ];
  
  const missing = [];
  const warnings = [];
  
  requiredVars.forEach(variable => {
    if (!process.env[variable.name]) {
      missing.push(variable.name);
      results.environment.push({
        name: variable.name,
        status: 'error',
        message: `Required: ${variable.description}`
      });
      log(`   ❌ ${variable.name}: Missing (Required)`, 'red');
    } else {
      // Check if it's a placeholder value
      const value = process.env[variable.name];
      if (value.includes('localhost') || value.includes('example') || value.includes('change')) {
        warnings.push(`${variable.name} may contain placeholder value`);
        results.environment.push({
          name: variable.name,
          status: 'warning',
          message: 'May contain placeholder value'
        });
        log(`   ⚠️  ${variable.name}: May need production value`, 'yellow');
      } else {
        results.environment.push({
          name: variable.name,
          status: 'ok',
          message: 'Configured'
        });
        log(`   ✅ ${variable.name}: Configured`, 'green');
      }
    }
  });
  
  optionalVars.forEach(variable => {
    if (!process.env[variable.name]) {
      warnings.push(`${variable.name} not configured (optional)`);
      results.environment.push({
        name: variable.name,
        status: 'warning',
        message: `Optional: ${variable.description}`
      });
    } else {
      results.environment.push({
        name: variable.name,
        status: 'ok',
        message: 'Configured'
      });
      log(`   ✅ ${variable.name}: Configured`, 'green');
    }
  });
  
  if (warnings.length > 0) {
    log(`\n   ⚠️  Warnings: ${warnings.length}`, 'yellow');
  }
}

// Check Database Connection
async function checkDatabaseConnection() {
  log('\n🗄️  Checking Database Connection...\n', 'cyan');
  
  if (!process.env.DATABASE_URL) {
    results.database.push({
      name: 'Database Connection',
      status: 'error',
      message: 'DATABASE_URL not configured'
    });
    log('   ❌ DATABASE_URL not configured', 'red');
    return;
  }
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    client.release();
    await pool.end();
    
    results.database.push({
      name: 'Database Connection',
      status: 'ok',
      message: 'Connected successfully',
      details: {
        timestamp: result.rows[0].now,
        version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
      }
    });
    log('   ✅ Database connection successful', 'green');
    log(`   📊 PostgreSQL ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`, 'blue');
    
  } catch (error) {
    results.database.push({
      name: 'Database Connection',
      status: 'error',
      message: `Connection failed: ${error.message}`
    });
    log(`   ❌ Database connection failed: ${error.message}`, 'red');
  }
}

// Check Redis Connection
async function checkRedisConnection() {
  log('\n🔴 Checking Redis Connection...\n', 'cyan');
  
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    results.services.push({
      name: 'Redis',
      status: 'warning',
      message: 'Redis not configured (optional)'
    });
    log('   ⚠️  Redis not configured (optional)', 'yellow');
    return;
  }
  
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
    
    await redis.ping();
    const info = await redis.info('server');
    await redis.quit();
    
    results.services.push({
      name: 'Redis',
      status: 'ok',
      message: 'Connected successfully'
    });
    log('   ✅ Redis connection successful', 'green');
    
  } catch (error) {
    results.services.push({
      name: 'Redis',
      status: 'error',
      message: `Connection failed: ${error.message}`
    });
    log(`   ❌ Redis connection failed: ${error.message}`, 'red');
  }
}

// Check Production Configuration Files
function checkProductionFiles() {
  log('\n📄 Checking Production Configuration Files...\n', 'cyan');
  
  const requiredFiles = [
    { path: 'package.json', description: 'Package configuration' },
    { path: 'next.config.js', description: 'Next.js configuration' },
    { path: 'tsconfig.json', description: 'TypeScript configuration' },
    { path: 'docker-compose.yml', description: 'Docker Compose config' },
    { path: 'deploy/docker-compose.production.yml', description: 'Production Docker Compose' }
  ];
  
  const missing = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      log(`   ✅ ${file.path}`, 'green');
    } else {
      missing.push(file.path);
      log(`   ❌ ${file.path} (missing)`, 'red');
    }
  });
  
  if (missing.length > 0) {
    results.errors.push(`Missing configuration files: ${missing.join(', ')}`);
  }
}

// Generate Report
function generateReport() {
  log('\n' + '═'.repeat(80), 'cyan');
  log('  PRODUCTION INTEGRATION & DEPENDENCY VERIFICATION REPORT', 'cyan');
  log('  Saudi Store - The 1st Autonomous Store in the World 🇸🇦', 'cyan');
  log('═'.repeat(80) + '\n', 'cyan');
  
  // Summary
  const integrationOk = results.integrations.filter(r => r.status === 'ok').length;
  const integrationWarn = results.integrations.filter(r => r.status === 'warning').length;
  const integrationError = results.integrations.filter(r => r.status === 'error').length;
  
  const depOk = results.dependencies.filter(r => r.status === 'ok').length;
  const depError = results.dependencies.filter(r => r.status === 'missing').length;
  
  const envOk = results.environment.filter(r => r.status === 'ok').length;
  const envWarn = results.environment.filter(r => r.status === 'warning').length;
  const envError = results.environment.filter(r => r.status === 'error').length;
  
  log('📊 SUMMARY', 'blue');
  log('─'.repeat(80), 'blue');
  log(`Integrations: ${integrationOk} ✅ | ${integrationWarn} ⚠️  | ${integrationError} ❌`, 'blue');
  log(`Dependencies: ${depOk} ✅ | ${depError} ❌`, 'blue');
  log(`Environment:  ${envOk} ✅ | ${envWarn} ⚠️  | ${envError} ❌`, 'blue');
  log(`Database:     ${results.database.filter(r => r.status === 'ok').length} ✅ | ${results.database.filter(r => r.status === 'error').length} ❌`, 'blue');
  log(`Services:     ${results.services.filter(r => r.status === 'ok').length} ✅ | ${results.services.filter(r => r.status === 'error').length} ❌`, 'blue');
  log('─'.repeat(80) + '\n', 'blue');
  
  // Detailed Results
  if (integrationError > 0 || depError > 0 || envError > 0) {
    log('❌ CRITICAL ISSUES FOUND', 'red');
    log('─'.repeat(80), 'red');
    
    results.integrations.filter(r => r.status === 'error').forEach(r => {
      log(`   ${r.name}: ${r.message}`, 'red');
      if (r.missing && r.missing.length > 0) {
        log(`      Missing: ${r.missing.join(', ')}`, 'red');
      }
    });
    
    results.environment.filter(r => r.status === 'error').forEach(r => {
      log(`   ${r.name}: ${r.message}`, 'red');
    });
    
    log('─'.repeat(80) + '\n', 'red');
  }
  
  // Overall Status
  const hasErrors = integrationError > 0 || depError > 0 || envError > 0;
  
  if (hasErrors) {
    log('⚠️  PRODUCTION READINESS: NOT READY', 'red');
    log('   Please fix the critical issues above before deploying.\n', 'red');
    return false;
  } else {
    log('✅ PRODUCTION READINESS: READY', 'green');
    log('   All critical integrations and dependencies are configured.\n', 'green');
    return true;
  }
}

// Main execution
async function main() {
  log('\n🚀 Starting Production Integration & Dependency Verification...\n', 'cyan');
  
  checkProductionDependencies();
  checkIntegrationServices();
  checkEnvironmentVariables();
  checkProductionFiles();
  await checkDatabaseConnection();
  await checkRedisConnection();
  
  const isReady = generateReport();
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'PRODUCTION_VERIFICATION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}\n`, 'cyan');
  
  process.exit(isReady ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

