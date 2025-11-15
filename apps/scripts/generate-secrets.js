#!/usr/bin/env node

/**
 * Generate Secure Production Secrets
 * Run this script to generate cryptographically secure secrets for production
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Generating Secure Production Secrets...\n');

/**
 * Generate a cryptographically secure random string
 */
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

// Generate secrets
const secrets = {
  JWT_SECRET: generateSecret(64),
  NEXTAUTH_SECRET: generateSecret(32),
  ENCRYPTION_KEY: generateSecret(32),
  SESSION_SECRET: generateSecret(32),
  WEBHOOK_SECRET: generateSecret(32),
  API_KEY_SALT: generateSecret(16)
};

console.log('✅ Generated Secrets:\n');
console.log('='.repeat(80));

// Display secrets (will be shown once, save them securely!)
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('='.repeat(80));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:\n');
console.log('1. Copy these secrets to a secure location (Azure Key Vault recommended)');
console.log('2. Never commit these secrets to version control');
console.log('3. Use different secrets for each environment (dev, staging, prod)');
console.log('4. Rotate secrets periodically (every 90 days recommended)');
console.log('5. Delete this output after saving secrets securely\n');

// Generate .env.secrets file (should not be committed)
const envSecrets = `# GENERATED PRODUCTION SECRETS
# Date: ${new Date().toISOString()}
# ⚠️  DO NOT COMMIT THIS FILE TO VERSION CONTROL
# Store these in Azure Key Vault or secure secrets manager

# Authentication Secrets
JWT_SECRET=${secrets.JWT_SECRET}
NEXTAUTH_SECRET=${secrets.NEXTAUTH_SECRET}
SESSION_SECRET=${secrets.SESSION_SECRET}

# Encryption
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}

# Webhooks
WEBHOOK_SECRET=${secrets.WEBHOOK_SECRET}

# API Security
API_KEY_SALT=${secrets.API_KEY_SALT}

# Additional UUIDs for API Keys
INTERNAL_API_KEY=${generateUUID()}
WEBHOOK_SIGNING_KEY=${generateSecret(32)}
`;

const secretsFile = path.join(process.cwd(), '.env.secrets');
fs.writeFileSync(secretsFile, envSecrets);

console.log(`📝 Secrets also saved to: ${secretsFile}`);
console.log('   (This file is gitignored by default)\n');

// Generate Azure Key Vault commands
console.log('🔷 Azure Key Vault Commands:\n');
console.log('Run these commands to store secrets in Azure Key Vault:\n');

const keyVaultName = 'saudistore-keyvault'; // Change to your Key Vault name

Object.entries(secrets).forEach(([key, value]) => {
  const secretName = key.toLowerCase().replace(/_/g, '-');
  console.log(`az keyvault secret set --vault-name ${keyVaultName} --name ${secretName} --value "${value}"`);
});

console.log('\n✅ Secret generation complete!\n');

// Security checklist
console.log('📋 Security Checklist:\n');
const checklist = [
  '[ ] Save secrets to Azure Key Vault',
  '[ ] Update .env.production with Key Vault references',
  '[ ] Delete .env.secrets file after migration',
  '[ ] Update application to read from Key Vault',
  '[ ] Enable Azure Key Vault access policies',
  '[ ] Test secret rotation procedure',
  '[ ] Document secret recovery process',
  '[ ] Set up secret expiration monitoring'
];

checklist.forEach(item => console.log(item));
console.log('');
