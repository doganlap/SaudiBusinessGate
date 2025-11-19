#!/usr/bin/env node
/**
 * Seed Required Data
 * Seeds all required data for the application to work
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function seedData() {
  console.log('🌱 Seeding Required Data');
  console.log('================================\n');

  const client = await pool.connect();

  try {
    // 1. Seed Subscription Plans
    console.log('📦 Seeding Subscription Plans...');
    await client.query(`
      INSERT INTO subscription_plans (name, slug, display_name, description, price_monthly, price_yearly, currency, plan_type, max_users, max_teams, enabled_modules, is_active, is_public, created_at)
      VALUES 
        ('starter', 'starter', '{"en":"Starter","ar":"المبتدئ"}', '{"en":"Perfect for small businesses","ar":"مثالي للشركات الصغيرة"}', 299, 2990, 'SAR', 'standard', 5, 2, '["finance","crm","hr"]'::jsonb, true, true, NOW()),
        ('professional', 'professional', '{"en":"Professional","ar":"المهني"}', '{"en":"For growing businesses","ar":"للشركات النامية"}', 999, 9990, 'SAR', 'standard', 25, 5, '["finance","crm","hr","sales","grc"]'::jsonb, true, true, NOW()),
        ('enterprise', 'enterprise', '{"en":"Enterprise","ar":"المؤسسات"}', '{"en":"For large organizations","ar":"للمؤسسات الكبيرة"}', 2999, 29990, 'SAR', 'standard', 100, 20, '["finance","crm","hr","sales","grc","procurement","analytics"]'::jsonb, true, true, NOW())
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('   ✅ Subscription plans seeded\n');

    // 2. Seed Modules
    console.log('📚 Seeding Modules...');
    await client.query(`
      INSERT INTO modules (name, slug, display_name, description, icon, category, module_type, base_path, is_active, created_at)
      VALUES 
        ('crm', 'crm', '{"en":"CRM","ar":"إدارة العملاء"}'::jsonb, '{"en":"Customer Relationship Management","ar":"إدارة علاقات العملاء"}'::jsonb, 'users', 'operations', 'core', '/crm', true, NOW()),
        ('sales', 'sales', '{"en":"Sales","ar":"المبيعات"}'::jsonb, '{"en":"Sales Management","ar":"إدارة المبيعات"}'::jsonb, 'shopping-cart', 'operations', 'core', '/sales', true, NOW()),
        ('finance', 'finance', '{"en":"Finance","ar":"المالية"}'::jsonb, '{"en":"Financial Management","ar":"الإدارة المالية"}'::jsonb, 'dollar-sign', 'finance', 'core', '/finance', true, NOW()),
        ('hr', 'hr', '{"en":"HR","ar":"الموارد البشرية"}'::jsonb, '{"en":"Human Resources","ar":"الموارد البشرية"}'::jsonb, 'user-check', 'hr', 'core', '/hr', true, NOW()),
        ('grc', 'grc', '{"en":"GRC","ar":"الحوكمة والمخاطر"}'::jsonb, '{"en":"Governance, Risk & Compliance","ar":"الحوكمة والمخاطر والامتثال"}'::jsonb, 'shield', 'compliance', 'core', '/grc', true, NOW()),
        ('procurement', 'procurement', '{"en":"Procurement","ar":"المشتريات"}'::jsonb, '{"en":"Procurement Management","ar":"إدارة المشتريات"}'::jsonb, 'package', 'operations', 'core', '/procurement', true, NOW()),
        ('analytics', 'analytics', '{"en":"Analytics","ar":"التحليلات"}'::jsonb, '{"en":"Business Analytics","ar":"التحليلات التجارية"}'::jsonb, 'bar-chart', 'analytics', 'core', '/analytics', true, NOW())
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('   ✅ Modules seeded\n');

    // 3. Seed Default Tenant
    console.log('🏢 Seeding Default Tenant...');
    const tenantResult = await client.query(`
      INSERT INTO tenants (name, slug, subscription_tier, max_users, is_verified, created_at)
      VALUES ('Saudi Business Gate', 'sbg-default', 'enterprise', 100, true, NOW())
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, slug;
    `);
    const tenantId = tenantResult.rows[0]?.id || tenantResult.rows[0]?.slug || 'default-tenant';
    console.log(`   ✅ Default tenant seeded: ${tenantId}\n`);

    // 4. Seed Default Admin User
    console.log('👤 Seeding Default Admin User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    // Check if user exists and update, or create new
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1 OR username = $2', ['admin@sbg.com', 'admin']);
    if (userCheck.rows.length > 0) {
      await client.query(`
        UPDATE users 
        SET password_hash = $1, tenant_id = $2, is_active = true, email_verified = true
        WHERE email = 'admin@sbg.com' OR username = 'admin'
      `, [hashedPassword, tenantId]);
      console.log('   ✅ Default admin user updated (email: admin@sbg.com, password: admin123)\n');
    } else {
      await client.query(`
        INSERT INTO users (email, username, password_hash, first_name, last_name, role, tenant_id, is_active, email_verified, created_at)
        VALUES ('admin@sbg.com', 'admin', $1, 'Admin', 'User', 'admin', $2, true, true, NOW())
      `, [hashedPassword, tenantId]);
      console.log('   ✅ Default admin user created (email: admin@sbg.com, password: admin123)\n');
    }

    // 5. Seed Sample CRM Data
    console.log('📇 Seeding Sample CRM Data...');
    await client.query(`
      INSERT INTO customers (tenant_id, name, company, email, phone, status, tier, created_at)
      VALUES 
        ($1, 'أحمد محمد', 'شركة التقنية المتقدمة', 'ahmed@tech.com', '+966501234567', 'active', 'gold', NOW()),
        ($1, 'فاطمة علي', 'مؤسسة الأعمال الحديثة', 'fatima@business.com', '+966502345678', 'active', 'silver', NOW()),
        ($1, 'خالد سعيد', 'مجموعة الحلول الذكية', 'khalid@solutions.com', '+966503456789', 'prospect', 'bronze', NOW())
      ON CONFLICT DO NOTHING;
    `, [tenantId]);
    console.log('   ✅ Sample customers seeded\n');

    // 6. Seed Sample Employees
    console.log('👥 Seeding Sample HR Data...');
    await client.query(`
      INSERT INTO employees (tenant_id, employee_number, first_name, last_name, full_name, email, phone, department, position, hire_date, status, created_at)
      VALUES 
        ($1, 'EMP001', 'محمد', 'عبدالله', 'محمد عبدالله', 'mohammed@company.com', '+966504567890', 'IT', 'Developer', CURRENT_DATE, 'active', NOW()),
        ($1, 'EMP002', 'سارة', 'أحمد', 'سارة أحمد', 'sara@company.com', '+966505678901', 'HR', 'Manager', CURRENT_DATE, 'active', NOW()),
        ($1, 'EMP003', 'علي', 'حسن', 'علي حسن', 'ali@company.com', '+966506789012', 'Sales', 'Representative', CURRENT_DATE, 'active', NOW())
      ON CONFLICT (employee_number) DO NOTHING;
    `, [tenantId]);
    console.log('   ✅ Sample employees seeded\n');

    // 7. Seed Sample Vendors
    console.log('🏪 Seeding Sample Procurement Data...');
    await client.query(`
      INSERT INTO vendors (tenant_id, vendor_code, vendor_name, vendor_name_ar, contact_person, email, phone, status, created_at)
      VALUES 
        ($1, 'VEND001', 'Tech Supplier', 'مورد التقنية', 'يوسف خالد', 'youssef@vendor.com', '+966507890123', 'active', NOW()),
        ($1, 'VEND002', 'Supplies Company', 'شركة الإمدادات', 'نورا محمد', 'nora@supplies.com', '+966508901234', 'active', NOW())
      ON CONFLICT (vendor_code) DO NOTHING;
    `, [tenantId]);
    console.log('   ✅ Sample vendors seeded\n');

    // 8. Seed GRC Frameworks
    console.log('🛡️ Seeding GRC Data...');
    await client.query(`
      INSERT INTO grc_frameworks (tenant_id, framework_name, framework_type, status, created_at)
      VALUES 
        ($1, 'ISO 27001', 'ISO27001', 'active', NOW()),
        ($1, 'NIST Cybersecurity Framework', 'NIST', 'active', NOW()),
        ($1, 'COSO Framework', 'COSO', 'active', NOW())
      ON CONFLICT DO NOTHING;
    `, [tenantId]);
    console.log('   ✅ GRC frameworks seeded\n');

    console.log('================================');
    console.log('✅ All Required Data Seeded!');
    console.log('================================\n');
    console.log('📋 Summary:');
    console.log('   ✅ Subscription Plans: 3 plans');
    console.log('   ✅ Modules: 7 modules');
    console.log('   ✅ Default Tenant: Saudi Business Gate');
    console.log('   ✅ Admin User: admin@sbg.com / admin123');
    console.log('   ✅ Sample Customers: 3');
    console.log('   ✅ Sample Employees: 3');
    console.log('   ✅ Sample Vendors: 2');
    console.log('   ✅ GRC Frameworks: 3\n');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    if (error.code === '42P01') {
      console.error('   Table does not exist. Run database setup first: npm run db:setup:full');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedData().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

