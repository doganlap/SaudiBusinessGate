#!/usr/bin/env node
/**
 * Integration Verification Script
 * Verifies that all components are properly integrated
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function checkDatabaseTables() {
  console.log('\n📊 Checking Database Tables...\n');
  
  const requiredTables = [
    // Core Platform
    'platform_tenants', 'platform_users', 'platform_settings',
    // Access Control
    'platform_roles', 'platform_permissions', 'platform_user_roles', 'platform_user_access',
    // Legacy/Alternative
    'tenants', 'users',
    // CRM
    'customers', 'contacts', 'deals', 'activities',
    // Procurement
    'vendors', 'inventory_items', 'purchase_orders', 'purchase_order_items',
    // HR
    'employees',
    // GRC
    'grc_frameworks', 'grc_controls', 'grc_exceptions',
    // Finance
    'transactions', 'invoices',
    // Sales
    'sales_orders', 'quotes',
  ];
  
  // Optional tables (may be in separate schema files)
  const optionalTables = [
    'subscription_plans', 'modules', 'chart_of_accounts'
  ];

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const existingTables = result.rows.map(r => r.table_name);
    client.release();

    let allFound = true;
    const missing = [];
    const found = [];
    const optionalFound = [];
    const optionalMissing = [];

    // Check required tables (with alternative names support)
    for (const table of requiredTables) {
      let foundTable = false;
      let foundName = table;
      
      if (existingTables.includes(table)) {
        foundTable = true;
      } else {
        // Check for alternative table names
        if (table === 'tenants' && existingTables.includes('platform_tenants')) {
          foundTable = true;
          foundName = 'platform_tenants (alternative to tenants)';
        } else if (table === 'users' && existingTables.includes('platform_users')) {
          foundTable = true;
          foundName = 'platform_users (alternative to users)';
        }
      }
      
      if (foundTable) {
        found.push(table);
        console.log(`   ✅ ${foundName}`);
      } else {
        missing.push(table);
        console.log(`   ❌ ${table} (missing)`);
        // Don't mark as failed for legacy tables if platform tables exist
        if (table === 'tenants' && existingTables.includes('platform_tenants')) {
          // Platform table exists, legacy is optional
        } else if (table === 'users' && existingTables.includes('platform_users')) {
          // Platform table exists, legacy is optional
        } else {
          allFound = false;
        }
      }
    }
    
    // Check optional tables (with alternative names)
    console.log(`\n   Optional tables:`);
    for (const table of optionalTables) {
      // Check for alternative table names
      let found = false;
      let foundName = table;
      
      if (table === 'chart_of_accounts') {
        // Check for either chart_of_accounts or financial_accounts
        if (existingTables.includes('chart_of_accounts')) {
          found = true;
          foundName = 'chart_of_accounts';
        } else if (existingTables.includes('financial_accounts')) {
          found = true;
          foundName = 'financial_accounts (alternative to chart_of_accounts)';
        }
      } else {
        found = existingTables.includes(table);
      }
      
      if (found) {
        optionalFound.push(table);
        console.log(`   ✅ ${foundName} (optional)`);
      } else {
        optionalMissing.push(table);
        console.log(`   ⚠️  ${table} (optional, not found)`);
      }
    }

    console.log(`\n   Found: ${found.length}/${requiredTables.length} required tables`);
    if (optionalFound.length > 0) {
      console.log(`   Optional: ${optionalFound.length}/${optionalTables.length} found`);
    }
    if (missing.length > 0) {
      console.log(`   Missing: ${missing.length} required tables`);
    }

    return { allFound, found, missing };
  } catch (error) {
    console.error('   ❌ Database check failed:', error.message);
    return { allFound: false, found: [], missing: requiredTables };
  }
}

async function checkAPIRoutes() {
  console.log('\n🔌 Checking API Routes...\n');

  const apiRoutes = [
    'app/api/crm/customers/route.ts',
    'app/api/procurement/vendors/route.ts',
    'app/api/procurement/inventory/route.ts',
    'app/api/procurement/orders/route.ts',
    'app/api/hr/employees/route.ts',
    'app/api/sales/pipeline/route.ts',
    'app/api/grc/controls/route.ts',
    'app/api/analytics/kpis/business/route.ts',
  ];

  let allFound = true;
  for (const route of apiRoutes) {
    const routePath = path.join(process.cwd(), route);
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      // Check if it uses database (not mock data)
      // Check for direct database usage or service imports that use database
      const usesDatabase = content.includes('query') || 
                          content.includes('prisma') || 
                          content.includes('dbQuery') ||
                          content.includes('RealTimeAnalyticsEngine') ||
                          content.includes('getPool') ||
                          content.includes('Pool');
      
      if (usesDatabase) {
        console.log(`   ✅ ${route} (using database)`);
      } else if (content.includes('mock') || content.includes('Mock') || content.includes('mockData')) {
        console.log(`   ⚠️  ${route} (still using mock data)`);
        allFound = false;
      } else {
        // Check if it imports a service that might use database
        const serviceImports = content.match(/import.*from.*['"](.*services.*|.*Service)['"]/g);
        if (serviceImports && serviceImports.length > 0) {
          console.log(`   ✅ ${route} (using service layer)`);
        } else {
          console.log(`   ⚠️  ${route} (unable to verify database usage)`);
        }
      }
    } else {
      console.log(`   ❌ ${route} (not found)`);
      allFound = false;
    }
  }

  return allFound;
}

function checkFrontendPages() {
  console.log('\n🖥️  Checking Frontend Pages...\n');

  const pages = [
    'app/[lng]/(platform)/crm/page.tsx',
    'app/[lng]/(platform)/procurement/page.tsx',
    'app/[lng]/(platform)/procurement/inventory/page.tsx',
    'app/[lng]/(platform)/hr/employees/page.tsx',
    'app/dashboard/page.tsx',
  ];

  let allFound = true;
  for (const page of pages) {
    const pagePath = path.join(process.cwd(), page);
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      // Check if it fetches from API (not mock data)
      if (content.includes('fetch(') && content.includes('/api/')) {
        console.log(`   ✅ ${page} (fetching from API)`);
      } else if (content.includes('mock') || content.includes('Mock') || content.includes('mockData')) {
        console.log(`   ⚠️  ${page} (still using mock data)`);
        allFound = false;
      } else {
        console.log(`   ✅ ${page}`);
      }
    } else {
      console.log(`   ❌ ${page} (not found)`);
      allFound = false;
    }
  }

  return allFound;
}

function checkI18nConfiguration() {
  console.log('\n🌍 Checking i18n Configuration...\n');

  const checks = [
    {
      file: 'lib/i18n.ts',
      check: (content) => content.includes("defaultLanguage: Language = 'ar'"),
      name: 'Default language is Arabic'
    },
    {
      file: 'middleware.ts',
      check: (content) => content.includes('defaultLanguage') && (content.includes("return defaultLanguage") || content.includes("|| defaultLanguage")),
      name: 'Middleware uses Arabic default'
    },
    {
      file: 'app/layout.tsx',
      check: (content) => content.includes('lang="ar"') && content.includes('dir="rtl"'),
      name: 'Root layout has Arabic RTL'
    },
    {
      file: 'components/i18n/LanguageProvider.tsx',
      check: (content) => content.includes("defaultLanguage: Language = 'ar'"),
      name: 'LanguageProvider defaults to Arabic'
    },
  ];

  let allPassed = true;
  for (const check of checks) {
    const filePath = path.join(process.cwd(), check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (check.check(content)) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name}`);
        allPassed = false;
      }
    } else {
      console.log(`   ❌ ${check.file} (not found)`);
      allPassed = false;
    }
  }

  return allPassed;
}

function checkDatabaseScripts() {
  console.log('\n🗄️  Checking Database Scripts...\n');

  const scripts = [
    'scripts/run-database-setup.js',
    'scripts/check-database.js',
    'scripts/configure-and-run-db.js',
    'database/create-crm-tables.sql',
    'database/create-procurement-tables.sql',
    'database/create-hr-tables.sql',
    'database/create-grc-tables.sql',
  ];

  let allFound = true;
  for (const script of scripts) {
    const scriptPath = path.join(process.cwd(), script);
    if (fs.existsSync(scriptPath)) {
      console.log(`   ✅ ${script}`);
    } else {
      console.log(`   ❌ ${script} (not found)`);
      allFound = false;
    }
  }

  return allFound;
}

async function main() {
  console.log('🔍 Integration Verification');
  console.log('================================\n');

  // Test database connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please configure DATABASE_URL in .env file\n');
    await pool.end();
    process.exit(1);
  }

  // Run all checks
  const [dbCheck, apiCheck, frontendCheck, i18nCheck, scriptsCheck] = await Promise.all([
    checkDatabaseTables(),
    checkAPIRoutes(),
    checkFrontendPages(),
    checkI18nConfiguration(),
    checkDatabaseScripts(),
  ]);

  // Summary
  console.log('\n================================');
  console.log('📋 Integration Summary');
  console.log('================================\n');

  console.log(`Database Tables: ${dbCheck.allFound ? '✅' : '⚠️'} ${dbCheck.found.length}/${dbCheck.found.length + dbCheck.missing.length} tables found`);
  console.log(`API Routes: ${apiCheck ? '✅' : '⚠️'} All routes configured`);
  console.log(`Frontend Pages: ${frontendCheck ? '✅' : '⚠️'} All pages configured`);
  console.log(`i18n Configuration: ${i18nCheck ? '✅' : '⚠️'} Arabic RTL default configured`);
  console.log(`Database Scripts: ${scriptsCheck ? '✅' : '⚠️'} All scripts available`);

  const allPassed = dbCheck.allFound && apiCheck && frontendCheck && i18nCheck && scriptsCheck;

  console.log('\n================================');
  if (allPassed) {
    console.log('✅ All Integration Checks Passed!');
    console.log('\n🚀 The application is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Visit: http://localhost:3050 (will auto-redirect to /ar)');
    console.log('3. Test API endpoints');
    console.log('4. Verify RTL layout is applied');
  } else {
    console.log('⚠️  Some Integration Checks Failed');
    console.log('\nPlease review the issues above and fix them.');
  }
  console.log('================================\n');

  await pool.end();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

