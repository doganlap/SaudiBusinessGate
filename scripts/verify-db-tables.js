#!/usr/bin/env node
/**
 * Verify all database tables are complete
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Expected tables from schema
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

async function verifyTables() {
  log('\n🔍 Verifying Database Tables', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');
  
  try {
    // Get all tables from database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tableNames = tables.map((t) => t.table_name);
    
    log(`📊 Found ${tableNames.length} tables in database`, 'blue');
    log('');
    
    // Check each expected table
    log('✅ Checking Expected Tables:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    let allComplete = true;
    const missing = [];
    const extra = [];
    
    for (const expected of expectedTables) {
      if (tableNames.includes(expected)) {
        log(`   ✅ ${expected}`, 'green');
      } else {
        log(`   ❌ ${expected} - MISSING`, 'red');
        missing.push(expected);
        allComplete = false;
      }
    }
    
    log('');
    
    // Check for extra tables
    for (const table of tableNames) {
      if (!expectedTables.includes(table)) {
        extra.push(table);
      }
    }
    
    if (extra.length > 0) {
      log(`📋 Extra Tables Found (${extra.length}):`, 'blue');
      extra.forEach(table => {
        log(`   ℹ️  ${table}`, 'blue');
      });
      log('');
    }
    
    // Verify table structure
    log('🔍 Verifying Table Structures:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    const structureChecks = [];
    
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        try {
          // Try to query the table to verify it's accessible
          const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}";`);
          const rowCount = (Array.isArray(count) ? count[0] : count)?.count || 0;
          
          structureChecks.push({
            table,
            status: 'ok',
            rows: rowCount
          });
          
          log(`   ✅ ${table} - ${rowCount} rows`, 'green');
        } catch (error) {
          const errorMessage = error?.message || String(error);
          structureChecks.push({
            table,
            status: 'error',
            error: errorMessage
          });
          
          log(`   ⚠️  ${table} - Error: ${errorMessage}`, 'yellow');
          allComplete = false;
        }
      }
    }
    
    log('');
    log('═'.repeat(60), 'cyan');
    
    if (allComplete && missing.length === 0) {
      log('✅ All Tables Complete!', 'green');
      log(`   ${expectedTables.length} tables verified`, 'green');
      log(`   ${tableNames.length} total tables in database`, 'blue');
    } else {
      log('⚠️  Some Tables Missing or Incomplete', 'yellow');
      if (missing.length > 0) {
        log(`   Missing: ${missing.length} tables`, 'red');
        missing.forEach(t => log(`      - ${t}`, 'red'));
      }
    }
    
    log('');
    
    // Summary
    log('📋 Summary:', 'cyan');
    log(`   Expected Tables: ${expectedTables.length}`, 'blue');
    log(`   Found Tables: ${tableNames.length}`, 'blue');
    log(`   Missing: ${missing.length}`, missing.length > 0 ? 'red' : 'green');
    log(`   Extra: ${extra.length}`, 'blue');
    log(`   Status: ${allComplete ? '✅ Complete' : '⚠️  Incomplete'}`, allComplete ? 'green' : 'yellow');
    log('');
    
    return {
      complete: allComplete,
      expected: expectedTables.length,
      found: tableNames.length,
      missing,
      extra,
      tables: tableNames
    };
    
  } catch (error) {
    const errorMessage = error?.message || String(error);
    log(`\n❌ Error: ${errorMessage}`, 'red');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables()
  .then((result) => {
    process.exit(result.complete ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

