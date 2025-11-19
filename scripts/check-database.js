#!/usr/bin/env node
/**
 * Check Database Connection and Provide Setup Instructions
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(databaseURL) {
  const pool = new Pool({ connectionString: databaseURL });
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await pool.end();
    return { success: true, message: `Connected! Server time: ${result.rows[0].now}` };
  } catch (error) {
    await pool.end();
    return { success: false, message: error.message };
  }
}

async function main() {
  console.log('🔍 Database Connection Checker\n');
  console.log('================================\n');
  
  let databaseURL = process.env.DATABASE_URL;
  
  if (!databaseURL) {
    console.log('❌ DATABASE_URL not found in environment\n');
    console.log('Please set DATABASE_URL in your .env file\n');
    console.log('Example for local database:');
    console.log('DATABASE_URL=postgresql://postgres:password@localhost:5432/doganhubstore\n');
    process.exit(1);
  }
  
  console.log(`Testing connection to: ${databaseURL.replace(/:[^:@]+@/, ':****@')}\n`);
  
  const result = await testConnection(databaseURL);
  
  if (result.success) {
    console.log(`✅ ${result.message}\n`);
    console.log('✅ Database connection successful!\n');
    console.log('You can now run: npm run db:setup:full\n');
    rl.close();
    process.exit(0);
  } else {
    console.log(`❌ Connection failed: ${result.message}\n`);
    console.log('\n💡 Setup Options:\n');
    console.log('1. Use Local PostgreSQL:');
    console.log('   - Install PostgreSQL');
    console.log('   - Create database: CREATE DATABASE doganhubstore;');
    console.log('   - Update .env: DATABASE_URL=postgresql://postgres:password@localhost:5432/doganhubstore\n');
    console.log('2. Use Docker PostgreSQL:');
    console.log('   docker run --name saudi-store-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=doganhubstore -p 5432:5432 -d postgres:14\n');
    console.log('3. Use Remote Database:');
    console.log('   - Create database on Neon/Supabase/etc.');
    console.log('   - Update .env with new connection string\n');
    console.log('See QUICK_DATABASE_SETUP.md for detailed instructions\n');
    rl.close();
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});

