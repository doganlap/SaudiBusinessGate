/**
 * Navigation Generator for Multi-tenant System
 * Saudi Store - Dynamic Menu Generation
 * 
 * Generates navigation menus based on:
 * - User permissions
 * - Enabled modules
 * - Subscription tier
 * - Team membership
 */

import DynamicRouter, { UserContext } from './DynamicRouter';

export interface NavigationItem {
  id: string;
  label: string;
  labelAr: string;
  path: string;
  icon: string;
  module: string;
  badge?: string | number;
  children?: NavigationItem[];
  isExternal?: boolean;
  requiresUpgrade?: boolean;
  subscriptionTier?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  labelAr: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// =====================================================
// MODULE METADATA
// =====================================================

const MODULE_METADATA: Record<
  string,
  {
    labelEn: string;
    labelAr: string;
    icon: string;
    category: string;
    sortOrder: number;
  }
> = {
  dashboard: {
    labelEn: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: 'LayoutDashboard',
    category: 'core',
    sortOrder: 1,
  },
  crm: {
    labelEn: 'CRM',
    labelAr: 'إدارة العملاء',
    icon: 'Users',
    category: 'operations',
    sortOrder: 2,
  },
  sales: {
    labelEn: 'Sales',
    labelAr: 'المبيعات',
    icon: 'TrendingUp',
    category: 'operations',
    sortOrder: 3,
  },
  finance: {
    labelEn: 'Finance',
    labelAr: 'المالية',
    icon: 'DollarSign',
    category: 'finance',
    sortOrder: 4,
  },
  hr: {
    labelEn: 'HR',
    labelAr: 'الموارد البشرية',
    icon: 'UserCheck',
    category: 'hr',
    sortOrder: 5,
  },
  procurement: {
    labelEn: 'Procurement',
    labelAr: 'المشتريات',
    icon: 'ShoppingCart',
    category: 'operations',
    sortOrder: 6,
  },
  grc: {
    labelEn: 'GRC',
    labelAr: 'الحوكمة والامتثال',
    icon: 'Shield',
    category: 'governance',
    sortOrder: 7,
  },
  analytics: {
    labelEn: 'Analytics',
    labelAr: 'التحليلات',
    icon: 'BarChart',
    category: 'analytics',
    sortOrder: 8,
  },
  reports: {
    labelEn: 'Reports',
    labelAr: 'التقارير',
    icon: 'FileText',
    category: 'analytics',
    sortOrder: 9,
  },
  'ai-agents': {
    labelEn: 'AI Agents',
    labelAr: 'الوكلاء الذكيون',
    icon: 'Bot',
    category: 'ai',
    sortOrder: 10,
  },
  workflows: {
    labelEn: 'Workflows',
    labelAr: 'سير العمل',
    icon: 'GitBranch',
    category: 'automation',
    sortOrder: 11,
  },
  integrations: {
    labelEn: 'Integrations',
    labelAr: 'التكاملات',
    icon: 'Plug',
    category: 'integration',
    sortOrder: 12,
  },
  billing: {
    labelEn: 'Billing',
    labelAr: 'الفواتير',
    icon: 'CreditCard',
    category: 'finance',
    sortOrder: 13,
  },
  monitoring: {
    labelEn: 'Monitoring',
    labelAr: 'المراقبة',
    icon: 'Activity',
    category: 'tools',
    sortOrder: 14,
  },
  teams: {
    labelEn: 'Teams',
    labelAr: 'الفرق',
    icon: 'UsersRound',
    category: 'core',
    sortOrder: 15,
  },
  reseller: {
    labelEn: 'Reseller Portal',
    labelAr: 'بوابة الموزع',
    icon: 'Store',
    category: 'reseller',
    sortOrder: 16,
  },
  settings: {
    labelEn: 'Settings',
    labelAr: 'الإعدادات',
    icon: 'Settings',
    category: 'core',
    sortOrder: 99,
  },
};

// =====================================================
// NAVIGATION GENERATOR CLASS
// =====================================================

export class NavigationGenerator {
  private userContext: UserContext;
  private router: DynamicRouter;

  constructor(userContext: UserContext) {
    this.userContext = userContext;
    this.router = new DynamicRouter(userContext);
  }

  /**
   * Generate complete navigation structure
   */
  generateNavigation(): NavigationGroup[] {
    const groups: NavigationGroup[] = [];

    // Group 1: Core modules (Dashboard, Teams, etc.)
    const coreItems = this.generateModuleItems('core');
    if (coreItems.length > 0) {
      groups.push({
        id: 'core',
        label: 'Core',
        labelAr: 'الأساسي',
        items: coreItems,
        defaultOpen: true,
      });
    }

    // Group 2: Operations (CRM, Sales, Procurement)
    const operationsItems = this.generateModuleItems('operations');
    if (operationsItems.length > 0) {
      groups.push({
        id: 'operations',
        label: 'Operations',
        labelAr: 'العمليات',
        items: operationsItems,
        collapsible: true,
        defaultOpen: true,
      });
    }

    // Group 3: Finance & HR
    const financeItems = this.generateModuleItems('finance');
    const hrItems = this.generateModuleItems('hr');
    if (financeItems.length > 0 || hrItems.length > 0) {
      groups.push({
        id: 'finance-hr',
        label: 'Finance & HR',
        labelAr: 'المالية والموارد البشرية',
        items: [...financeItems, ...hrItems],
        collapsible: true,
        defaultOpen: false,
      });
    }

    // Group 4: Governance
    const governanceItems = this.generateModuleItems('governance');
    if (governanceItems.length > 0) {
      groups.push({
        id: 'governance',
        label: 'Governance',
        labelAr: 'الحوكمة',
        items: governanceItems,
        collapsible: true,
        defaultOpen: false,
      });
    }

    // Group 5: Analytics & Reports
    const analyticsItems = this.generateModuleItems('analytics');
    if (analyticsItems.length > 0) {
      groups.push({
        id: 'analytics',
        label: 'Analytics',
        labelAr: 'التحليلات',
        items: analyticsItems,
        collapsible: true,
        defaultOpen: false,
      });
    }

    // Group 6: AI & Automation
    const aiItems = this.generateModuleItems('ai');
    const automationItems = this.generateModuleItems('automation');
    if (aiItems.length > 0 || automationItems.length > 0) {
      groups.push({
        id: 'ai-automation',
        label: 'AI & Automation',
        labelAr: 'الذكاء الاصطناعي والأتمتة',
        items: [...aiItems, ...automationItems],
        collapsible: true,
        defaultOpen: false,
      });
    }

    // Group 7: Integration & Tools
    const integrationItems = this.generateModuleItems('integration');
    const toolItems = this.generateModuleItems('tools');
    if (integrationItems.length > 0 || toolItems.length > 0) {
      groups.push({
        id: 'tools',
        label: 'Tools & Integration',
        labelAr: 'الأدوات والتكامل',
        items: [...integrationItems, ...toolItems],
        collapsible: true,
        defaultOpen: false,
      });
    }

    // Group 8: Reseller Portal (if applicable)
    if (this.userContext.isReseller) {
      const resellerItems = this.generateModuleItems('reseller');
      if (resellerItems.length > 0) {
        groups.push({
          id: 'reseller',
          label: 'Reseller',
          labelAr: 'الموزع',
          items: resellerItems,
          collapsible: false,
          defaultOpen: true,
        });
      }
    }

    return groups;
  }

  /**
   * Generate flat navigation (for mobile, breadcrumbs, etc.)
   */
  generateFlatNavigation(): NavigationItem[] {
    const allItems: NavigationItem[] = [];

    for (const module of this.userContext.enabledModules) {
      const metadata = MODULE_METADATA[module];
      if (!metadata) continue;

      const access = this.router.canAccessRoute(`/${module}`);
      if (!access.allowed) continue;

      allItems.push({
        id: module,
        label: metadata.labelEn,
        labelAr: metadata.labelAr,
        path: this.router.buildRoute(`/${module}`),
        icon: metadata.icon,
        module,
      });
    }

    // Sort by sort order
    return allItems.sort(
      (a, b) =>
        (MODULE_METADATA[a.module]?.sortOrder || 999) -
        (MODULE_METADATA[b.module]?.sortOrder || 999)
    );
  }

  /**
   * Generate breadcrumb navigation
   */
  generateBreadcrumbs(currentPath: string): Array<{
    label: string;
    labelAr: string;
    path: string;
  }> {
    const breadcrumbs: Array<{
      label: string;
      labelAr: string;
      path: string;
    }> = [];

    // Home/Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      path: this.router.buildRoute('/dashboard'),
    });

    // Parse current path
    const segments = currentPath.split('/').filter(Boolean);

    // Remove tenant slug if present
    if (segments[0] === this.userContext.tenantSlug) {
      segments.shift();
    }

    let currentSegmentPath = '';

    for (const segment of segments) {
      // Skip dynamic params (e.g., :id)
      if (segment.match(/^[a-f0-9-]{36}$/)) {
        breadcrumbs.push({
          label: 'Details',
          labelAr: 'التفاصيل',
          path: currentPath,
        });
        continue;
      }

      currentSegmentPath += `/${segment}`;

      // Check if it's a module
      const metadata = MODULE_METADATA[segment];

      breadcrumbs.push({
        label: metadata
          ? metadata.labelEn
          : segment.charAt(0).toUpperCase() + segment.slice(1),
        labelAr: metadata ? metadata.labelAr : segment,
        path: this.router.buildRoute(currentSegmentPath),
      });
    }

    return breadcrumbs;
  }

  /**
   * Generate user menu (profile, settings, logout)
   */
  generateUserMenu(): NavigationItem[] {
    return [
      {
        id: 'profile',
        label: 'Profile',
        labelAr: 'الملف الشخصي',
        path: this.router.buildRoute('/settings/profile'),
        icon: 'User',
        module: 'settings',
      },
      {
        id: 'team-settings',
        label: 'Team Settings',
        labelAr: 'إعدادات الفريق',
        path: this.router.buildRoute('/settings/teams'),
        icon: 'UsersRound',
        module: 'settings',
      },
      {
        id: 'billing',
        label: 'Billing',
        labelAr: 'الفواتير',
        path: this.router.buildRoute('/billing'),
        icon: 'CreditCard',
        module: 'billing',
      },
      {
        id: 'settings',
        label: 'Settings',
        labelAr: 'الإعدادات',
        path: this.router.buildRoute('/settings'),
        icon: 'Settings',
        module: 'settings',
      },
      {
        id: 'logout',
        label: 'Logout',
        labelAr: 'تسجيل الخروج',
        path: '/api/auth/logout',
        icon: 'LogOut',
        module: 'auth',
      },
    ];
  }

  /**
   * Generate quick actions (+ button menu)
   */
  generateQuickActions(): NavigationItem[] {
    const actions: NavigationItem[] = [];

    // CRM: New customer
    if (this.canAccess('crm', 'crm:write')) {
      actions.push({
        id: 'new-customer',
        label: 'New Customer',
        labelAr: 'عميل جديد',
        path: this.router.buildRoute('/crm/customers/new'),
        icon: 'UserPlus',
        module: 'crm',
      });
    }

    // Sales: New deal
    if (this.canAccess('sales', 'sales:write')) {
      actions.push({
        id: 'new-deal',
        label: 'New Deal',
        labelAr: 'صفقة جديدة',
        path: this.router.buildRoute('/sales/deals/new'),
        icon: 'Plus',
        module: 'sales',
      });
    }

    // Finance: New invoice
    if (this.canAccess('finance', 'finance:write')) {
      actions.push({
        id: 'new-invoice',
        label: 'New Invoice',
        labelAr: 'فاتورة جديدة',
        path: this.router.buildRoute('/finance/invoices/new'),
        icon: 'FileText',
        module: 'finance',
      });
    }

    // Teams: Create team
    if (this.userContext.roleLevel >= 7) {
      actions.push({
        id: 'new-team',
        label: 'New Team',
        labelAr: 'فريق جديد',
        path: this.router.buildRoute('/teams/new'),
        icon: 'UsersRound',
        module: 'teams',
      });
    }

    return actions;
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private generateModuleItems(category: string): NavigationItem[] {
    const items: NavigationItem[] = [];

    for (const module of this.userContext.enabledModules) {
      const metadata = MODULE_METADATA[module];
      if (!metadata || metadata.category !== category) continue;

      const access = this.router.canAccessRoute(`/${module}`);

      // If not accessible, check if upgrade is available
      if (!access.allowed && access.reason?.includes('Upgrade')) {
        items.push({
          id: module,
          label: metadata.labelEn,
          labelAr: metadata.labelAr,
          path: '/billing?upgrade=true',
          icon: metadata.icon,
          module,
          requiresUpgrade: true,
          badge: '⬆️',
        });
        continue;
      }

      if (!access.allowed) continue;

      // Generate sub-menu items
      const children = this.generateModuleChildren(module);

      items.push({
        id: module,
        label: metadata.labelEn,
        labelAr: metadata.labelAr,
        path: this.router.buildRoute(`/${module}`),
        icon: metadata.icon,
        module,
        children: children.length > 0 ? children : undefined,
      });
    }

    // Sort by sort order
    return items.sort(
      (a, b) =>
        (MODULE_METADATA[a.module]?.sortOrder || 999) -
        (MODULE_METADATA[b.module]?.sortOrder || 999)
    );
  }

  private generateModuleChildren(module: string): NavigationItem[] {
    // Define sub-routes for each module
    const moduleChildren: Record<string, Array<{ path: string; label: string; labelAr: string }>> =
      {
        crm: [
          { path: '/crm/customers', label: 'Customers', labelAr: 'العملاء' },
          { path: '/crm/leads', label: 'Leads', labelAr: 'الفرص' },
          { path: '/crm/contacts', label: 'Contacts', labelAr: 'جهات الاتصال' },
        ],
        sales: [
          { path: '/sales/pipeline', label: 'Pipeline', labelAr: 'خط المبيعات' },
          { path: '/sales/deals', label: 'Deals', labelAr: 'الصفقات' },
          { path: '/sales/quotes', label: 'Quotes', labelAr: 'عروض الأسعار' },
        ],
        finance: [
          { path: '/finance/invoices', label: 'Invoices', labelAr: 'الفواتير' },
          { path: '/finance/expenses', label: 'Expenses', labelAr: 'المصروفات' },
          { path: '/finance/reports', label: 'Reports', labelAr: 'التقارير' },
        ],
        hr: [
          { path: '/hr/employees', label: 'Employees', labelAr: 'الموظفين' },
          { path: '/hr/payroll', label: 'Payroll', labelAr: 'الرواتب' },
          { path: '/hr/leave', label: 'Leave', labelAr: 'الإجازات' },
        ],
        teams: this.userContext.teams.map((team) => ({
          path: `/teams/${team.slug}`,
          label: team.slug,
          labelAr: team.slug,
        })),
      };

    const children: NavigationItem[] = [];
    const childRoutes = moduleChildren[module] || [];

    for (const child of childRoutes) {
      const access = this.router.canAccessRoute(child.path);
      if (!access.allowed) continue;

      children.push({
        id: `${module}-${child.path.split('/').pop()}`,
        label: child.label,
        labelAr: child.labelAr,
        path: this.router.buildRoute(child.path),
        icon: 'Circle',
        module,
      });
    }

    return children;
  }

  private canAccess(module: string, permission: string): boolean {
    return (
      this.userContext.enabledModules.includes(module) &&
      this.router.canAccessRoute(`/${module}`).allowed &&
      (this.userContext.permissions.includes(permission) ||
        this.userContext.permissions.includes('*:*') ||
        this.userContext.permissions.includes(`${module}:*`))
    );
  }
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

export async function generateNavigationForUser(
  userContext: UserContext
): Promise<NavigationGroup[]> {
  const generator = new NavigationGenerator(userContext);
  return generator.generateNavigation();
}

export async function generateBreadcrumbsForPath(
  userContext: UserContext,
  currentPath: string
): Promise<Array<{ label: string; labelAr: string; path: string }>> {
  const generator = new NavigationGenerator(userContext);
  return generator.generateBreadcrumbs(currentPath);
}

export default NavigationGenerator;
