#!/usr/bin/env node
/**
 * Check for trial and password data in database
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

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

async function checkTrialAndPasswordData() {
  log('\n🔍 Checking Trial and Password Data in Database', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');
  
  try {
    // Check Tenants for trial data
    log('📋 Checking Tenants for Trial Data:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    // Use raw query to check actual columns (using snake_case)
    const tenantsRaw = await prisma.$queryRaw`
      SELECT id, name, slug, 
             subscription_tier as tier,
             subscription_status as status,
             is_active as "isActive"
      FROM tenants
      LIMIT 20
    `;
    
    const tenants = tenantsRaw.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      subscriptionTier: t.tier,
      subscriptionStatus: t.status,
      isActive: t.isActive
    }));
    
    log(`   Found ${tenants.length} tenants`, 'blue');
    
    tenants.forEach((tenant, index) => {
      log(`   ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.subscriptionTier} - ${tenant.subscriptionStatus}`, 'blue');
    });
    
    log('');
    
    // Check Tenant Modules for trial
    log('📋 Checking Tenant Modules for Trial:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    // Use raw query for tenant_modules
    const tenantModulesRaw = await prisma.$queryRaw`
      SELECT tm.id, tm.tenant_id, tm.module_id,
             tm.is_trial as "isTrial",
             tm.trial_ends_at as "trialEndsAt",
             tm.is_enabled as "isEnabled",
             t.name as tenant_name,
             t.slug as tenant_slug,
             m.name as module_name,
             m.slug as module_slug
      FROM tenant_modules tm
      LEFT JOIN tenants t ON tm.tenant_id = t.id
      LEFT JOIN modules m ON tm.module_id = m.id
    `;
    
    const tenantModules = tenantModulesRaw.map((tm) => ({
      id: tm.id,
      tenantId: tm.tenant_id,
      moduleId: tm.module_id,
      isTrial: tm.isTrial,
      trialEndsAt: tm.trialEndsAt,
      isEnabled: tm.isEnabled,
      tenant: {
        name: tm.tenant_name || 'N/A',
        slug: tm.tenant_slug || 'N/A'
      },
      module: {
        name: tm.module_name || 'N/A',
        slug: tm.module_slug || 'N/A'
      }
    }));
    
    log(`   Found ${tenantModules.length} tenant-module relationships`, 'blue');
    
    const modulesWithTrial = tenantModules.filter(tm => tm.isTrial === true);
    log(`   Modules with trial: ${modulesWithTrial.length}`, modulesWithTrial.length > 0 ? 'green' : 'yellow');
    
    if (modulesWithTrial.length > 0) {
      modulesWithTrial.forEach((tm, index) => {
        const trialEnd = tm.trialEndsAt 
          ? new Date(tm.trialEndsAt).toLocaleDateString()
          : 'No end date';
        log(`   ${index + 1}. ${tm.tenant.name} → ${tm.module.name} - Trial ends: ${trialEnd}`, 'green');
      });
    } else {
      log('   No modules with trial access', 'yellow');
    }
    
    log('');
    
    // Check Users for password data
    log('📋 Checking Users for Password Data:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    // Use raw query for users (columns are different)
    const usersRaw = await prisma.$queryRaw`
      SELECT u.id, u.email, 
             CONCAT(u.first_name, ' ', u.last_name) as full_name,
             u.password_hash as password_hash,
             u.email_verified as email_verified,
             u.is_active as is_active,
             t.name as tenant_name,
             t.slug as tenant_slug
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      LIMIT 10
    `;
    
    const users = usersRaw.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name || 'N/A',
      passwordHash: u.password_hash,
      emailVerified: u.email_verified,
      isActive: u.is_active,
      tenant: {
        name: u.tenant_name || 'N/A',
        slug: u.tenant_slug || 'N/A'
      }
    }));
    
    log(`   Found ${users.length} users (showing first 10)`, 'blue');
    
    const usersWithPassword = users.filter(u => u.passwordHash && u.passwordHash.length > 0);
    log(`   Users with password hash: ${usersWithPassword.length}`, usersWithPassword.length > 0 ? 'green' : 'yellow');
    
    users.forEach((user, index) => {
      const hasPassword = user.passwordHash && user.passwordHash.length > 0;
      const passwordStatus = hasPassword 
        ? `Password: ${user.passwordHash.substring(0, 20)}...` 
        : 'No password';
      log(`   ${index + 1}. ${user.fullName} (${user.email}) - ${user.tenant.name}`, 'blue');
      log(`      ${passwordStatus}`, hasPassword ? 'green' : 'yellow');
      log(`      Verified: ${user.emailVerified ? 'Yes' : 'No'}`, user.emailVerified ? 'green' : 'yellow');
    });
    
    log('');
    
    // Check Tenant Subscriptions
    log('📋 Checking Tenant Subscriptions:', 'yellow');
    log('─'.repeat(60), 'yellow');
    
    // Use raw query for subscriptions
    const subscriptionsRaw = await prisma.$queryRaw`
      SELECT ts.id, ts.tenant_id, ts.status,
             ts.billing_period as billing_period,
             ts.start_date as start_date,
             ts.end_date as end_date,
             t.name as tenant_name,
             t.slug as tenant_slug,
             sp.name as plan_name,
             sp.slug as plan_slug
      FROM tenant_subscriptions ts
      LEFT JOIN tenants t ON ts.tenant_id = t.id
      LEFT JOIN subscription_plans sp ON ts.plan_id = sp.id
    `;
    
    const subscriptions = subscriptionsRaw.map((s) => ({
      id: s.id,
      tenantId: s.tenant_id,
      status: s.status,
      billingPeriod: s.billing_period,
      startDate: s.start_date,
      endDate: s.end_date,
      tenant: {
        name: s.tenant_name || 'N/A',
        slug: s.tenant_slug || 'N/A'
      },
      plan: {
        name: s.plan_name || 'N/A',
        slug: s.plan_slug || 'N/A'
      }
    }));
    
    log(`   Found ${subscriptions.length} subscriptions`, 'blue');
    
    subscriptions.forEach((sub, index) => {
      const endDate = sub.endDate 
        ? new Date(sub.endDate).toLocaleDateString()
        : 'No end date';
      log(`   ${index + 1}. ${sub.tenant.name} → ${sub.plan.name} - ${sub.status} - Ends: ${endDate}`, 'blue');
    });
    
    log('');
    
    // Summary
    log('═'.repeat(60), 'cyan');
    log('📊 Summary:', 'cyan');
    log(`   Total Tenants: ${tenants.length}`, 'blue');
    log(`   Total Tenant Modules: ${tenantModules.length}`, 'blue');
    log(`   Modules with Trial: ${modulesWithTrial.length}`, modulesWithTrial.length > 0 ? 'green' : 'yellow');
    log(`   Total Users: ${users.length} (showing first 10)`, 'blue');
    log(`   Users with Password: ${usersWithPassword.length}`, usersWithPassword.length > 0 ? 'green' : 'yellow');
    log(`   Total Subscriptions: ${subscriptions.length}`, 'blue');
    log('');
    
  } catch (error) {
    log(`\n❌ Error: ${error?.message || String(error)}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrialAndPasswordData();

