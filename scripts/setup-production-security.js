#!/usr/bin/env node
/**
 * Production Security Setup Script
 * Generates secure secrets and sets up production environment variables
 */

import crypto from 'crypto';
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

// Generate secure random secrets
function generateSecret(length = 32, encoding = 'hex') {
  return crypto.randomBytes(length).toString(encoding);
}

function generateJWTSecret() {
  return generateSecret(32, 'hex');
}

function generateNextAuthSecret() {
  return generateSecret(32, 'base64');
}

function generateEncryptionKey() {
  return generateSecret(32, 'hex');
}

// Main execution
function main() {
  log('\n🔐 Production Security Setup', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');

  // Generate secrets
  log('Generating secure secrets...\n', 'blue');
  
  const jwtSecret = generateJWTSecret();
  const nextAuthSecret = generateNextAuthSecret();
  const encryptionKey = generateEncryptionKey();

  log('✅ Secrets generated successfully!\n', 'green');

  // Display secrets
  log('📋 Generated Security Secrets:', 'yellow');
  log('─'.repeat(60), 'yellow');
  log(`JWT_SECRET=${jwtSecret}`, 'green');
  log(`NEXTAUTH_SECRET=${nextAuthSecret}`, 'green');
  log(`ENCRYPTION_KEY=${encryptionKey}`, 'green');
  log('─'.repeat(60) + '\n', 'yellow');

  // Check if .env.production exists
  const envPath = path.join(process.cwd(), '.env.production');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPathToUse = fs.existsSync(envPath) ? envPath : envLocalPath;

  log(`📝 Environment file: ${path.basename(envPathToUse)}\n`, 'blue');

  // Read existing .env file or create new
  let envContent = '';
  if (fs.existsSync(envPathToUse)) {
    envContent = fs.readFileSync(envPathToUse, 'utf-8');
    log(`✅ Found existing ${path.basename(envPathToUse)}`, 'green');
  } else {
    log(`⚠️  ${path.basename(envPathToUse)} not found, will create new`, 'yellow');
  }

  // Update or add secrets
  const lines = envContent.split('\n');
  const updatedLines = [];
  let jwtFound = false;
  let nextAuthFound = false;
  let encryptionFound = false;
  let nodeEnvFound = false;

  // Process existing lines
  for (const line of lines) {
    if (line.startsWith('JWT_SECRET=')) {
      updatedLines.push(`JWT_SECRET=${jwtSecret}`);
      jwtFound = true;
    } else if (line.startsWith('NEXTAUTH_SECRET=')) {
      updatedLines.push(`NEXTAUTH_SECRET=${nextAuthSecret}`);
      nextAuthFound = true;
    } else if (line.startsWith('ENCRYPTION_KEY=')) {
      updatedLines.push(`ENCRYPTION_KEY=${encryptionKey}`);
      encryptionFound = true;
    } else if (line.startsWith('NODE_ENV=')) {
      updatedLines.push('NODE_ENV=production');
      nodeEnvFound = true;
    } else {
      updatedLines.push(line);
    }
  }

  // Add missing secrets
  if (!jwtFound) {
    updatedLines.push(`JWT_SECRET=${jwtSecret}`);
  }
  if (!nextAuthFound) {
    updatedLines.push(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  }
  if (!encryptionFound) {
    updatedLines.push(`ENCRYPTION_KEY=${encryptionKey}`);
  }
  if (!nodeEnvFound) {
    updatedLines.push('NODE_ENV=production');
  }

  // Add security section header if not present
  if (!envContent.includes('# Security')) {
    updatedLines.unshift('\n# ============================================');
    updatedLines.unshift('# Security & Authentication');
    updatedLines.unshift('# ============================================');
  }

  // Write updated content
  const finalContent = updatedLines.join('\n');
  fs.writeFileSync(envPathToUse, finalContent);

  log(`\n✅ Security secrets saved to ${path.basename(envPathToUse)}`, 'green');

  // Create .env.production if it doesn't exist
  if (!fs.existsSync(envPath) && envPathToUse === envLocalPath) {
    log(`\n📝 Creating .env.production file...`, 'blue');
    fs.writeFileSync(envPath, finalContent);
    log(`✅ Created .env.production`, 'green');
  }

  // Security recommendations
  log('\n🔒 Security Recommendations:', 'yellow');
  log('─'.repeat(60), 'yellow');
  log('1. ✅ Secrets generated and saved', 'green');
  log('2. ⚠️  Make sure .env.production is NOT committed to git', 'yellow');
  log('3. ⚠️  Set NEXTAUTH_URL to your production domain', 'yellow');
  log('4. ⚠️  Use strong database passwords', 'yellow');
  log('5. ⚠️  Enable HTTPS in production', 'yellow');
  log('6. ⚠️  Configure CORS properly', 'yellow');
  log('7. ⚠️  Set up rate limiting', 'yellow');
  log('─'.repeat(60) + '\n', 'yellow');

  // Next steps
  log('📋 Next Steps:', 'cyan');
  log('1. Set NEXTAUTH_URL to your production domain', 'blue');
  log('2. Verify DATABASE_URL is set correctly', 'blue');
  log('3. Run: npm run verify:production', 'blue');
  log('4. Build: npm run build', 'blue');
  log('5. Deploy to production\n', 'blue');

  log('✅ Production security setup complete!\n', 'green');
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}

