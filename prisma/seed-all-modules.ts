import { PrismaClient } from '@prisma/client';
import { query } from '../lib/db/connection';

const prisma = new PrismaClient();

/**
 * Comprehensive Seeding Script for All Modules
 * Seeds: CRM, Sales, HR, Finance, GRC, Procurement
 */

async function seedAllModules() {
  console.log('🌱 Starting comprehensive module seeding...');

  // Get first tenant for seeding
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenants found. Run main seed first: npm run db:seed:complete');
    return;
  }

  const tenantId = tenant.id;
  console.log(`📦 Using tenant: ${tenant.name} (${tenantId})`);

  // Seed CRM Data
  await seedCRM(tenantId);

  // Seed Sales Data
  await seedSales(tenantId);

  // Seed HR Data
  await seedHR(tenantId);

  // Seed Finance Data
  await seedFinance(tenantId);

  // Seed GRC Data
  await seedGRC(tenantId);

  // Seed Procurement Data
  await seedProcurement(tenantId);

  console.log('✅ All module seeding completed!');
}

async function seedCRM(tenantId: string) {
  console.log('📇 Seeding CRM data...');

  try {
    // Insert customers
    const customers = [
      {
        tenant_id: tenantId,
        name: 'أحمد محمد العلي',
        company: 'شركة المستقبل للتجارة',
        email: 'ahmed@almustaqbal.sa',
        phone: '+966501234567',
        address: 'طريق الملك فهد، الرياض',
        city: 'الرياض',
        country: 'SA',
        industry: 'تجارة',
        status: 'active',
        tier: 'gold',
        total_value: 250000,
        assigned_to: 'محمد بن عبدالله العتيبي'
      },
      {
        tenant_id: tenantId,
        name: 'فاطمة سعد الدوسري',
        company: 'مؤسسة الأمل التجارية',
        email: 'fatima@alamal.sa',
        phone: '+966502345678',
        address: 'شارع التحلية، جدة',
        city: 'جدة',
        country: 'SA',
        industry: 'خدمات',
        status: 'active',
        tier: 'silver',
        total_value: 125000,
        assigned_to: 'فهد بن سعد القحطاني'
      },
      {
        tenant_id: tenantId,
        name: 'خالد عبدالله الشمري',
        company: 'شركة النور للمقاولات',
        email: 'khaled@alnoor.sa',
        phone: '+966503456789',
        address: 'طريق الخليج، الدمام',
        city: 'الدمام',
        country: 'SA',
        industry: 'مقاولات',
        status: 'prospect',
        tier: 'bronze',
        total_value: 0,
        assigned_to: 'محمد بن عبدالله العتيبي'
      }
    ];

    for (const customer of customers) {
      await query(`
        INSERT INTO customers (
          tenant_id, name, company, email, phone, address, city, country,
          industry, status, tier, total_value, assigned_to, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (email, tenant_id) DO NOTHING
      `, [
        customer.tenant_id, customer.name, customer.company, customer.email,
        customer.phone, customer.address, customer.city, customer.country,
        customer.industry, customer.status, customer.tier, customer.total_value,
        customer.assigned_to
      ]);
    }

    // Insert deals
    const customerResult = await query('SELECT id FROM customers WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (customerResult.rows.length > 0) {
      const customerId = customerResult.rows[0].id;
      
      await query(`
        INSERT INTO deals (
          tenant_id, customer_id, name, value, stage, probability, expected_close_date, assigned_to, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT DO NOTHING
      `, [
        tenantId, customerId, 'عقد خدمات سنوي - شركة المستقبل', 500000, 'negotiation', 75,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'محمد بن عبدالله العتيبي'
      ]);
    }

    console.log('✅ CRM data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  CRM tables not found. Run: psql -d your_database -f database/create-crm-tables.sql');
    } else {
      console.error('❌ Error seeding CRM:', error.message);
    }
  }
}

async function seedSales(tenantId: string) {
  console.log('💰 Seeding Sales data...');

  try {
    const customerResult = await query('SELECT id FROM customers WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (customerResult.rows.length === 0) {
      console.warn('⚠️  No customers found. Skipping sales seeding.');
      return;
    }
    const customerId = customerResult.rows[0].id;

    // Insert sales orders
    await query(`
      INSERT INTO sales_orders (
        tenant_id, order_number, customer_id, customer_name, order_date,
        status, total_amount, vat_amount, currency, assigned_to, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (order_number) DO NOTHING
    `, [
      tenantId, 'SO-2024-001', customerId, 'شركة المستقبل للتجارة',
      new Date(), 'confirmed', 125000, 18750, 'SAR', 'فهد بن سعد القحطاني'
    ]);

    console.log('✅ Sales data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  Sales tables not found. Run: psql -d your_database -f database/create-sales-tables.sql');
    } else {
      console.error('❌ Error seeding Sales:', error.message);
    }
  }
}

async function seedHR(tenantId: string) {
  console.log('👥 Seeding HR data...');

  try {
    // Get first user for employee
    const user = await prisma.user.findFirst({ where: { tenantId } });
    if (!user) {
      console.warn('⚠️  No users found. Skipping HR seeding.');
      return;
    }

    // Insert employees
    await query(`
      INSERT INTO employees (
        tenant_id, employee_number, user_id, first_name, last_name, full_name,
        email, phone, position, department, job_title, employment_type,
        hire_date, status, salary, currency, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (employee_number) DO NOTHING
    `, [
      tenantId, 'EMP-001', user.id, 'محمد', 'العتيبي', 'محمد بن عبدالله العتيبي',
      user.email, user.phone || '+966501234567', 'مدير عام', 'إدارة', 'مدير',
      'full_time', new Date('2022-01-15'), 'active', 25000, 'SAR'
    ]);

    // Insert attendance records
    const empResult = await query('SELECT id FROM employees WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (empResult.rows.length > 0) {
      const empId = empResult.rows[0].id;
      const today = new Date();
      
      await query(`
        INSERT INTO attendance (
          tenant_id, employee_id, attendance_date, check_in_time, check_out_time,
          total_hours, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (employee_id, attendance_date) DO NOTHING
      `, [
        tenantId, empId, today, 
        new Date(today.setHours(8, 0, 0, 0)),
        new Date(today.setHours(17, 0, 0, 0)),
        8.0, 'present'
      ]);
    }

    console.log('✅ HR data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  HR tables not found. Run: psql -d your_database -f database/create-hr-tables.sql');
    } else {
      console.error('❌ Error seeding HR:', error.message);
    }
  }
}

async function seedFinance(tenantId: string) {
  console.log('💳 Seeding Finance data...');

  try {
    // Insert chart of accounts
    await query(`
      INSERT INTO chart_of_accounts (
        tenant_id, account_code, account_name_ar, account_name_en,
        account_type, account_category, balance, currency, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (tenant_id, account_code) DO NOTHING
    `, [
      tenantId, '1012', 'البنك - الراجحي', 'Al Rajhi Bank',
      'asset', 'bank', 750000, 'SAR', true
    ]);

    // Insert transactions
    await query(`
      INSERT INTO transactions (
        tenant_id, transaction_number, transaction_date, transaction_type,
        account_code, account_name, amount, currency, description, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (transaction_number) DO NOTHING
    `, [
      tenantId, 'TXN-2024-001', new Date(), 'INCOME',
      '1012', 'البنك - الراجحي', 125000, 'SAR',
      'إيراد مبيعات - العميل: شركة المستقبل', 'approved'
    ]);

    // Insert invoices
    const customerResult = await query('SELECT id FROM customers WHERE tenant_id = $1 LIMIT 1', [tenantId]);
    if (customerResult.rows.length > 0) {
      const customerId = customerResult.rows[0].id;
      
      await query(`
        INSERT INTO invoices (
          tenant_id, invoice_number, customer_id, customer_name, invoice_date,
          due_date, status, subtotal, vat_amount, total_amount, currency, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (invoice_number) DO NOTHING
      `, [
        tenantId, 'INV-2024-001', customerId, 'شركة المستقبل للتجارة',
        new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        'paid', 125000, 18750, 143750, 'SAR'
      ]);
    }

    console.log('✅ Finance data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  Finance tables not found. Run: psql -d your_database -f database/create-finance-tables.sql');
    } else {
      console.error('❌ Error seeding Finance:', error.message);
    }
  }
}

async function seedGRC(tenantId: string) {
  console.log('🛡️  Seeding GRC data...');

  try {
    // Insert framework
    const frameworkResult = await query(`
      INSERT INTO grc_frameworks (
        tenant_id, framework_name, framework_name_ar, framework_type, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `, [tenantId, 'ISO 27001', 'آيزو 27001', 'ISO27001', 'active']);

    if (frameworkResult.rows.length > 0) {
      const frameworkId = frameworkResult.rows[0].id;

      // Insert control
      await query(`
        INSERT INTO grc_controls (
          tenant_id, control_code, control_name, control_name_ar,
          framework_id, control_type, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (control_code) DO NOTHING
      `, [
        tenantId, 'CTRL-001', 'Access Control', 'التحكم في الوصول',
        frameworkId, 'preventive', 'active'
      ]);
    }

    console.log('✅ GRC data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  GRC tables not found. Run: psql -d your_database -f database/create-grc-tables.sql');
    } else {
      console.error('❌ Error seeding GRC:', error.message);
    }
  }
}

async function seedProcurement(tenantId: string) {
  console.log('📦 Seeding Procurement data...');

  try {
    // Insert vendors
    await query(`
      INSERT INTO vendors (
        tenant_id, vendor_code, vendor_name, vendor_name_ar,
        email, phone, city, country, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (vendor_code) DO NOTHING
    `, [
      tenantId, 'VEND-001', 'شركة التوريدات الشاملة', 'شركة التوريدات الشاملة',
      'info@supply.sa', '+966501111111', 'الرياض', 'SA', 'active'
    ]);

    // Insert inventory items
    await query(`
      INSERT INTO inventory_items (
        tenant_id, item_code, item_name, item_name_ar,
        category, unit_of_measure, current_stock, unit_cost, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (item_code) DO NOTHING
    `, [
      tenantId, 'INV-001', 'Laptop Dell', 'لابتوب ديل',
      'IT Equipment', 'piece', 10, 3500, 'SAR', 'active'
    ]);

    console.log('✅ Procurement data seeded');
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('⚠️  Procurement tables not found. Run: psql -d your_database -f database/create-procurement-tables.sql');
    } else {
      console.error('❌ Error seeding Procurement:', error.message);
    }
  }
}

seedAllModules()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

