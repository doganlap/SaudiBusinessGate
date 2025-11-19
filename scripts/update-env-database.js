#!/usr/bin/env node
/**
 * Update .env file with database URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.join(process.cwd(), '.env');

// Database URLs provided by user
const databaseURLs = {
  DATABASE_URL: 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require',
  POSTGRES_URL: 'postgres://f9b01b016f6065e1f9d62776a95e03ccb3773e35f2ba4d5ec6f6bbc1afaa2e46:sk_ZDb_YXE5HdKoY5VayB3tN@db.prisma.io:5432/postgres?sslmode=require',
  PRISMA_DATABASE_URL: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aRGJfWVhFNUhkS29ZNVZheUIzdE4iLCJhcGlfa2V5IjoiMDFLQTI2MDZLUDJDVkpYU1laWFhTVlFCWFAiLCJ0ZW5hbnRfaWQiOiJmOWIwMWIwMTZmNjA2NWUxZjlkNjI3NzZhOTVlMDNjY2IzNzczZTM1ZjJiYTRkNWVjNmY2YmJjMWFmYWEyZTQ2IiwiaW50ZXJuYWxfc2VjcmV0IjoiOWU1MWIyYjQtNzU3OS00ZmZhLTllMWEtYmFiYTVlMTQxYjdmIn0.4ZQEin9USH0TBlfgFmW_DVhaBy_fOTzlhsUJGn1SdSE'
};

function updateEnvFile() {
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add each database URL
  for (const [key, value] of Object.entries(databaseURLs)) {
    const regex = new RegExp(`^${key}=.*$`, 'gm');
    
    if (envContent.match(regex)) {
      // Update existing
      envContent = envContent.replace(regex, `${key}="${value}"`);
      console.log(`✅ Updated ${key}`);
    } else {
      // Add new
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${key}="${value}"\n`;
      console.log(`✅ Added ${key}`);
    }
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n✅ Updated .env file at: ${envPath}`);
}

updateEnvFile();

