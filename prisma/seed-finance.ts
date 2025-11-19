import 'dotenv/config';
import { query } from '../lib/db/connection.ts';


async function seedFinance() {
  console.log('💰 Seeding Finance Module with real KSA data...');

  let tenant: { id: string; name: string } | null = null;
  const res = await query('SELECT id, name FROM tenants ORDER BY created_at DESC LIMIT 1');
  if (res.rows.length > 0) {
    tenant = { id: String(res.rows[0].id), name: String(res.rows[0].name) };
  }
  if (!tenant) {
    console.error('❌ No tenants found. Run main seed first.');
    return;
  }
  const tenantId = tenant.id;

  await query(`CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(100) NOT NULL,
    item_description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 15,
    line_total DECIMAL(15, 2) NOT NULL,
    account_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('🧹 Skipping cleanup; inserting/upserting finance data...');

  console.log('📊 Creating Chart of Accounts...');
  const accounts = [
    // Assets - الأصول
    { code: '1000', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'asset', category: 'current_asset' },
    { code: '1010', nameAr: 'النقدية وما في حكمها', nameEn: 'Cash and Cash Equivalents', type: 'asset', category: 'cash', parent: '1000' },
    { code: '1011', nameAr: 'الصندوق', nameEn: 'Cash on Hand', type: 'asset', category: 'cash', parent: '1010', balance: 50000 },
    { code: '1012', nameAr: 'البنك - الراجحي', nameEn: 'Al Rajhi Bank', type: 'asset', category: 'bank', parent: '1010', balance: 750000 },
    { code: '1013', nameAr: 'البنك - الأهلي', nameEn: 'Al Ahli Bank', type: 'asset', category: 'bank', parent: '1010', balance: 450000 },
    { code: '1020', nameAr: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'asset', category: 'receivable', parent: '1000', balance: 320000 },
    { code: '1030', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', category: 'inventory', parent: '1000', balance: 280000 },
    
    // Liabilities - الخصوم
    { code: '2000', nameAr: 'الخصوم المتداولة', nameEn: 'Current Liabilities', type: 'liability', category: 'current_liability' },
    { code: '2010', nameAr: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'liability', category: 'payable', parent: '2000', balance: 180000 },
    { code: '2020', nameAr: 'المرتبات المستحقة', nameEn: 'Salaries Payable', type: 'liability', category: 'payable', parent: '2000', balance: 95000 },
    { code: '2030', nameAr: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', type: 'liability', category: 'tax', parent: '2000', balance: 45000 },
    
    // Equity - حقوق الملكية
    { code: '3000', nameAr: 'حقوق الملكية', nameEn: 'Equity', type: 'equity', category: 'equity' },
    { code: '3010', nameAr: 'رأس المال', nameEn: 'Capital', type: 'equity', category: 'capital', parent: '3000', balance: 1000000 },
    { code: '3020', nameAr: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'equity', category: 'retained_earnings', parent: '3000', balance: 350000 },
    
    // Revenue - الإيرادات
    { code: '4000', nameAr: 'الإيرادات', nameEn: 'Revenue', type: 'revenue', category: 'revenue' },
    { code: '4010', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'revenue', category: 'sales', parent: '4000' },
    { code: '4020', nameAr: 'إيرادات الخدمات', nameEn: 'Service Revenue', type: 'revenue', category: 'services', parent: '4000' },
    
    // Expenses - المصروفات
    { code: '5000', nameAr: 'المصروفات', nameEn: 'Expenses', type: 'expense', category: 'expense' },
    { code: '5010', nameAr: 'تكلفة المبيعات', nameEn: 'Cost of Goods Sold', type: 'expense', category: 'cogs', parent: '5000' },
    { code: '5020', nameAr: 'مصروفات الرواتب', nameEn: 'Salary Expenses', type: 'expense', category: 'payroll', parent: '5000' },
    { code: '5030', nameAr: 'مصروفات الإيجار', nameEn: 'Rent Expense', type: 'expense', category: 'rent', parent: '5000' },
    { code: '5040', nameAr: 'مصروفات الكهرباء والماء', nameEn: 'Utilities', type: 'expense', category: 'utilities', parent: '5000' },
    { code: '5050', nameAr: 'مصروفات الصيانة', nameEn: 'Maintenance', type: 'expense', category: 'maintenance', parent: '5000' },
  ];

  const accountIdByCode: Record<string, string> = {};
  for (const a of accounts) {
    let insertedId: string | null = null;
    // Try chart_of_accounts first
    try {
      const resChart = await query(
        `INSERT INTO chart_of_accounts 
         (tenant_id, account_code, account_name_ar, account_name_en, account_type, account_category, parent_account_id, balance, currency, is_active, description)
         VALUES ($1,$2,$3,$4,$5,$6,NULL,$7,'SAR',true,NULL)
         ON CONFLICT (tenant_id, account_code) DO UPDATE SET account_name_ar = EXCLUDED.account_name_ar, account_name_en = EXCLUDED.account_name_en, account_type = EXCLUDED.account_type, balance = EXCLUDED.balance
         RETURNING id`,
        [tenantId, a.code, a.nameAr || null, a.nameEn || null, a.type, a.category || null, a.balance || 0]
      );
      insertedId = String(resChart.rows[0].id);
    } catch (e: any) {
      // Fallback to financial_accounts (SBG variant)
      try {
        const resFinCode = await query(
          `INSERT INTO financial_accounts 
           (tenant_id, account_code, account_name, account_type, balance, is_active)
           VALUES ($1,$2,$3,$4,$5,true)
           ON CONFLICT (tenant_id, account_code) DO UPDATE SET account_name = EXCLUDED.account_name, account_type = EXCLUDED.account_type, balance = EXCLUDED.balance
           RETURNING id`,
          [tenantId, a.code, a.nameAr || a.nameEn || a.code, a.type, a.balance || 0]
        );
        insertedId = String(resFinCode.rows[0].id);
      } catch {
        const resFinNum = await query(
          `INSERT INTO financial_accounts 
           (tenant_id, account_number, account_name, account_type, balance, currency, status)
           VALUES ($1,$2,$3,$4,$5,'SAR','Active')
           ON CONFLICT (tenant_id, account_number) DO UPDATE SET account_name = EXCLUDED.account_name, account_type = EXCLUDED.account_type, balance = EXCLUDED.balance
           RETURNING id`,
          [tenantId, a.code, a.nameAr || a.nameEn || a.code, a.type, a.balance || 0]
        );
        insertedId = String(resFinNum.rows[0].id);
      }
    }
    accountIdByCode[a.code] = insertedId!;
  }

  console.log('💳 Creating financial transactions...');
  const transactions = [
    // Sales Revenue
    { date: -30, accountCode: '1012', type: 'INCOME', amount: 125000, desc: 'إيراد مبيعات - العميل: شركة المستقبل' },
    { date: -28, accountCode: '1012', type: 'INCOME', amount: 85000, desc: 'إيراد خدمات - العميل: مؤسسة الأمل' },
    { date: -25, accountCode: '1011', type: 'INCOME', amount: 45000, desc: 'مبيعات نقدية' },
    { date: -20, accountCode: '1012', type: 'INCOME', amount: 95000, desc: 'إيراد مبيعات - العميل: شركة النور' },
    { date: -15, accountCode: '1013', type: 'INCOME', amount: 110000, desc: 'تحصيل من عميل - مجموعة الفجر' },
    { date: -10, accountCode: '1012', type: 'INCOME', amount: 78000, desc: 'إيراد خدمات استشارية' },
    { date: -5, accountCode: '1011', type: 'INCOME', amount: 32000, desc: 'مبيعات نقدية - عملاء متفرقين' },
    { date: -2, accountCode: '1012', type: 'INCOME', amount: 145000, desc: 'عقد خدمات - شركة التطوير المتقدم' },
    
    // Salary Expenses
    { date: -29, accountCode: '1012', type: 'EXPENSE', amount: 95000, desc: 'رواتب شهر سابق' },
    { date: -1, accountCode: '1012', type: 'EXPENSE', amount: 98000, desc: 'رواتب الموظفين - الشهر الحالي' },
    
    // Rent
    { date: -27, accountCode: '1013', type: 'EXPENSE', amount: 35000, desc: 'إيجار المكتب - الشهر الحالي' },
    
    // Utilities
    { date: -24, accountCode: '1011', type: 'EXPENSE', amount: 8500, desc: 'فاتورة الكهرباء والماء' },
    { date: -12, accountCode: '1011', type: 'EXPENSE', amount: 3200, desc: 'خدمات الإنترنت والاتصالات' },
    
    // Supplies & Maintenance
    { date: -22, accountCode: '1012', type: 'EXPENSE', amount: 12000, desc: 'شراء مستلزمات مكتبية' },
    { date: -18, accountCode: '1011', type: 'EXPENSE', amount: 6500, desc: 'صيانة معدات' },
    { date: -14, accountCode: '1012', type: 'EXPENSE', amount: 15000, desc: 'شراء معدات تقنية' },
    
    // Vendor Payments
    { date: -26, accountCode: '1013', type: 'EXPENSE', amount: 45000, desc: 'سداد للمورد - شركة التوريدات الشاملة' },
    { date: -16, accountCode: '1012', type: 'EXPENSE', amount: 38000, desc: 'سداد للمورد - مؤسسة الإمداد' },
    { date: -8, accountCode: '1013', type: 'EXPENSE', amount: 52000, desc: 'شراء بضاعة - مورد خارجي' },
    
    // VAT
    { date: -21, accountCode: '1012', type: 'EXPENSE', amount: 11250, desc: 'سداد ضريبة القيمة المضافة - الربع السابق' },
    
    // Other Expenses
    { date: -19, accountCode: '1011', type: 'EXPENSE', amount: 4500, desc: 'مصروفات تسويق وإعلان' },
    { date: -11, accountCode: '1011', type: 'EXPENSE', amount: 2800, desc: 'مصروفات ضيافة وتمثيل' },
    { date: -7, accountCode: '1012', type: 'EXPENSE', amount: 7200, desc: 'رسوم بنكية وعمولات' },
    { date: -3, accountCode: '1011', type: 'EXPENSE', amount: 5500, desc: 'مصروفات نقل وشحن' },
  ];

  const toDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d;
  };

  for (const t of transactions) {
    const accId = accountIdByCode[t.accountCode] || null;
    const accName = null;
    const mappedType = t.type === 'INCOME' ? 'receipt' : t.type === 'EXPENSE' ? 'payment' : t.type;
    await query(
      `INSERT INTO transactions 
       (tenant_id, transaction_number, transaction_date, transaction_type, account_id, description, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'completed')`,
      [tenantId, `TX-${Date.now()}-${Math.floor(Math.random()*100000)}`, toDate(t.date), mappedType, accId, t.desc, t.amount]
    );
  }

  console.log('🧾 Creating invoices...');
  const invoices = [
    {
      number: 'INV-2024-001',
      customer: 'شركة المستقبل للتجارة',
      date: -30,
      amount: 125000,
      vat: 18750,
      status: 'paid',
      items: [
        { desc: 'خدمات استشارية', qty: 10, price: 10000, vat: 1500 },
        { desc: 'دعم فني', qty: 5, price: 5000, vat: 3750 }
      ]
    },
    {
      number: 'INV-2024-002',
      customer: 'مؤسسة الأمل التجارية',
      date: -28,
      amount: 85000,
      vat: 12750,
      status: 'paid',
      items: [
        { desc: 'منتجات برمجية', qty: 1, price: 75000, vat: 11250 }
      ]
    },
    {
      number: 'INV-2024-003',
      customer: 'شركة النور للمقاولات',
      date: -20,
      amount: 95000,
      vat: 14250,
      status: 'paid',
      items: [
        { desc: 'تصميم وتطوير', qty: 1, price: 95000, vat: 14250 }
      ]
    },
    {
      number: 'INV-2024-004',
      customer: 'مجموعة الفجر القابضة',
      date: -15,
      amount: 110000,
      vat: 16500,
      status: 'paid',
      items: [
        { desc: 'حلول متكاملة', qty: 1, price: 110000, vat: 16500 }
      ]
    },
    {
      number: 'INV-2024-005',
      customer: 'شركة التطوير المتقدم',
      date: -2,
      amount: 145000,
      vat: 21750,
      status: 'pending',
      items: [
        { desc: 'عقد خدمات سنوي', qty: 1, price: 145000, vat: 21750 }
      ]
    }
  ];

  for (const inv of invoices) {
    const date = toDate(inv.date);
    const due = new Date(date.getTime());
    due.setDate(date.getDate() + 30);
    const subtotal = inv.items.reduce((s, it) => s + it.qty * it.price, 0);
    const vatAmount = inv.items.reduce((s, it) => s + it.vat, 0);
    const total = subtotal + vatAmount;
    let invoiceId: string = inv.number;
    try {
      const colsRes = await query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' AND table_schema = 'public'"
      );
      const cols = colsRes.rows.map((r) => r.column_name);
      if (cols.includes('tenant_id') && cols.includes('invoice_number')) {
        const resInv = await query(
          `INSERT INTO invoices 
           (tenant_id, invoice_number, customer_name, invoice_date, due_date, status, subtotal, vat_amount, vat_percent, total_amount, currency)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,15,$9,'SAR')
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [tenantId, inv.number, inv.customer, date, due, inv.status, subtotal, vatAmount, total]
        );
        if (resInv.rows[0]?.id) invoiceId = String(resInv.rows[0].id);
      } else {
        let organizationId: number | null = null;
        if (cols.includes('organization_id')) {
          const orgTableRes = await query<{ table_name: string }>(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations'"
          );
          if (orgTableRes.rows.length > 0) {
            const orgRes = await query<{ id: number }>(
              "SELECT id FROM organizations ORDER BY id DESC LIMIT 1"
            );
            organizationId = orgRes.rows[0]?.id || null;
            if (!organizationId) {
              const createdOrg = await query<{ id: number }>(
                "INSERT INTO organizations (name, created_at, updated_at) VALUES ('Default Org', NOW(), NOW()) RETURNING id"
              );
              organizationId = createdOrg.rows[0].id;
            }
          }
        }
        let customerId: number | null = null;
        if (organizationId) {
          const customerColsRes = await query<{ column_name: string }>(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND table_schema = 'public'"
          );
          const customerCols = customerColsRes.rows.map((r) => r.column_name);
          if (customerCols.includes('id') && customerCols.includes('organization_id')) {
            const existingCust = await query<{ id: number }>(
              "SELECT id FROM customers ORDER BY id DESC LIMIT 1"
            );
            if (existingCust.rows[0]?.id) {
              customerId = existingCust.rows[0].id;
            } else {
              const createdCust = await query<{ id: number }>(
                "INSERT INTO customers (organization_id, email, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id",
                [organizationId, 'customer@example.com', 'عميل', 'سعودي']
              );
              customerId = createdCust.rows[0].id;
            }
          }
        }
        const insertCols: string[] = [];
        const values: any[] = [];
        if (cols.includes('organization_id') && organizationId) {
          insertCols.push('organization_id');
          values.push(organizationId);
        }
        if (cols.includes('customer_id') && customerId) {
          insertCols.push('customer_id');
          values.push(customerId);
        }
        if (cols.includes('amount')) {
          insertCols.push('amount');
          values.push(total);
        }
        if (cols.includes('status')) {
          insertCols.push('status');
          values.push(inv.status === 'paid' ? 'paid' : 'pending');
        }
        if (cols.includes('due_date')) {
          insertCols.push('due_date');
          values.push(due);
        }
        if (insertCols.length > 0) {
          const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(',');
          const insertSQL = `INSERT INTO invoices (${insertCols.join(',')}) VALUES (${placeholders}) RETURNING id`;
          const resBasic = await query(insertSQL, values);
          if (resBasic.rows[0]?.id) invoiceId = String(resBasic.rows[0].id);
        }
      }
    } catch {}
    for (const item of inv.items) {
      const lineTotal = item.qty * item.price + item.vat;
      await query(
        `INSERT INTO invoice_items 
         (invoice_id, item_description, quantity, unit_price, discount_percent, vat_percent, line_total, account_code)
         VALUES ($1,$2,$3,$4,0,15,$5,NULL)`,
        [invoiceId, item.desc, item.qty, item.price, lineTotal]
      );
    }
  }

  console.log('📈 Creating budgets...');
  const budgets = [
    { name: 'ميزانية المبيعات 2024', category: 'revenue', amount: 2000000, period: 'annual' },
    { name: 'ميزانية الرواتب 2024', category: 'payroll', amount: 1200000, period: 'annual' },
    { name: 'ميزانية التسويق 2024', category: 'marketing', amount: 150000, period: 'annual' },
    { name: 'ميزانية التشغيل 2024', category: 'operations', amount: 500000, period: 'annual' }
  ];

  const year = new Date().getFullYear();
  const getAllowedPeriod = async () => {
    try {
      const res = await query<{ def: string }>(
        "SELECT pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'public.budgets'::regclass AND contype='c'"
      );
      const defs = res.rows.map((r) => r.def);
      const def = defs.find((d) => d.includes('budget_period')) || defs.find((d) => d.includes('period')) || '';
      const m = def.match(/IN \(([^\)]*)\)/);
      if (m && m[1]) {
        const vals = m[1].split(',').map((s) => s.trim().replace(/'/g, ''));
        return vals[0] || 'annual';
      }
      return 'annual';
    } catch {
      return 'annual';
    }
  };
  const periodAllowed = await getAllowedPeriod();
  for (const b of budgets) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);
    let resB;
    try {
      const colsRes = await query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'budgets' AND table_schema = 'public'"
      );
      const cols = colsRes.rows.map((r) => r.column_name);
      const insertCols: string[] = [];
      const values: any[] = [];
      if (cols.includes('tenant_id')) {
        insertCols.push('tenant_id');
        values.push(tenantId);
      }
      if (cols.includes('budget_name')) {
        insertCols.push('budget_name');
        values.push(b.name);
      } else if (cols.includes('name')) {
        insertCols.push('name');
        values.push(b.name);
      }
      if (cols.includes('budget_name_ar')) {
        insertCols.push('budget_name_ar');
        values.push(b.name);
      }
      if (cols.includes('budget_period')) {
        insertCols.push('budget_period');
        values.push(periodAllowed);
      } else if (cols.includes('period')) {
        insertCols.push('period');
        values.push(periodAllowed);
      }
      if (cols.includes('start_date')) {
        insertCols.push('start_date');
        values.push(start);
      }
      if (cols.includes('end_date')) {
        insertCols.push('end_date');
        values.push(end);
      }
      if (cols.includes('category')) {
        insertCols.push('category');
        values.push(b.category);
      }
      if (cols.includes('total_budget')) {
        insertCols.push('total_budget');
        values.push(b.amount);
      } else if (cols.includes('amount')) {
        insertCols.push('amount');
        values.push(b.amount);
      }
      if (cols.includes('allocated_amount')) {
        insertCols.push('allocated_amount');
        values.push(b.amount);
      }
      if (cols.includes('currency')) {
        insertCols.push('currency');
        values.push('SAR');
      }
      if (cols.includes('status')) {
        insertCols.push('status');
        values.push('active');
      }
      if (insertCols.length > 0) {
        const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(',');
        const sql = `INSERT INTO budgets (${insertCols.join(',')}) VALUES (${placeholders}) RETURNING id`;
        try {
          resB = await query(sql, values);
        } catch (err: any) {
          const msg = String(err?.message || '').toLowerCase();
          if (msg.includes('budget_period')) {
            const idx1 = insertCols.indexOf('budget_period');
            const idx2 = insertCols.indexOf('period');
            const idx = idx1 !== -1 ? idx1 : idx2;
            if (idx !== -1) {
              const candidates = [periodAllowed, 'monthly', 'yearly', 'quarterly', 'Q1', 'Q2', 'Q3', 'Q4'];
              let inserted = false;
              for (const cand of candidates) {
                values[idx] = cand;
                const phTry = insertCols.map((_, i) => `$${i + 1}`).join(',');
                const sqlTry = `INSERT INTO budgets (${insertCols.join(',')}) VALUES (${phTry}) RETURNING id`;
                try {
                  resB = await query(sqlTry, values);
                  inserted = true;
                  break;
                } catch {}
              }
              if (!inserted) {
                throw err;
              }
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      } else {
        continue;
      }
    } catch (e) {
      continue;
    }
    const budgetId = String(resB.rows[0].id);
    const biRes = await query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budget_items'"
    );
    if (biRes.rows.length > 0) {
      await query(
        `INSERT INTO budget_items (budget_id, account_code, account_name, budgeted_amount, actual_amount, variance, description)
         VALUES ($1,$2,$3,$4,0,$4,NULL)`,
        [budgetId, '4000', 'الإيرادات', b.amount]
      );
    }
  }

  console.log('✅ Finance seeding completed!');
}

seedFinance()
  .catch((e) => {
    console.error('❌ Finance seed failed:', e);
    process.exit(1);
  });
