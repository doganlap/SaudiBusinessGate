#!/usr/bin/env node
/**
 * Configure and Run Database Setup
 * Tries to configure database connection and run setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

// Default database configuration (from config/database.config.ts)
const defaultConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'doganhubstore',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

function buildDatabaseURL(config) {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

function updateEnvFile(databaseURL) {
  let envContent = '';
  
  // Try to read existing .env file
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  }
  
  // Check if DATABASE_URL already exists
  if (envContent.includes('DATABASE_URL=')) {
    // Update existing DATABASE_URL
    envContent = envContent.replace(
      /DATABASE_URL=.*/g,
      `DATABASE_URL=${databaseURL}`
    );
  } else {
    // Add DATABASE_URL
    envContent += `\nDATABASE_URL=${databaseURL}\n`;
  }
  
  // Write to .env file
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`✅ Updated .env file with DATABASE_URL`);
}

async function main() {
  console.log('🔧 Configuring Database Connection...\n');
  
  // Check if DATABASE_URL is already set
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is already set in environment');
    console.log(`   Using: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);
  } else {
    console.log('⚠️  DATABASE_URL not found in environment');
    console.log('   Using default local database configuration:\n');
    console.log(`   Host: ${defaultConfig.host}`);
    console.log(`   Port: ${defaultConfig.port}`);
    console.log(`   Database: ${defaultConfig.database}`);
    console.log(`   User: ${defaultConfig.user}\n`);
    
    const databaseURL = buildDatabaseURL(defaultConfig);
    updateEnvFile(databaseURL);
    
    // Update process.env for this session
    process.env.DATABASE_URL = databaseURL;
    
    console.log('💡 Tip: If this doesn\'t work, update .env file with your database credentials\n');
  }
  
  console.log('🚀 Running Database Setup...\n');
  console.log('================================\n');
  
  // Execute the setup script as a child process
  try {
    const { execSync } = await import('child_process');
    execSync('node scripts/run-database-setup.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('❌ Failed to run setup:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

