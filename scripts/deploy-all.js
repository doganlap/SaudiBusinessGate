#!/usr/bin/env node
/**
 * Complete Deployment Script
 * Builds and deploys the application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Complete Deployment');
console.log('================================\n');

const args = process.argv.slice(2);
const shouldBuild = args.includes('--build');

try {
  // Step 1: Build (if requested)
  if (shouldBuild) {
    console.log('📦 Building application...\n');
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('\n✅ Build completed successfully\n');
  }

  // Step 2: Verify build output
  console.log('🔍 Verifying build output...\n');
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('✅ .next directory exists\n');
  } else {
    console.log('⚠️  .next directory not found. Run build first.\n');
  }

  // Step 3: Check for production files
  const requiredFiles = [
    '.next',
    'package.json',
    'next.config.js',
    '.env'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️  ${file} - not found`);
      if (file === '.env') {
        console.log('   (Optional - can use environment variables)');
      } else {
        allFilesExist = false;
      }
    }
  }

  console.log('\n================================');
  console.log('📋 Deployment Summary');
  console.log('================================\n');

  if (shouldBuild) {
    console.log('✅ Application built successfully');
    console.log('✅ Ready for production deployment\n');
  }

  console.log('🌐 Deployment Options:\n');
  console.log('1. Local Production:');
  console.log('   npm run start\n');
  console.log('2. Docker Deployment:');
  console.log('   docker-compose up -d\n');
  console.log('3. Vercel Deployment:');
  console.log('   vercel --prod\n');
  console.log('4. Manual Deployment:');
  console.log('   - Copy .next folder to server');
  console.log('   - Run: npm run start\n');

  console.log('📊 Build Statistics:');
  const buildManifest = path.join(nextDir, 'BUILD_ID');
  if (fs.existsSync(buildManifest)) {
    const buildId = fs.readFileSync(buildManifest, 'utf8').trim();
    console.log(`   Build ID: ${buildId}`);
  }

  console.log('\n✅ Deployment preparation complete!\n');

} catch (error) {
  console.error('\n❌ Deployment error:', error.message);
  process.exit(1);
}

