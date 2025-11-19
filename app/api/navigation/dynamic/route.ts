import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Enhanced navigation data with comprehensive finance module
    const mockNavigationData = {
      modules: ['Dashboard', 'Finance', 'CRM', 'HR', 'Analytics'],
      items: [
        {
          id: 'dashboard',
          module: 'Dashboard',
          label: 'Dashboard',
          titleAr: 'لوحة التحكم',
          path: '/(platform)/dashboard',
          icon: '📊',
          badge: 0,
          available: true,
          children: []
        },
        {
          id: 'finance',
          module: 'Finance',
          label: 'Finance',
          titleAr: 'المالية',
          path: '/(platform)/finance',
          icon: '💰',
          badge: 12,
          available: true,
          children: [
            {
              id: 'dashboard',
              module: 'Finance',
              label: 'Dashboard',
              titleAr: 'لوحة التحكم',
              path: '/(platform)/finance/dashboard',
              icon: '📊',
              available: true,
              description: 'Financial overview and KPIs'
            },
            {
              id: 'accounts',
              module: 'Finance',
              label: 'Accounts',
              titleAr: 'الحسابات',
              path: '/(platform)/finance/accounts',
              icon: '📚',
              available: true,
              description: 'Chart of accounts management'
            },
            {
              id: 'transactions',
              module: 'Finance',
              label: 'Transactions',
              titleAr: 'المعاملات',
              path: '/(platform)/finance/transactions',
              icon: '🧾',
              available: true,
              description: 'Financial transactions'
            },
            {
              id: 'journal',
              module: 'Finance',
              label: 'Journal',
              titleAr: 'اليومية',
              path: '/(platform)/finance/journal',
              icon: '📖',
              available: true,
              description: 'Journal entries'
            },
            {
              id: 'invoices',
              module: 'Finance',
              label: 'Invoices',
              titleAr: 'الفواتير',
              path: '/(platform)/finance/invoices',
              icon: '📄',
              available: true,
              description: 'Customer invoices'
            },
            {
              id: 'bills',
              module: 'Finance',
              label: 'Bills',
              titleAr: 'الفواتير',
              path: '/(platform)/finance/bills',
              icon: '💳',
              available: true,
              description: 'Vendor bills and payments'
            },
            {
              id: 'budgets',
              module: 'Finance',
              label: 'Budgets',
              titleAr: 'الميزانيات',
              path: '/(platform)/finance/budgets',
              icon: '🎯',
              available: true,
              description: 'Budget planning'
            }
          ]
        },
        {
          id: 'sales',
          module: 'Sales',
          label: 'Sales',
          titleAr: 'المبيعات',
          path: '/(platform)/sales',
          icon: '📈',
          badge: 3,
          available: true,
          children: [
            {
              id: 'quotes',
              module: 'Sales',
              label: 'Quotes',
              titleAr: 'عروض الأسعار',
              path: '/(platform)/sales/quotes',
              icon: '📝',
              available: true,
              description: 'Manage sales quotes and proposals'
            },
            {
              id: 'leads',
              module: 'Sales',
              label: 'Leads',
              titleAr: 'العملاء المحتملين',
              path: '/(platform)/sales/leads',
              icon: '🎯',
              available: true,
              description: 'Track and manage sales leads'
            },
            {
              id: 'deals',
              module: 'Sales',
              label: 'Deals',
              titleAr: 'الصفقات',
              path: '/(platform)/sales/deals',
              icon: '🤝',
              available: true,
              description: 'Monitor deal progress and conversion'
            },
            {
              id: 'pipeline',
              module: 'Sales',
              label: 'Pipeline',
              titleAr: 'خط الأنابيب',
              path: '/(platform)/sales/pipeline',
              icon: '📊',
              available: true,
              description: 'Sales pipeline overview'
            }
          ]
        },
        {
          id: 'crm',
          module: 'CRM',
          label: 'CRM',
          titleAr: 'إدارة العملاء',
          path: '/(platform)/crm',
          icon: '👥',
          badge: 1,
          available: true,
          children: []
        },
        {
          id: 'hr',
          module: 'HR',
          label: 'HR',
          titleAr: 'الموارد البشرية',
          path: '/(platform)/hr',
          icon: '👤',
          badge: 0,
          available: true,
          children: []
        },
        {
          id: 'procurement',
          module: 'Procurement',
          label: 'Procurement',
          titleAr: 'المشتريات',
          path: '/(platform)/procurement',
          icon: '🛒',
          badge: 0,
          available: true,
          children: []
        },
        {
          id: 'motivation',
          module: 'Motivation',
          label: 'Motivation & AI',
          titleAr: 'التحفيز والذكاء الاصطناعي',
          path: '/(platform)/motivation',
          icon: '🎯',
          badge: 'New',
          available: true,
          children: []
        }
      ],
      stats: {
        totalAPIs: 25, // Updated total APIs
        availableAPIs: 22, // Updated available APIs
        modules: 7, // Dashboard, Finance, Sales, CRM, HR, Procurement, Analytics, Motivation
        appName: 'Saudi Business Gate Enterprise',
        appNameAr: 'بوابة الأعمال السعودية المؤسسية',
        tagline: 'The 1st Autonomous Business Gate in the Region',
        taglineAr: 'أول بوابة أعمال ذاتية التشغيل في المنطقة'
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(mockNavigationData);
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate navigation' },
      { status: 500 }
    );
  }
}
