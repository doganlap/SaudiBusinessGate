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
          path: '/dashboard',
          icon: '📊',
          badge: 0,
          available: true,
          children: []
        },
        {
          id: 'finance',
          module: 'Finance',
          label: 'Finance',
          path: '/finance',
          icon: '💰',
          badge: 12, // Updated badge count for finance module
          available: true,
          children: [
            {
              id: 'finance-dashboard',
              module: 'Finance',
              label: 'Finance Dashboard',
              path: '/finance/dashboard',
              icon: '📈',
              available: true,
              description: 'Comprehensive financial overview with charts and KPIs'
            },
            {
              id: 'accounts',
              module: 'Finance',
              label: 'Chart of Accounts',
              path: '/finance/accounts',
              icon: '📚',
              available: true,
              description: 'Manage financial accounts and account structures'
            },
            {
              id: 'transactions',
              module: 'Finance',
              label: 'Transactions',
              path: '/finance/transactions',
              icon: '🧾',
              available: true,
              description: 'View and manage financial transactions'
            },
            {
              id: 'journal-entries',
              module: 'Finance',
              label: 'Journal Entries',
              path: '/finance/journal',
              icon: '📖',
              available: true,
              description: 'Double-entry bookkeeping and journal management'
            },
            {
              id: 'invoices',
              module: 'Finance',
              label: 'Invoices',
              path: '/finance/invoices',
              icon: '📄',
              available: true,
              description: 'Create and manage customer invoices'
            },
            {
              id: 'bills',
              module: 'Finance',
              label: 'Bills & Payments',
              path: '/finance/bills',
              icon: '💳',
              available: true,
              description: 'Manage vendor bills and payments'
            },
            {
              id: 'budgets',
              module: 'Finance',
              label: 'Budgets',
              path: '/finance/budgets',
              icon: '🎯',
              available: true,
              description: 'Financial planning and budget management'
            },
            {
              id: 'reports',
              module: 'Finance',
              label: 'Financial Reports',
              path: '/finance/reports',
              icon: '📊',
              available: true,
              description: 'Generate financial statements and reports'
            },
            {
              id: 'cost-centers',
              module: 'Finance',
              label: 'Cost Centers',
              path: '/finance/cost-centers',
              icon: '🏢',
              available: true,
              description: 'Track expenses by department and cost centers'
            },
            {
              id: 'banking',
              module: 'Finance',
              label: 'Banking',
              path: '/finance/banking',
              icon: '🏦',
              available: true,
              description: 'Bank account reconciliation and management'
            },
            {
              id: 'tax',
              module: 'Finance',
              label: 'Tax Management',
              path: '/finance/tax',
              icon: '🧮',
              available: true,
              description: 'Tax calculations and compliance'
            },
            {
              id: 'analytics',
              module: 'Finance',
              label: 'Financial Analytics',
              path: '/finance/analytics',
              icon: '🔍',
              available: true,
              description: 'Advanced financial analysis and insights'
            }
          ]
        },
        {
          id: 'crm',
          module: 'CRM',
          label: 'CRM',
          path: '/crm',
          icon: '👥',
          badge: 1,
          available: true,
          children: []
        },
        {
          id: 'hr',
          module: 'HR',
          label: 'HR',
          path: '/hr',
          icon: '👤',
          badge: 0,
          available: true,
          children: []
        },
        {
          id: 'analytics',
          module: 'Analytics',
          label: 'Analytics',
          path: '/analytics',
          icon: '📈',
          badge: 5,
          available: true,
          children: []
        }
      ],
      stats: {
        totalAPIs: 25, // Updated total APIs
        availableAPIs: 22, // Updated available APIs
        modules: 5
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
