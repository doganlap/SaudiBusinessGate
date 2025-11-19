import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: string[];
  status: 'active' | 'development' | 'planned';
  module: string;
  description: string;
  lastTested?: string;
}

const apiEndpoints: APIEndpoint[] = [
  // Authentication APIs
  {
    id: 'auth-nextauth',
    name: 'NextAuth Authentication',
    path: '/api/auth/[...nextauth]',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'Authentication',
    description: 'OAuth and credential authentication'
  },
  {
    id: 'auth-me',
    name: 'Current User',
    path: '/api/auth/me',
    method: ['GET'],
    status: 'active',
    module: 'Authentication',
    description: 'Get current user information'
  },

  // Finance APIs
  {
    id: 'finance-accounts',
    name: 'Chart of Accounts',
    path: '/api/finance/accounts',
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    status: 'active',
    module: 'Finance',
    description: 'Manage financial accounts'
  },
  {
    id: 'finance-transactions',
    name: 'Transactions',
    path: '/api/finance/transactions',
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    status: 'active',
    module: 'Finance',
    description: 'Financial transaction management'
  },
  {
    id: 'finance-budgets',
    name: 'Budgets',
    path: '/api/finance/budgets',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'Finance',
    description: 'Budget planning and tracking'
  },
  {
    id: 'finance-reports',
    name: 'Financial Reports',
    path: '/api/finance/reports',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'Finance',
    description: 'Generate financial reports'
  },
  {
    id: 'finance-stats',
    name: 'Finance Statistics',
    path: '/api/finance/stats',
    method: ['GET'],
    status: 'active',
    module: 'Finance',
    description: 'Financial KPIs and statistics'
  },

  // Sales APIs
  {
    id: 'sales-leads',
    name: 'Lead Management',
    path: '/api/sales/leads',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'Sales',
    description: 'Manage sales leads and prospects'
  },
  {
    id: 'sales-deals',
    name: 'Deal Management',
    path: '/api/sales/deals',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'Sales',
    description: 'Track sales opportunities'
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    path: '/api/sales/pipeline',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'Sales',
    description: 'Visual sales pipeline management'
  },

  // CRM APIs
  {
    id: 'crm-customers',
    name: 'Customer Management',
    path: '/api/crm/customers',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'CRM',
    description: 'Customer database and profiles'
  },
  {
    id: 'crm-contacts',
    name: 'Contact Management',
    path: '/api/crm/contacts',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'CRM',
    description: 'Contact directory and management'
  },
  {
    id: 'crm-activities',
    name: 'Activity Tracking',
    path: '/api/crm/activities',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'CRM',
    description: 'Customer interaction timeline'
  },

  // HR APIs
  {
    id: 'hr-employees',
    name: 'Employee Management',
    path: '/api/hr/employees',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'HR',
    description: 'Employee directory and management'
  },

  // Procurement APIs
  {
    id: 'procurement-orders',
    name: 'Purchase Orders',
    path: '/api/procurement/orders',
    method: ['GET', 'POST', 'PUT'],
    status: 'active',
    module: 'Procurement',
    description: 'Purchase order management'
  },

  // Analytics APIs
  {
    id: 'analytics-business-kpis',
    name: 'Business KPIs',
    path: '/api/analytics/kpis/business',
    method: ['GET'],
    status: 'active',
    module: 'Analytics',
    description: '50+ real-time business KPIs'
  },

  // Billing APIs
  {
    id: 'billing-plans',
    name: 'Subscription Plans',
    path: '/api/billing/plans',
    method: ['GET'],
    status: 'active',
    module: 'Billing',
    description: 'Available subscription plans'
  },
  {
    id: 'billing-checkout',
    name: 'Checkout Session',
    path: '/api/billing/checkout',
    method: ['POST'],
    status: 'active',
    module: 'Billing',
    description: 'Create Stripe checkout session'
  },
  {
    id: 'billing-portal',
    name: 'Billing Portal',
    path: '/api/billing/portal',
    method: ['POST'],
    status: 'active',
    module: 'Billing',
    description: 'Access customer billing portal'
  },
  {
    id: 'billing-subscription',
    name: 'Subscription Status',
    path: '/api/billing/subscription/[tenantId]',
    method: ['GET'],
    status: 'active',
    module: 'Billing',
    description: 'Get subscription information'
  },
  {
    id: 'billing-activate',
    name: 'Account Activation',
    path: '/api/billing/activate',
    method: ['POST'],
    status: 'active',
    module: 'Billing',
    description: 'Activate user account'
  },

  // Dashboard APIs
  {
    id: 'dashboard-stats',
    name: 'Dashboard Statistics',
    path: '/api/dashboard/stats',
    method: ['GET'],
    status: 'active',
    module: 'Dashboard',
    description: 'Main dashboard statistics'
  },
  {
    id: 'dashboard-activity',
    name: 'Activity Feed',
    path: '/api/dashboard/activity',
    method: ['GET'],
    status: 'active',
    module: 'Dashboard',
    description: 'Recent activity feed'
  },

  // Platform APIs
  {
    id: 'themes-organization',
    name: 'Theme Management',
    path: '/api/themes/[organizationId]',
    method: ['GET', 'PUT'],
    status: 'active',
    module: 'Platform',
    description: 'White-label theme customization'
  },

  // New Analytics APIs
  {
    id: 'analytics-customer',
    name: 'Customer Analytics',
    path: '/api/analytics/customer-analytics',
    method: ['GET'],
    status: 'active',
    module: 'Analytics',
    description: 'Customer behavior and segmentation analysis'
  },
  {
    id: 'analytics-financial',
    name: 'Financial Analytics',
    path: '/api/analytics/financial-analytics',
    method: ['GET'],
    status: 'active',
    module: 'Analytics',
    description: 'Financial forecasting and trend analysis'
  },
  {
    id: 'analytics-ai-insights',
    name: 'AI Insights',
    path: '/api/analytics/ai-insights',
    method: ['GET'],
    status: 'active',
    module: 'Analytics',
    description: 'Machine learning powered insights'
  },

  // New HR APIs
  {
    id: 'hr-payroll',
    name: 'Payroll Management',
    path: '/api/hr/payroll',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'HR',
    description: 'Employee payroll processing'
  },
  {
    id: 'hr-attendance',
    name: 'Attendance Tracking',
    path: '/api/hr/attendance',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'HR',
    description: 'Employee attendance management'
  },

  // New Procurement APIs
  {
    id: 'procurement-vendors',
    name: 'Vendor Management',
    path: '/api/procurement/vendors',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'Procurement',
    description: 'Supplier relationship management'
  },
  {
    id: 'procurement-inventory',
    name: 'Inventory Management',
    path: '/api/procurement/inventory',
    method: ['GET', 'POST'],
    status: 'active',
    module: 'Procurement',
    description: 'Stock level and inventory tracking'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    // Group APIs by module
    const moduleGroups = apiEndpoints.reduce((groups, api) => {
      if (!groups[api.module]) {
        groups[api.module] = [];
      }
      groups[api.module].push(api);
      return groups;
    }, {} as Record<string, APIEndpoint[]>);

    // Calculate statistics
    const totalAPIs = apiEndpoints.length;
    const activeAPIs = apiEndpoints.filter(api => api.status === 'active').length;
    const developmentAPIs = apiEndpoints.filter(api => api.status === 'development').length;
    const plannedAPIs = apiEndpoints.filter(api => api.status === 'planned').length;

    let diagnostics: any = null;
    try {
      const reportPath = path.join(process.cwd(), 'PRODUCTION_VERIFICATION_REPORT.json');
      if (fs.existsSync(reportPath)) {
        const raw = fs.readFileSync(reportPath, 'utf-8');
        const parsed = JSON.parse(raw);
        diagnostics = {
          errors: parsed.errors || [],
          services: parsed.services || [],
          integrations: parsed.integrations || [],
          environment: parsed.environment || [],
          database: parsed.database || []
        };
      }
    } catch {}

    return NextResponse.json({
      success: true,
      summary: {
        totalAPIs,
        activeAPIs,
        developmentAPIs,
        plannedAPIs,
        modules: Object.keys(moduleGroups).length,
        coverage: Math.round((activeAPIs / totalAPIs) * 100)
      },
      modules: moduleGroups,
      endpoints: apiEndpoints,
      problems_and_diagnostics: diagnostics,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching API status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API status' },
      { status: 500 }
    );
  }
}
