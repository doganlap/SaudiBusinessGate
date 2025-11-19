#!/usr/bin/env node
/**
 * Complete Production Setup Script
 * Sets up all required production environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get production URL from command line or use default
const productionUrl = process.argv[2] || process.env.NEXTAUTH_URL || 'https://your-production-domain.com';

const envPath = path.join(process.cwd(), '.env.production');
const envLocalPath = path.join(process.cwd(), '.env.local');

// Read existing .env.production
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
} else if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf-8');
}

const lines = envContent.split('\n');
const updatedLines = [];
let nextAuthUrlFound = false;
let nextPublicAppUrlFound = false;
let nextPublicApiUrlFound = false;

// Process existing lines
for (const line of lines) {
  if (line.startsWith('NEXTAUTH_URL=')) {
    updatedLines.push(`NEXTAUTH_URL=${productionUrl}`);
    nextAuthUrlFound = true;
  } else if (line.startsWith('NEXT_PUBLIC_APP_URL=')) {
    updatedLines.push(`NEXT_PUBLIC_APP_URL=${productionUrl}`);
    nextPublicAppUrlFound = true;
  } else if (line.startsWith('NEXT_PUBLIC_API_URL=')) {
    updatedLines.push(`NEXT_PUBLIC_API_URL=${productionUrl}/api`);
    nextPublicApiUrlFound = true;
  } else {
    updatedLines.push(line);
  }
}

// Add missing URLs
if (!nextAuthUrlFound) {
  updatedLines.push(`NEXTAUTH_URL=${productionUrl}`);
}
if (!nextPublicAppUrlFound) {
  updatedLines.push(`NEXT_PUBLIC_APP_URL=${productionUrl}`);
}
if (!nextPublicApiUrlFound) {
  updatedLines.push(`NEXT_PUBLIC_API_URL=${productionUrl}/api`);
}

// Write to .env.production
const finalContent = updatedLines.join('\n');
fs.writeFileSync(envPath, finalContent);

console.log('\n✅ Production setup complete!');
console.log(`\n📝 Updated .env.production with:`);
console.log(`   NEXTAUTH_URL=${productionUrl}`);
console.log(`   NEXT_PUBLIC_APP_URL=${productionUrl}`);
console.log(`   NEXT_PUBLIC_API_URL=${productionUrl}/api`);
console.log('\n💡 To change the URL, run:');
console.log('   node scripts/complete-production-setup.js https://your-domain.com\n');

