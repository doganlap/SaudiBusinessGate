import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Comprehensive Database Seeding Script
 * Seeds all modules: Tenants, Users, CRM, Sales, HR, Finance, Analytics
 */

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.demoRequest.deleteMany();
  await prisma.pocRequest.deleteMany();
  await prisma.tenantSubscription.deleteMany();
  await prisma.userTeam.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.module.deleteMany();

  // 1. Create Subscription Plans
  console.log('📦 Creating subscription plans...');
  const plans = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: 'starter',
        slug: 'starter',
        displayName: { en: 'Starter', ar: 'المبتدئ' },
        description: { en: 'Perfect for small businesses', ar: 'مثالي للشركات الصغيرة' },
        priceMonthly: 299,
        priceYearly: 2990,
        currency: 'SAR',
        planType: 'standard',
        maxUsers: 5,
        maxTeams: 2,
        maxStorageGb: 50,
        maxApiCallsPerMonth: 10000,
        enabledModules: ['finance', 'crm', 'hr'],
        features: { support: '24/7', backup: 'daily' },
        isActive: true,
        isPublic: true
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'professional',
        slug: 'professional',
        displayName: { en: 'Professional', ar: 'المحترف' },
        description: { en: 'For growing companies', ar: 'للشركات النامية' },
        priceMonthly: 799,
        priceYearly: 7990,
        currency: 'SAR',
        planType: 'standard',
        maxUsers: 25,
        maxTeams: 10,
        maxStorageGb: 200,
        maxApiCallsPerMonth: 100000,
        enabledModules: ['finance', 'crm', 'hr', 'sales', 'analytics', 'procurement'],
        features: { support: '24/7', backup: 'hourly', aiAssistant: true },
        isActive: true,
        isPublic: true
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'enterprise',
        slug: 'enterprise',
        displayName: { en: 'Enterprise', ar: 'المؤسسي' },
        description: { en: 'For large organizations', ar: 'للمؤسسات الكبيرة' },
        priceMonthly: 2499,
        priceYearly: 24990,
        currency: 'SAR',
        planType: 'enterprise',
        maxUsers: 500,
        maxTeams: 50,
        maxStorageGb: 2000,
        maxApiCallsPerMonth: 1000000,
        enabledModules: ['finance', 'crm', 'hr', 'sales', 'analytics', 'procurement', 'grc', 'workflows'],
        features: { support: '24/7', backup: 'realtime', aiAssistant: true, customBranding: true },
        allowWhiteLabel: true,
        allowCustomBranding: true,
        allowCustomDomain: true,
        isActive: true,
        isPublic: true
      }
    })
  ]);

  // 2. Create Modules
  console.log('🧩 Creating modules...');
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        name: 'finance',
        slug: 'finance',
        displayName: { en: 'Finance & Accounting', ar: 'المالية والمحاسبة' },
        description: { en: 'Complete finance management', ar: 'إدارة مالية متكاملة' },
        moduleType: 'core',
        category: 'core',
        basePath: '/finance',
        icon: 'DollarSign',
        monthlyPrice: 0,
        isActive: true,
        isBeta: false,
        sortOrder: 1
      }
    }),
    prisma.module.create({
      data: {
        name: 'crm',
        slug: 'crm',
        displayName: { en: 'CRM', ar: 'إدارة علاقات العملاء' },
        description: { en: 'Customer relationship management', ar: 'إدارة علاقات العملاء' },
        moduleType: 'core',
        category: 'core',
        basePath: '/crm',
        icon: 'Users',
        monthlyPrice: 0,
        isActive: true,
        isBeta: false,
        sortOrder: 2
      }
    }),
    prisma.module.create({
      data: {
        name: 'hr',
        slug: 'hr',
        displayName: { en: 'Human Resources', ar: 'الموارد البشرية' },
        description: { en: 'HR and payroll management', ar: 'إدارة الموارد البشرية والرواتب' },
        moduleType: 'core',
        category: 'core',
        basePath: '/hr',
        icon: 'UserCheck',
        monthlyPrice: 0,
        isActive: true,
        isBeta: false,
        sortOrder: 3
      }
    }),
    prisma.module.create({
      data: {
        name: 'sales',
        slug: 'sales',
        displayName: { en: 'Sales', ar: 'المبيعات' },
        description: { en: 'Sales pipeline and orders', ar: 'إدارة المبيعات والطلبات' },
        moduleType: 'core',
        category: 'core',
        basePath: '/sales',
        icon: 'TrendingUp',
        monthlyPrice: 0,
        isActive: true,
        isBeta: false,
        sortOrder: 4
      }
    }),
    prisma.module.create({
      data: {
        name: 'analytics',
        slug: 'analytics',
        displayName: { en: 'Analytics', ar: 'التحليلات' },
        description: { en: 'Business intelligence and reports', ar: 'الذكاء التجاري والتقارير' },
        moduleType: 'addon',
        category: 'analytics',
        basePath: '/analytics',
        icon: 'BarChart',
        monthlyPrice: 199,
        isActive: true,
        isBeta: false,
        sortOrder: 5
      }
    }),
    prisma.module.create({
      data: {
        name: 'grc',
        slug: 'grc',
        displayName: { en: 'GRC', ar: 'الحوكمة والمخاطر والامتثال' },
        description: { en: 'Governance, Risk & Compliance', ar: 'الحوكمة وإدارة المخاطر والامتثال' },
        moduleType: 'addon',
        category: 'compliance',
        basePath: '/grc',
        icon: 'Shield',
        monthlyPrice: 299,
        isActive: true,
        isBeta: false,
        sortOrder: 6
      }
    }),
    prisma.module.create({
      data: {
        name: 'procurement',
        slug: 'procurement',
        displayName: { en: 'Procurement', ar: 'المشتريات' },
        description: { en: 'Procurement and vendor management', ar: 'إدارة المشتريات والموردين' },
        moduleType: 'addon',
        category: 'operations',
        basePath: '/procurement',
        icon: 'ShoppingCart',
        monthlyPrice: 149,
        isActive: true,
        isBeta: false,
        sortOrder: 7
      }
    })
  ]);

  // 3. Create Saudi Companies (Tenants)
  console.log('🏢 Creating Saudi companies...');
  const companies = [
    {
      name: 'شركة الرياض للتجارة',
      slug: 'riyadh-trade',
      plan: plans[2], // Enterprise
      city: 'الرياض'
    },
    {
      name: 'مؤسسة جدة للاستثمار',
      slug: 'jeddah-invest',
      plan: plans[1], // Professional
      city: 'جدة'
    },
    {
      name: 'شركة الدمام للخدمات',
      slug: 'dammam-services',
      plan: plans[1], // Professional
      city: 'الدمام'
    },
    {
      name: 'مجموعة مكة التجارية',
      slug: 'makkah-group',
      plan: plans[0], // Starter
      city: 'مكة المكرمة'
    },
    {
      name: 'شركة المدينة للتطوير',
      slug: 'madinah-dev',
      plan: plans[1], // Professional
      city: 'المدينة المنورة'
    }
  ];

  const tenants = [];
  for (const company of companies) {
    const tenant = await prisma.tenant.create({
      data: {
        name: company.name,
        slug: company.slug,
        domain: `${company.slug}.saudi-store.sa`,
        subscriptionTier: company.plan.slug,
        subscriptionStatus: 'active',
        maxUsers: company.plan.maxUsers,
        maxTeams: company.plan.maxTeams,
        maxStorageGb: company.plan.maxStorageGb,
        features: company.plan.features,
        contactEmail: `info@${company.slug}.sa`,
        contactPhone: `+966${Math.floor(Math.random() * 900000000 + 100000000)}`,
        isActive: true
      }
    });

    // Create subscription for tenant
    await prisma.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        planId: company.plan.id,
        status: 'active',
        billingPeriod: 'monthly',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: company.plan.priceMonthly,
        currency: 'SAR',
        paymentMethod: 'bank_transfer'
      }
    });

    // Enable modules for tenant
    for (const module of modules) {
      await prisma.tenantModule.create({
        data: {
          tenantId: tenant.id,
          moduleId: module.id,
          isEnabled: true,
          moduleSettings: {}
        }
      });
    }

    tenants.push(tenant);
  }

  // 4. Create Users with Arabic names
  console.log('👥 Creating users...');
  const saudiNames = [
    { fullName: 'محمد بن عبدالله العتيبي', email: 'mohammed.otaibi@riyadh-trade.sa', role: 'admin', tenantIdx: 0 },
    { fullName: 'فهد بن سعد القحطاني', email: 'fahad.qahtani@riyadh-trade.sa', role: 'manager', tenantIdx: 0 },
    { fullName: 'عبدالعزيز بن خالد السلمي', email: 'abdulaziz.sulami@jeddah-invest.sa', role: 'admin', tenantIdx: 1 },
    { fullName: 'سارة بنت أحمد الغامدي', email: 'sarah.ghamdi@jeddah-invest.sa', role: 'user', tenantIdx: 1 },
    { fullName: 'نورة بنت فيصل الشمري', email: 'noura.shamri@dammam-services.sa', role: 'manager', tenantIdx: 2 },
    { fullName: 'خالد بن محمد الدوسري', email: 'khaled.dosari@dammam-services.sa', role: 'user', tenantIdx: 2 },
    { fullName: 'عمر بن سلمان العمري', email: 'omar.omari@makkah-group.sa', role: 'admin', tenantIdx: 3 },
    { fullName: 'ريم بنت عبدالرحمن الزهراني', email: 'reem.zahrani@madinah-dev.sa', role: 'manager', tenantIdx: 4 },
    { fullName: 'أحمد بن ناصر الحربي', email: 'ahmed.harbi@madinah-dev.sa', role: 'user', tenantIdx: 4 },
    { fullName: 'مريم بنت يوسف القرشي', email: 'maryam.qurashi@riyadh-trade.sa', role: 'user', tenantIdx: 0 }
  ];

  const users = [];
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  for (const userData of saudiNames) {
    const tenant = tenants[userData.tenantIdx];
    
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: userData.email,
        passwordHash: hashedPassword,
        emailVerified: true,
        fullName: userData.fullName,
        phone: `+966${Math.floor(Math.random() * 900000000 + 500000000)}`,
        timezone: 'Asia/Riyadh',
        language: 'ar',
        role: userData.role,
        userType: 'regular',
        permissions: userData.role === 'admin' ? ['all'] : ['read', 'write'],
        isActive: true,
        lastLoginAt: new Date()
      }
    });
    users.push(user);
  }

  // 5. Create Demo Requests
  console.log('📝 Creating demo requests...');
  const demoCompanies = [
    { name: 'شركة النخيل التجارية', email: 'info@nakheel.sa', company: 'شركة النخيل التجارية', size: '50-100' },
    { name: 'مؤسسة الصحراء', email: 'contact@sahra.sa', company: 'مؤسسة الصحراء للتطوير', size: '100-500' },
    { name: 'مجموعة الخليج', email: 'info@gulf-group.sa', company: 'مجموعة الخليج القابضة', size: '500+' }
  ];

  for (const demo of demoCompanies) {
    await prisma.demoRequest.create({
      data: {
        fullName: demo.name,
        email: demo.email,
        phone: `+966${Math.floor(Math.random() * 900000000 + 100000000)}`,
        companyName: demo.company,
        interestedModules: ['finance', 'crm', 'hr'],
        companySize: demo.size,
        message: 'نرغب في الحصول على عرض توضيحي للنظام',
        status: 'pending'
      }
    });
  }

  console.log('✅ Comprehensive seeding completed!');
  console.log(`📊 Created:`);
  console.log(`   - ${plans.length} subscription plans`);
  console.log(`   - ${modules.length} modules`);
  console.log(`   - ${tenants.length} Saudi companies`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${demoCompanies.length} demo requests`);
  console.log(`\n🔐 Login credentials:`);
  console.log(`   Email: mohammed.otaibi@riyadh-trade.sa`);
  console.log(`   Password: Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

