#!/usr/bin/env node
/**
 * Diagnose 500 Internal Server Error
 * Checks common causes of 500 errors
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('🔍 Diagnosing 500 Internal Server Error');
console.log('================================\n');

// Check 1: Environment variables
console.log('1️⃣ Checking Environment Variables...\n');
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log('❌ DATABASE_URL not set\n');
} else {
  console.log('✅ DATABASE_URL is set\n');
}

// Check 2: Database connection
console.log('2️⃣ Testing Database Connection...\n');
if (DATABASE_URL) {
  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    await pool.end();
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('   This could cause 500 errors in API routes\n');
  }
}

// Check 3: Required files
console.log('3️⃣ Checking Required Files...\n');
const requiredFiles = [
  'app/layout.tsx',
  'app/api/health/simple/route.ts',
  'lib/db/connection.ts',
  'next.config.js',
  'package.json'
];

for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
}

console.log('\n4️⃣ Checking for Common Issues...\n');

// Check for .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next build directory exists');
  console.log('   💡 Try deleting it and restarting: Remove-Item -Recurse -Force .next\n');
} else {
  console.log('⚠️  .next directory not found');
  console.log('   Server may still be compiling...\n');
}

console.log('================================');
console.log('💡 Recommendations:');
console.log('================================\n');
console.log('1. Check the terminal where "npm run dev" is running');
console.log('   Look for specific error messages\n');
console.log('2. Try clearing the cache:');
console.log('   Remove-Item -Recurse -Force .next\n');
console.log('3. Restart the server:');
console.log('   Stop (Ctrl+C) and run: npm run dev\n');
console.log('4. Check for missing dependencies:');
console.log('   npm install\n');

