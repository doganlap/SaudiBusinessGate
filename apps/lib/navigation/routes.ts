import { 
  BarChart3, DollarSign, Users, TrendingUp, Package, 
  CreditCard, Building2, Settings, UserCheck, Brain,
  Target, Activity, FileText, Calculator, Receipt,
  PiggyBank, ArrowRightLeft, CheckCircle, Briefcase,
  ShoppingCart, Phone, Mail, Calendar, ClipboardList,
  Zap, Globe, Shield, Database, Cloud, MessageSquare,
  Plus, Clock, Star, MapPin, Bot
} from 'lucide-react';

export interface NavigationRoute {
  id: string;
  name: string;
  href: string;
  icon: any;
  description: string;
  category: 'platform' | 'products' | 'services' | 'admin';
  children?: NavigationRoute[];
  badge?: string;
  isNew?: boolean;
  defaultCollapsed?: boolean; // Auto-collapse by default
}

export const navigationRoutes: NavigationRoute[] = [
  // Platform Management
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Main dashboard with overview and quick actions',
    category: 'platform'
  },
  
  // Finance Product - COMPLETE
  {
    id: 'finance',
    name: 'Finance',
    href: '/finance',
    icon: DollarSign,
    description: 'Financial management and accounting',
    category: 'products',
    defaultCollapsed: true,
    children: [
      {
        id: 'finance-dashboard',
        name: 'Dashboard',
        href: '/finance/dashboard',
        icon: BarChart3,
        description: 'Financial overview and KPIs',
        category: 'products'
      },
      {
        id: 'finance-accounts',
        name: 'Chart of Accounts',
        href: '/finance/accounts',
        icon: Building2,
        description: 'Manage chart of accounts',
        category: 'products'
      },
      {
        id: 'finance-transactions',
        name: 'Transactions',
        href: '/finance/transactions',
        icon: ArrowRightLeft,
        description: 'View and manage transactions',
        category: 'products'
      },
      {
        id: 'finance-transactions-new',
        name: 'New Transaction',
        href: '/finance/transactions/new',
        icon: Plus,
        description: 'Create new transaction',
        category: 'products'
      },
      {
        id: 'finance-budgets',
        name: 'Budgets',
        href: '/finance/budgets',
        icon: PiggyBank,
        description: 'Budget planning and tracking',
        category: 'products'
      },
      {
        id: 'finance-reports',
        name: 'Reports',
        href: '/finance/reports',
        icon: FileText,
        description: 'Financial reports and analytics',
        category: 'products'
      },
      {
        id: 'ai-finance-agents',
        name: 'AI Agents',
        href: '/ai-finance-agents',
        icon: Bot,
        description: 'AI Finance Agent Management',
        category: 'products'
      }
    ]
  },

  // Sales Product - COMPLETE
  {
    id: 'sales',
    name: 'Sales',
    href: '/sales',
    icon: TrendingUp,
    description: 'Sales management and pipeline',
    category: 'products',
    defaultCollapsed: true,
    children: [
      {
        id: 'sales-leads',
        name: 'Leads',
        href: '/sales/leads',
        icon: Users,
        description: 'Lead management and scoring',
        category: 'products'
      },
      {
        id: 'sales-deals',
        name: 'Deals',
        href: '/sales/deals',
        icon: Briefcase,
        description: 'Deal tracking and management',
        category: 'products'
      },
      {
        id: 'sales-pipeline',
        name: 'Pipeline',
        href: '/sales/pipeline',
        icon: Target,
        description: 'Visual sales pipeline',
        category: 'products'
      }
    ]
  },

  // CRM Product - COMPLETE
  {
    id: 'crm',
    name: 'CRM',
    href: '/crm',
    icon: Users,
    description: 'Customer relationship management',
    category: 'products',
    defaultCollapsed: true,
    children: [
      {
        id: 'crm-customers',
        name: 'Customers',
        href: '/crm/customers',
        icon: Star,
        description: 'Customer database and profiles',
        category: 'products'
      },
      {
        id: 'crm-contacts',
        name: 'Contacts',
        href: '/crm/contacts',
        icon: Phone,
        description: 'Contact directory and management',
        category: 'products'
      },
      {
        id: 'crm-activities',
        name: 'Activities',
        href: '/crm/activities',
        icon: MessageSquare,
        description: 'Customer interaction timeline',
        category: 'products'
      }
    ]
  },

  // HR Product - PARTIAL
  {
    id: 'hr',
    name: 'HR',
    href: '/hr',
    icon: UserCheck,
    description: 'Human resources management',
    category: 'products',
    defaultCollapsed: true,
    children: [
      {
        id: 'hr-employees',
        name: 'Employees',
        href: '/hr/employees',
        icon: Users,
        description: 'Employee directory and management',
        category: 'products'
      },
      {
        id: 'hr-payroll',
        name: 'Payroll',
        href: '/hr/payroll',
        icon: DollarSign,
        description: 'Payroll processing',
        category: 'products'
      },
      {
        id: 'hr-attendance',
        name: 'Attendance',
        href: '/hr/attendance',
        icon: Clock,
        description: 'Attendance tracking',
        category: 'products'
      }
    ]
  },

  // Procurement Product - PARTIAL
  {
    id: 'procurement',
    name: 'Procurement',
    href: '/procurement',
    icon: Package,
    description: 'Purchase orders and inventory',
    category: 'products',
    defaultCollapsed: true,
    children: [
      {
        id: 'procurement-orders',
        name: 'Purchase Orders',
        href: '/procurement/orders',
        icon: ShoppingCart,
        description: 'Purchase order management',
        category: 'products'
      },
      {
        id: 'procurement-vendors',
        name: 'Vendors',
        href: '/procurement/vendors',
        icon: Building2,
        description: 'Vendor management',
        category: 'products'
      },
      {
        id: 'procurement-inventory',
        name: 'Inventory',
        href: '/procurement/inventory',
        icon: Package,
        description: 'Inventory tracking',
        category: 'products'
      }
    ]
  },

  // Analytics Service - PARTIAL
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'AI-powered analytics and insights',
    category: 'services',
    children: [
      {
        id: 'analytics-business-kpis',
        name: 'Business KPIs',
        href: '/analytics/business-kpis',
        icon: Target,
        description: '50+ real-time business KPIs',
        category: 'services'
      },
      {
        id: 'analytics-customer',
        name: 'Customer Analytics',
        href: '/analytics/customer-analytics',
        icon: Users,
        description: 'Customer behavior analysis',
        category: 'services'
      },
      {
        id: 'analytics-financial',
        name: 'Financial Analytics',
        href: '/analytics/financial-analytics',
        icon: DollarSign,
        description: 'Financial forecasting and trends',
        category: 'services'
      },
      {
        id: 'analytics-ai-insights',
        name: 'AI Insights',
        href: '/analytics/ai-insights',
        icon: Brain,
        description: 'Machine learning insights',
        category: 'services'
      }
    ]
  },

  // Billing Service - COMPLETE
  {
    id: 'billing',
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    description: 'Subscription and payment management',
    category: 'services'
  },

  // Platform Admin - COMPLETE
  {
    id: 'platform',
    name: 'Platform',
    href: '/platform',
    icon: Settings,
    description: 'Multi-tenant platform administration',
    category: 'admin',
    children: [
      {
        id: 'platform-users',
        name: 'Users',
        href: '/platform/users',
        icon: Users,
        description: 'Multi-tenant user management',
        category: 'admin'
      },
      {
        id: 'platform-tenants',
        name: 'Tenants',
        href: '/platform/tenants',
        icon: Building2,
        description: 'Tenant organization management',
        category: 'admin',
        badge: 'Demo'
      },
      {
        id: 'platform-settings',
        name: 'Settings',
        href: '/platform/settings',
        icon: Settings,
        description: 'Platform configuration',
        category: 'admin',
        badge: 'Demo'
      },
      {
        id: 'platform-api-status',
        name: 'API Status',
        href: '/platform/api-status',
        icon: Database,
        description: 'Monitor API integration status',
        category: 'admin',
        isNew: true
      }
    ]
  },

  // Development & Testing
  {
    id: 'test-connections',
    name: 'API Testing',
    href: '/test-connections',
    icon: Database,
    description: 'Test API connections and endpoints',
    category: 'admin',
    badge: 'Dev'
  }
];

// Get all routes including children
export function getAllRoutes(): NavigationRoute[] {
  const allRoutes: NavigationRoute[] = [];
  
  navigationRoutes.forEach(route => {
    allRoutes.push(route);
    if (route.children) {
      allRoutes.push(...route.children);
    }
  });
  
  return allRoutes;
}

// Get routes by category
export function getRoutesByCategory(category: string): NavigationRoute[] {
  return navigationRoutes.filter(route => route.category === category);
}

// Find route by ID
export function findRouteById(id: string): NavigationRoute | undefined {
  const allRoutes = getAllRoutes();
  return allRoutes.find(route => route.id === id);
}

// Find route by href
export function findRouteByHref(href: string): NavigationRoute | undefined {
  const allRoutes = getAllRoutes();
  return allRoutes.find(route => route.href === href);
}

// Get breadcrumbs for a route
export function getBreadcrumbs(href: string): NavigationRoute[] {
  const breadcrumbs: NavigationRoute[] = [];
  const parts = href.split('/').filter(Boolean);
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath += `/${part}`;
    const route = findRouteByHref(currentPath);
    if (route) {
      breadcrumbs.push(route);
    }
  });
  
  return breadcrumbs;
}
