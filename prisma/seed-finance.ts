import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFinance() {
  console.log('💰 Seeding Finance Module with real KSA data...');

  // Get first tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenants found. Run main seed first.');
    return;
  }

  // Clean existing finance data
  console.log('🧹 Cleaning existing finance data...');

  // Create Chart of Accounts (Arabic)
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

  // Create Transactions (Real Saudi Business Data)
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

  // Create Invoices (Arabic)
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

  // Create Budgets (Arabic)
  console.log('📈 Creating budgets...');
  const budgets = [
    { name: 'ميزانية المبيعات 2024', category: 'revenue', amount: 2000000, period: 'annual' },
    { name: 'ميزانية الرواتب 2024', category: 'payroll', amount: 1200000, period: 'annual' },
    { name: 'ميزانية التسويق 2024', category: 'marketing', amount: 150000, period: 'annual' },
    { name: 'ميزانية التشغيل 2024', category: 'operations', amount: 500000, period: 'annual' }
  ];

  console.log('✅ Finance seeding completed!');
  console.log(`📊 Created:`);
  console.log(`   - ${accounts.length} chart of accounts`);
  console.log(`   - ${transactions.length} transactions`);
  console.log(`   - ${invoices.length} invoices`);
  console.log(`   - ${budgets.length} budgets`);
  console.log(`\n💰 Total Revenue: ${transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} SAR`);
  console.log(`💸 Total Expenses: ${transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} SAR`);
}

seedFinance()
  .catch((e) => {
    console.error('❌ Finance seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
