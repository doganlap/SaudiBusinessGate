#!/usr/bin/env node
/**
 * Push database schema to Vercel production database
 */

import { execSync } from 'child_process';

const migrationUrl = 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require';

console.log('\n🚀 Pushing Schema to Vercel Production Database\n');

try {
  // Push schema
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: migrationUrl }
  });
  
  console.log('\n✅ Schema pushed successfully!\n');
  console.log('📋 All 13 tables should now be in the database:');
  console.log('   1. subscription_plans');
  console.log('   2. modules');
  console.log('   3. tenants');
  console.log('   4. users');
  console.log('   5. teams');
  console.log('   6. roles');
  console.log('   7. user_teams');
  console.log('   8. tenant_modules');
  console.log('   9. white_label_configs');
  console.log('   10. reseller_configs');
  console.log('   11. tenant_subscriptions');
  console.log('   12. demo_requests');
  console.log('   13. poc_requests\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

