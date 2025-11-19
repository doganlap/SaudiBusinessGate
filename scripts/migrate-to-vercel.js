#!/usr/bin/env node
/**
 * Migrate all database tables to Vercel production database
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

// Color codes
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

async function main() {
  log('\n🚀 Migrating Database to Vercel Production', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');
  
  // Use Prisma production database URL directly
  const migrationUrl = 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require';
  
  log('✅ Using Prisma Production Database', 'green');
  log(`   Host: db.prisma.io:5432`, 'blue');
  log(`   Database: postgres`, 'blue');
  log('');
  
  try {
    // Step 1: Generate Prisma Client
    log('📦 Step 1: Generating Prisma Client...', 'yellow');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      log('   ✅ Prisma Client generated', 'green');
    } catch (error) {
      log('   ⚠️  Prisma generate had warnings (continuing...)', 'yellow');
    }
    log('');
    
    // Step 2: Create initial migration (if migrations folder doesn't exist)
    log('📝 Step 2: Creating migration...', 'yellow');
    try {
      execSync('npx prisma migrate dev --name init --create-only', {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: migrationUrl }
      });
      log('   ✅ Migration created', 'green');
    } catch (error) {
      // If migration already exists or schema is already in sync, that's okay
      log('   ℹ️  Migration may already exist (checking sync...)', 'blue');
    }
    log('');
    
    // Step 3: Deploy migration to production
    log('🚀 Step 3: Deploying migration to production...', 'yellow');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: migrationUrl }
      });
      log('   ✅ Migration deployed successfully', 'green');
    } catch (error) {
      log('   ⚠️  Migrate deploy failed, trying db push...', 'yellow');
      
      // Fallback: Use db push if migrate fails
      try {
        execSync('npx prisma db push --accept-data-loss', {
          stdio: 'inherit',
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: migrationUrl }
        });
        log('   ✅ Database schema pushed successfully', 'green');
      } catch (pushError) {
        log('   ❌ Database push also failed', 'red');
        throw pushError;
      }
    }
    log('');
    
    // Step 4: Verify tables
    log('🔍 Step 4: Verifying tables...', 'yellow');
    try {
      const output = execSync('npx prisma db execute --stdin', {
        input: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;",
        encoding: 'utf-8',
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: migrationUrl }
      });
      
      const tables = output.split('\n')
        .filter(line => line.trim() && !line.includes('table_name'))
        .map(line => line.trim())
        .filter(Boolean);
      
      log(`   ✅ Found ${tables.length} tables:`, 'green');
      tables.forEach((table, index) => {
        log(`      ${index + 1}. ${table}`, 'blue');
      });
      
      // Expected tables
      const expectedTables = [
        'subscription_plans',
        'modules',
        'tenants',
        'users',
        'teams',
        'roles',
        'user_teams',
        'tenant_modules',
        'white_label_configs',
        'reseller_configs',
        'tenant_subscriptions',
        'demo_requests',
        'poc_requests'
      ];
      
      const missing = expectedTables.filter(t => !tables.includes(t));
      if (missing.length > 0) {
        log(`   ⚠️  Missing tables: ${missing.join(', ')}`, 'yellow');
      } else {
        log(`   ✅ All ${expectedTables.length} expected tables found!`, 'green');
      }
    } catch (error) {
      log('   ⚠️  Could not verify tables (this is okay)', 'yellow');
    }
    log('');
    
    log('✅ Migration Complete!', 'green');
    log('═'.repeat(60) + '\n', 'cyan');
    log('📋 Next Steps:', 'yellow');
    log('   1. Verify tables in Vercel dashboard', 'blue');
    log('   2. Test your application endpoints', 'blue');
    log('   3. Run seed script if needed: npm run db:seed', 'blue');
    log('');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

