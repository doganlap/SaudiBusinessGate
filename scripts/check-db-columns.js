#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkColumns() {
  try {
    // Check tenants table columns
    const tenantColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Tenants Table Columns:');
    console.log(JSON.stringify(tenantColumns, null, 2));
    
    // Check users table columns
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Users Table Columns:');
    console.log(JSON.stringify(userColumns, null, 2));
    
    // Check tenant_modules table columns
    const tenantModuleColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenant_modules' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Tenant Modules Table Columns:');
    console.log(JSON.stringify(tenantModuleColumns, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();

