/**
 * Dynamic Router for Multi-tenant, Multi-team, Multi-role System
 * Saudi Store - The 1st Autonomous Store in the World
 * 
 * Features:
 * - Dynamic module loading based on subscription
 * - Role-based route access control
 * - Team-based routing
 * - White-label custom domain support
 * - Reseller client management
 */

import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// TYPES
// =====================================================

export interface UserContext {
  id: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
  roleLevel: number;
  permissions: string[];
  teams: Array<{
    id: string;
    slug: string;
    roleId: string;
  }>;
  enabledModules: string[];
  subscriptionTier: string;
  isWhiteLabel: boolean;
  customDomain?: string;
  isReseller: boolean;
}

export interface RouteConfig {
  path: string;
  module: string;
  requiredPermission?: string;
  minimumRoleLevel?: number;
  teamRequired?: boolean;
  subscriptionTiers?: string[];
}

export interface DynamicRoute {
  pattern: RegExp;
  module: string;
  handler: string;
  permissions: string[];
}

// =====================================================
// MODULE ROUTES CONFIGURATION
// =====================================================

export const MODULE_ROUTES: Record<string, RouteConfig[]> = {
  // Dashboard - Available to all
  dashboard: [
    {
      path: '/dashboard',
      module: 'dashboard',
      minimumRoleLevel: 1,
    },
    {
      path: '/dashboard/overview',
      module: 'dashboard',
      minimumRoleLevel: 1,
    },
  ],

  // CRM Module
  crm: [
    {
      path: '/crm',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/crm/customers',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/crm/leads',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/crm/customers/:id',
      module: 'crm',
      requiredPermission: 'crm:read',
      minimumRoleLevel: 3,
    },
  ],

  // Sales Module
  sales: [
    {
      path: '/sales',
      module: 'sales',
      requiredPermission: 'sales:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/sales/pipeline',
      module: 'sales',
      requiredPermission: 'sales:read',
      minimumRoleLevel: 3,
    },
    {
      path: '/sales/deals',
      module: 'sales',
      requiredPermission: 'sales:write',
      minimumRoleLevel: 5,
    },
  ],

  // Finance Module
  finance: [
    {
      path: '/finance',
      module: 'finance',
      requiredPermission: 'finance:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
    {
      path: '/finance/invoices',
      module: 'finance',
      requiredPermission: 'finance:read',
      minimumRoleLevel: 5,
    },
    {
      path: '/finance/expenses',
      module: 'finance',
      requiredPermission: 'finance:write',
      minimumRoleLevel: 6,
    },
  ],

  // HR Module
  hr: [
    {
      path: '/hr',
      module: 'hr',
      requiredPermission: 'hr:read',
      minimumRoleLevel: 5,
    },
    {
      path: '/hr/employees',
      module: 'hr',
      requiredPermission: 'hr:read',
      minimumRoleLevel: 5,
    },
    {
      path: '/hr/payroll',
      module: 'hr',
      requiredPermission: 'hr:manage',
      minimumRoleLevel: 7,
    },
  ],

  // Procurement Module
  procurement: [
    {
      path: '/procurement',
      module: 'procurement',
      requiredPermission: 'procurement:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
    {
      path: '/procurement/orders',
      module: 'procurement',
      requiredPermission: 'procurement:write',
      minimumRoleLevel: 5,
    },
  ],

  // GRC Module
  grc: [
    {
      path: '/grc',
      module: 'grc',
      requiredPermission: 'grc:read',
      minimumRoleLevel: 6,
      subscriptionTiers: ['enterprise', 'whitelabel'],
    },
    {
      path: '/grc/risks',
      module: 'grc',
      requiredPermission: 'grc:manage',
      minimumRoleLevel: 7,
    },
  ],

  // Analytics Module
  analytics: [
    {
      path: '/analytics',
      module: 'analytics',
      requiredPermission: 'analytics:read',
      minimumRoleLevel: 5,
    },
    {
      path: '/analytics/reports',
      module: 'analytics',
      requiredPermission: 'reports:read',
      minimumRoleLevel: 5,
    },
  ],

  // AI Agents Module
  'ai-agents': [
    {
      path: '/ai-agents',
      module: 'ai-agents',
      requiredPermission: 'ai:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
    {
      path: '/ai-agents/create',
      module: 'ai-agents',
      requiredPermission: 'ai:manage',
      minimumRoleLevel: 7,
    },
  ],

  // Workflows Module
  workflows: [
    {
      path: '/workflows',
      module: 'workflows',
      requiredPermission: 'workflows:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
  ],

  // Integrations Module
  integrations: [
    {
      path: '/integrations',
      module: 'integrations',
      requiredPermission: 'integrations:read',
      minimumRoleLevel: 5,
      subscriptionTiers: ['professional', 'enterprise', 'whitelabel'],
    },
  ],

  // Billing Module
  billing: [
    {
      path: '/billing',
      module: 'billing',
      requiredPermission: 'billing:read',
      minimumRoleLevel: 7,
    },
    {
      path: '/billing/subscriptions',
      module: 'billing',
      requiredPermission: 'billing:manage',
      minimumRoleLevel: 9,
    },
  ],

  // Monitoring Module
  monitoring: [
    {
      path: '/monitoring',
      module: 'monitoring',
      requiredPermission: 'monitoring:read',
      minimumRoleLevel: 7,
      subscriptionTiers: ['enterprise', 'whitelabel'],
    },
  ],

  // Team-specific routes
  teams: [
    {
      path: '/teams/:teamSlug',
      module: 'teams',
      teamRequired: true,
      minimumRoleLevel: 3,
    },
    {
      path: '/teams/:teamSlug/dashboard',
      module: 'teams',
      teamRequired: true,
      minimumRoleLevel: 3,
    },
  ],

  // Reseller routes
  reseller: [
    {
      path: '/reseller',
      module: 'reseller',
      requiredPermission: 'reseller:access',
      minimumRoleLevel: 8,
    },
    {
      path: '/reseller/clients',
      module: 'reseller',
      requiredPermission: 'clients:manage',
      minimumRoleLevel: 8,
    },
    {
      path: '/reseller/commissions',
      module: 'reseller',
      requiredPermission: 'reseller:read',
      minimumRoleLevel: 8,
    },
  ],
};

// =====================================================
// ROUTE MATCHING & VALIDATION
// =====================================================

export class DynamicRouter {
  private userContext: UserContext;

  constructor(userContext: UserContext) {
    this.userContext = userContext;
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(routePath: string): {
    allowed: boolean;
    reason?: string;
    redirect?: string;
  } {
    // Find matching route config
    const routeConfig = this.findRouteConfig(routePath);

    if (!routeConfig) {
      return {
        allowed: false,
        reason: 'Route not found',
        redirect: '/dashboard',
      };
    }

    // Check 1: Module enabled in subscription
    if (!this.userContext.enabledModules.includes(routeConfig.module)) {
      return {
        allowed: false,
        reason: `Module ${routeConfig.module} not enabled in your subscription`,
        redirect: '/billing?upgrade=true',
      };
    }

    // Check 2: Subscription tier requirement
    if (
      routeConfig.subscriptionTiers &&
      !routeConfig.subscriptionTiers.includes(this.userContext.subscriptionTier)
    ) {
      return {
        allowed: false,
        reason: 'Upgrade required to access this feature',
        redirect: '/billing?upgrade=true',
      };
    }

    // Check 3: Role level
    if (
      routeConfig.minimumRoleLevel &&
      this.userContext.roleLevel < routeConfig.minimumRoleLevel
    ) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        redirect: '/dashboard',
      };
    }

    // Check 4: Specific permission
    if (routeConfig.requiredPermission) {
      if (!this.hasPermission(routeConfig.requiredPermission)) {
        return {
          allowed: false,
          reason: 'Missing required permission',
          redirect: '/dashboard',
        };
      }
    }

    // Check 5: Team requirement
    if (routeConfig.teamRequired) {
      const teamSlug = this.extractTeamSlug(routePath);
      if (!teamSlug || !this.isInTeam(teamSlug)) {
        return {
          allowed: false,
          reason: 'Not a member of this team',
          redirect: '/teams',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get all accessible routes for current user
   */
  getAccessibleRoutes(): string[] {
    const accessibleRoutes: string[] = [];

    for (const module of this.userContext.enabledModules) {
      const moduleRoutes = MODULE_ROUTES[module] || [];

      for (const route of moduleRoutes) {
        const access = this.canAccessRoute(route.path);
        if (access.allowed) {
          accessibleRoutes.push(route.path);
        }
      }
    }

    return accessibleRoutes;
  }

  /**
   * Generate navigation menu based on accessible routes
   */
  generateNavigationMenu(): Array<{
    label: string;
    path: string;
    icon?: string;
    module: string;
    children?: Array<{ label: string; path: string }>;
  }> {
    const menu: any[] = [];

    for (const module of this.userContext.enabledModules) {
      const moduleRoutes = MODULE_ROUTES[module] || [];
      const accessibleModuleRoutes = moduleRoutes.filter(
        (route) => this.canAccessRoute(route.path).allowed
      );

      if (accessibleModuleRoutes.length > 0) {
        // Main module route (e.g., /crm)
        const mainRoute = accessibleModuleRoutes.find(
          (r) => r.path === `/${module}`
        );

        if (mainRoute) {
          menu.push({
            label: this.getModuleLabel(module),
            path: mainRoute.path,
            icon: this.getModuleIcon(module),
            module,
            children: accessibleModuleRoutes
              .filter((r) => r.path !== `/${module}` && !r.path.includes(':'))
              .map((r) => ({
                label: this.getRouteLabel(r.path),
                path: r.path,
              })),
          });
        }
      }
    }

    return menu;
  }

  /**
   * Build dynamic route based on tenant/team context
   */
  buildRoute(routePath: string, params?: Record<string, string>): string {
    let finalPath = routePath;

    // Replace team slug if needed
    if (params?.teamSlug) {
      finalPath = finalPath.replace(':teamSlug', params.teamSlug);
    }

    // Replace other params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        finalPath = finalPath.replace(`:${key}`, value);
      }
    }

    // Add tenant context for white-label
    if (this.userContext.isWhiteLabel && this.userContext.customDomain) {
      // Custom domain routing handled by middleware
      return finalPath;
    }

    // Standard multi-tenant routing
    return `/${this.userContext.tenantSlug}${finalPath}`;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private findRouteConfig(routePath: string): RouteConfig | null {
    for (const moduleRoutes of Object.values(MODULE_ROUTES)) {
      for (const route of moduleRoutes) {
        if (this.matchRoute(route.path, routePath)) {
          return route;
        }
      }
    }
    return null;
  }

  private matchRoute(pattern: string, path: string): boolean {
    // Convert route pattern to regex (e.g., /crm/customers/:id -> /crm/customers/[^/]+)
    const regexPattern = pattern.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  private hasPermission(permission: string): boolean {
    // Check for wildcard permission
    if (this.userContext.permissions.includes('*:*')) {
      return true;
    }

    // Check exact permission
    if (this.userContext.permissions.includes(permission)) {
      return true;
    }

    // Check module wildcard (e.g., crm:*)
    const [module, action] = permission.split(':');
    if (this.userContext.permissions.includes(`${module}:*`)) {
      return true;
    }

    return false;
  }

  private extractTeamSlug(routePath: string): string | null {
    const match = routePath.match(/\/teams\/([^/]+)/);
    return match ? match[1] : null;
  }

  private isInTeam(teamSlug: string): boolean {
    return this.userContext.teams.some((team) => team.slug === teamSlug);
  }

  private getModuleLabel(module: string): string {
    // TODO: Load from translations
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      crm: 'CRM',
      sales: 'Sales',
      finance: 'Finance',
      hr: 'HR',
      procurement: 'Procurement',
      grc: 'GRC',
      analytics: 'Analytics',
      'ai-agents': 'AI Agents',
      workflows: 'Workflows',
      integrations: 'Integrations',
      billing: 'Billing',
      monitoring: 'Monitoring',
      teams: 'Teams',
      reseller: 'Reseller Portal',
    };
    return labels[module] || module;
  }

  private getModuleIcon(module: string): string {
    // Icon names (can use Lucide icons)
    const icons: Record<string, string> = {
      dashboard: 'LayoutDashboard',
      crm: 'Users',
      sales: 'TrendingUp',
      finance: 'DollarSign',
      hr: 'UserCheck',
      procurement: 'ShoppingCart',
      grc: 'Shield',
      analytics: 'BarChart',
      'ai-agents': 'Bot',
      workflows: 'GitBranch',
      integrations: 'Plug',
      billing: 'CreditCard',
      monitoring: 'Activity',
      teams: 'UsersRound',
      reseller: 'Store',
    };
    return icons[module] || 'Circle';
  }

  private getRouteLabel(routePath: string): string {
    // Extract last segment
    const segments = routePath.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// =====================================================
// MIDDLEWARE INTEGRATION
// =====================================================

export async function dynamicRouterMiddleware(
  request: NextRequest,
  userContext: UserContext
): Promise<NextResponse> {
  const router = new DynamicRouter(userContext);
  const pathname = request.nextUrl.pathname;

  // Extract route without tenant prefix
  const routePath = pathname.replace(
    new RegExp(`^/${userContext.tenantSlug}`),
    ''
  );

  // Check access
  const access = router.canAccessRoute(routePath || '/dashboard');

  if (!access.allowed) {
    // Redirect to appropriate page
    const redirectUrl = new URL(
      access.redirect || '/dashboard',
      request.url
    );
    redirectUrl.searchParams.set('error', access.reason || 'Access denied');

    return NextResponse.redirect(redirectUrl);
  }

  // Allow access
  return NextResponse.next();
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Load user context from database/session
 */
export async function loadUserContext(
  userId: string,
  tenantId: string
): Promise<UserContext> {
  // TODO: Load from database
  // This is a placeholder - implement actual database queries

  return {
    id: userId,
    email: 'user@example.com',
    tenantId,
    tenantSlug: 'example-tenant',
    role: 'admin',
    roleLevel: 9,
    permissions: ['*:*'],
    teams: [],
    enabledModules: ['dashboard', 'crm', 'sales'],
    subscriptionTier: 'professional',
    isWhiteLabel: false,
    isReseller: false,
  };
}

/**
 * Get accessible modules for a tenant
 */
export async function getEnabledModules(
  tenantId: string
): Promise<string[]> {
  // TODO: Query tenant_modules table
  return ['dashboard', 'crm', 'sales', 'analytics'];
}

export default DynamicRouter;
