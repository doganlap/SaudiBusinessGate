#!/usr/bin/env node
/**
 * Add all environment variables to Vercel
 * This script helps you add all required environment variables to your Vercel project
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Read environment variables from .env.production
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env.production');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    log(`✅ Found .env.production`, 'green');
  } else if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf-8');
    log(`✅ Found .env.local`, 'green');
  } else {
    log(`⚠️  No .env file found`, 'yellow');
    return {};
  }
  
  const envVars = {};
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  }
  
  return envVars;
}

// Get Vercel project URL
function getVercelUrl() {
  try {
    const result = execSync('vercel ls --json', { encoding: 'utf-8', stdio: 'pipe' });
    const deployments = JSON.parse(result);
    if (deployments && deployments.length > 0) {
      return deployments[0].url;
    }
  } catch (error) {
    // Ignore
  }
  return null;
}

// Main function
function main() {
  log('\n🔐 Adding Environment Variables to Vercel', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');
  
  // Read environment variables
  const envVars = readEnvFile();
  
  // Get Vercel URL
  const vercelUrl = getVercelUrl();
  
  // Required variables
  const requiredVars = {
    // Authentication
    JWT_SECRET: envVars.JWT_SECRET || 'fe9fd0e777a2e0d7560d38f99e7711551f45c071954765f194ae3c246a6aaee5',
    NEXTAUTH_SECRET: envVars.NEXTAUTH_SECRET || 'yI0dfqt0DU6gs5bpSMesQOhzGjEFsDExG/mHx31g4tI=',
    NEXTAUTH_URL: vercelUrl ? `https://${vercelUrl}` : envVars.NEXTAUTH_URL || 'https://your-project.vercel.app',
    
    // Application
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_URL: vercelUrl ? `https://${vercelUrl}` : envVars.NEXT_PUBLIC_APP_URL || 'https://your-project.vercel.app',
    NEXT_PUBLIC_API_URL: vercelUrl ? `https://${vercelUrl}/api` : envVars.NEXT_PUBLIC_API_URL || 'https://your-project.vercel.app/api',
    
    // Database (already in vercel.json, but listed for reference)
    DATABASE_URL: envVars.DATABASE_URL || 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require',
    POSTGRES_URL: envVars.POSTGRES_URL || 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require',
    PRISMA_DATABASE_URL: envVars.PRISMA_DATABASE_URL || 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aRGJfWVhFNUhkS29ZNVZheUIzdE4iLCJhcGlfa2V5IjoiMDFLQTI2MDZLUDJDVkpYU1laWFhTVlFCWFAiLCJ0ZW5hbnRfaWQiOiJmOWIwMWIwMTZmNjA2NWUxZjlkNjI3NzZhOTVlMDNjY2IzNzczZTM1ZjJiYTRkNWVjNmY2YmJjMWFmYWEyZTQ2IiwiaW50ZXJuYWxfc2VjcmV0IjoiOWU1MWIyYjQtNzU3OS00ZmZhLTllMWEtYmFiYTVlMTQxYjdmIn0.4ZQEin9USH0TBlfgFmW_DVhaBy_fOTzlhsUJGn1SdSE',
  };
  
  log('📋 Environment Variables to Add:', 'yellow');
  log('─'.repeat(60), 'yellow');
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY') 
      ? value.substring(0, 20) + '...' 
      : value;
    log(`${key}=${displayValue}`, 'blue');
  });
  
  log('─'.repeat(60) + '\n', 'yellow');
  
  log('📝 Instructions:', 'cyan');
  log('1. Go to: https://vercel.com/dashboard', 'blue');
  log('2. Select: donganksa/saudi-store', 'blue');
  log('3. Go to: Settings → Environment Variables', 'blue');
  log('4. Add each variable below (select "Production" environment)', 'blue');
  log('5. After adding, redeploy: vercel --prod\n', 'blue');
  
  log('🔧 Quick Copy Commands:', 'cyan');
  log('─'.repeat(60), 'cyan');
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    log(`vercel env add ${key} production`, 'green');
    log(`  (Then paste: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''})`, 'white');
  });
  
  log('─'.repeat(60) + '\n', 'cyan');
  
  log('💡 Or use Vercel Dashboard:', 'yellow');
  log('Copy and paste each variable from the list above\n', 'yellow');
  
  // Generate a file with all variables
  const envFile = path.join(process.cwd(), 'VERCEL_ENV_VARS.txt');
  const content = Object.entries(requiredVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envFile, content);
  log(`✅ Saved to: ${envFile}`, 'green');
  log('   You can copy from this file to Vercel dashboard\n', 'green');
  
  log('🚀 After adding variables, redeploy:', 'cyan');
  log('   vercel --prod\n', 'white');
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}

