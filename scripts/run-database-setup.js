#!/usr/bin/env node
/**
 * Database Setup Script
 * Runs all SQL migrations and seeds the database
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    console.log(`   Server time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function runSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await pool.connect();
    
    // Execute the entire SQL file at once
    // PostgreSQL can handle multiple statements separated by semicolons
    // This preserves dollar-quoted strings and other complex SQL constructs
    try {
      await client.query(sql);
    } catch (err) {
      // For detailed error reporting, try to parse and execute statement by statement
      // but only if the full execution fails
      const errorMsg = err.message.toLowerCase();
      
      // If it's a syntax error or relation error, try statement-by-statement
      if (errorMsg.includes('syntax') || errorMsg.includes('relation') || errorMsg.includes('unterminated')) {
        // Simple statement splitter that respects dollar-quoted strings
        const statements = [];
        let currentStatement = '';
        let inDollarQuote = false;
        let dollarTag = '';
        let i = 0;
        
        while (i < sql.length) {
          const char = sql[i];
          const nextChar = sql[i + 1] || '';
          
          // Check for dollar quote start: $tag$ or $$
          if (char === '$' && !inDollarQuote) {
            let tagEnd = sql.indexOf('$', i + 1);
            if (tagEnd > i) {
              dollarTag = sql.substring(i, tagEnd + 1);
              inDollarQuote = true;
              currentStatement += dollarTag;
              i = tagEnd + 1;
              continue;
            }
          }
          
          // Check for dollar quote end
          if (inDollarQuote && sql.substring(i).startsWith(dollarTag)) {
            currentStatement += dollarTag;
            i += dollarTag.length;
            inDollarQuote = false;
            dollarTag = '';
            continue;
          }
          
          // Check for statement end (semicolon outside dollar quotes)
          if (char === ';' && !inDollarQuote) {
            const trimmed = currentStatement.trim();
            if (trimmed.length > 0 && !trimmed.startsWith('--')) {
              statements.push(trimmed);
            }
            currentStatement = '';
            i++;
            continue;
          }
          
          currentStatement += char;
          i++;
        }
        
        // Add last statement if any
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0 && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        
        // Execute statements one by one
        for (const statement of statements) {
          if (statement.length > 0) {
            try {
              await client.query(statement);
            } catch (stmtErr) {
              // Ignore "already exists" and "duplicate" errors
              const stmtErrorMsg = stmtErr.message.toLowerCase();
              if (!stmtErrorMsg.includes('already exists') && 
                  !stmtErrorMsg.includes('duplicate') &&
                  !stmtErrorMsg.includes('does not exist')) {
                // Only show non-trivial errors
                if (!stmtErrorMsg.includes('relation') || stmtErrorMsg.includes('syntax')) {
                  console.warn(`   ⚠️  Warning: ${stmtErr.message.split('\n')[0]}`);
                }
              }
            }
          }
        }
      } else {
        // For other errors, just warn
        console.warn(`   ⚠️  Warning: ${err.message.split('\n')[0]}`);
      }
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error(`   ❌ Error running ${filePath}:`, error.message);
    return false;
  }
}

async function createUpdateFunction() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    client.release();
    console.log('   ✅ Created update_updated_at_column function\n');
    return true;
  } catch (error) {
    // Function might already exist, which is fine
    if (error.message.includes('already exists')) {
      console.log('   ✅ update_updated_at_column function already exists\n');
      return true;
    }
    console.warn(`   ⚠️  Warning creating function: ${error.message.split('\n')[0]}\n`);
    return false;
  }
}

async function runMigrations() {
  console.log('\n📦 Running Database Migrations...\n');
  
  // Create the update function first
  await createUpdateFunction();
  
  const migrationFiles = [
    // Platform tables first (required for tenant isolation)
    'database/create-platform-tables.sql',
    'database/create-platform-access-tables.sql',
    'database/create-crm-tables.sql',
    'database/create-sales-tables.sql',
    'database/create-hr-tables.sql',
    'database/create-finance-tables.sql',
    'database/create-grc-tables.sql',
    'database/create-procurement-tables.sql',
    // Optional: Multi-tenant schema (subscription_plans, modules)
    'database/schema/03_multitenant_advanced.sql',
  ];
  
  for (const file of migrationFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   Running: ${file}`);
      const success = await runSQLFile(filePath);
      if (success) {
        console.log(`   ✅ ${path.basename(file)} completed\n`);
      } else {
        console.log(`   ⚠️  ${path.basename(file)} had warnings\n`);
      }
    } else {
      // Some files are optional (like schema files)
      if (file.includes('schema/')) {
        console.log(`   ⚠️  Optional file not found: ${file} (skipping)\n`);
      } else {
        console.log(`   ⚠️  File not found: ${file}\n`);
      }
    }
  }
}

async function runSeed() {
  console.log('\n🌱 Seeding Database...\n');
  
  try {
    console.log('   Running: npm run db:seed:all');
    // Use tsx instead of ts-node for better ES module support
    execSync('npm run db:seed:all', { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--loader ts-node/esm' }
    });
    console.log('   ✅ Database seeding completed\n');
  } catch (error) {
    console.error('   ❌ Database seeding failed:', error.message);
    console.log('   ⚠️  Continuing without seed data. You can run: npm run db:seed:all manually\n');
    // Don't throw - allow setup to continue
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying Database Tables...\n');
  
  const requiredTables = [
    'customers',
    'vendors',
    'inventory_items',
    'purchase_orders',
    'employees',
    'grc_controls',
    'grc_frameworks',
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
    
    console.log(`   Found ${existingTables.length} tables in database\n`);
    
    let allFound = true;
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (missing)`);
        allFound = false;
      }
    }
    
    return allFound;
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Database Setup');
  console.log('================================\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot proceed without database connection');
    console.error('Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
  
  // Run migrations
  await runMigrations();
  
  // Run seed
  await runSeed();
  
  // Verify
  const verified = await verifyTables();
  
  console.log('\n================================');
  if (verified) {
    console.log('✅ Database Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Test API endpoints');
    console.log('3. Verify data in Prisma Studio: npm run db:studio');
  } else {
    console.log('⚠️  Database Setup Completed with Warnings');
    console.log('Some tables may be missing. Check the errors above.');
  }
  console.log('================================\n');
  
  await pool.end();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
