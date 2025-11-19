#!/usr/bin/env node
/**
 * Production Database Setup Script
 * Ensures database schema is created and migrated properly
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Push schema to database
    console.log('2️⃣ Pushing schema to database...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env, PRISMA_HIDE_PREVIEW_FLAG_WARNING: '1' }
    });
    console.log('✅ Schema pushed successfully\n');

    // Generate Prisma Client
    console.log('3️⃣ Generating Prisma Client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, PRISMA_HIDE_PREVIEW_FLAG_WARNING: '1' }
    });
    console.log('✅ Prisma Client generated\n');

    // Check if tables exist
    console.log('4️⃣ Verifying database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log(`✅ Found ${tables.length} tables in database\n`);

    // Create initial admin user if not exists
    console.log('5️⃣ Checking for admin user...');
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    
    if (adminCount === 0) {
      console.log('Creating default admin user...');
      // Note: In production, use proper password hashing
      await prisma.user.create({
        data: {
          email: 'admin@saudistore.sa',
          passwordHash: '$2a$10$defaulthashfordemopurposes',
          fullName: 'System Administrator',
          role: 'admin',
          isActive: true,
          emailVerified: true,
          tenantId: 'default-tenant-id'
        }
      });
      console.log('✅ Admin user created\n');
    } else {
      console.log(`✅ Found ${adminCount} admin user(s)\n`);
    }

    console.log('🎉 Production database setup completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupProductionDatabase();
