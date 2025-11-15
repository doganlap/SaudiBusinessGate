/**
 * Saudi Store - Routes Configuration
 * React Router routes mapping for public, demo, POC, and partner flows
 */

export const routes = {
  // =====================================================
  // PUBLIC ROUTES
  // =====================================================
  public: {
    home: '/',
    about: '/about',
    features: '/features',
    pricing: '/pricing',
    contact: '/contact',
    
    // Demo routes
    demo: {
      landing: '/demo',
      request: '/demo/request',
      thankyou: '/demo/thank-you',
      booking: '/demo/booking',
    },
    
    // POC routes
    poc: {
      landing: '/poc',
      request: '/poc/request',
      thankyou: '/poc/thank-you',
      process: '/poc/process',
    },
    
    // Partner routes
    partner: {
      program: '/partners',
      apply: '/partners/apply',
      login: '/partners/login',
      benefits: '/partners/benefits',
    },
  },
  
  // =====================================================
  // AUTHENTICATED ROUTES
  // =====================================================
  app: {
    dashboard: '/[lng]/(platform)/dashboard',
    
    // Demo user routes
    demo: {
      dashboard: '/demo/dashboard',
      sandbox: '/demo/sandbox',
      modules: '/demo/modules',
      feedback: '/demo/feedback',
    },
    
    // POC user routes
    poc: {
      dashboard: '/poc/dashboard',
      project: '/poc/project/:id',
      milestones: '/poc/milestones',
      reports: '/poc/reports',
      collaboration: '/poc/collaboration',
    },
    
    // Partner routes
    partner: {
      dashboard: '/partner/dashboard',
      referrals: '/partner/referrals',
      commissions: '/partner/commissions',
      clients: '/partner/clients',
      resources: '/partner/resources',
      reports: '/partner/reports',
    },
  },
  
  // =====================================================
  // API ROUTES
  // =====================================================
  api: {
    // Public APIs
    public: {
      demoRequest: '/api/public/demo/request',
      pocRequest: '/api/public/poc/request',
      contactForm: '/api/public/contact',
    },
    
    // Auth APIs
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
      refresh: '/api/auth/refresh',
      partnerLogin: '/api/partner/auth/login',
    },
    
    // Protected APIs
    demo: {
      status: '/api/demo/status',
      extend: '/api/demo/extend',
      convert: '/api/demo/convert',
    },
    
    poc: {
      project: '/api/poc/project/:id',
      milestones: '/api/poc/milestones',
      status: '/api/poc/status',
      deliverables: '/api/poc/deliverables',
    },
    
    partner: {
      referrals: '/api/partner/referrals',
      commission: '/api/partner/commission',
      clients: '/api/partner/clients',
      invite: '/api/partner/invite',
    },
  },
} as const;

// =====================================================
// ROUTE GUARDS & PERMISSIONS
// =====================================================

export const routePermissions = {
  // Public routes (no auth required)
  public: [
    '/',
    '/demo',
    '/demo/request',
    '/poc',
    '/poc/request',
    '/partners',
    '/partners/login',
  ],
  
  // Demo user access
  demo: [
    '/demo/dashboard',
    '/demo/sandbox',
    '/demo/modules',
    '/demo/feedback',
  ],
  
  // POC user access
  poc: [
    '/poc/dashboard',
    '/poc/project/*',
    '/poc/milestones',
    '/poc/reports',
    '/poc/collaboration',
  ],
  
  // Partner access
  partner: [
    '/partner/dashboard',
    '/partner/referrals',
    '/partner/commissions',
    '/partner/clients',
    '/partner/resources',
    '/partner/reports',
  ],
  
  // Regular user access (full platform)
  user: [
    '/[lng]/(platform)/*',
  ],
} as const;

// =====================================================
// ROUTE HELPERS
// =====================================================

/**
 * Build route URL with parameters
 */
export function buildRoute(route: string, params?: Record<string, string>): string {
  let url = route;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value).replace(`[${key}]`, value);
    });
  }
  
  return url;
}

/**
 * Check if user has access to route
 */
export function canAccessRoute(
  route: string, 
  userType: 'public' | 'demo' | 'poc' | 'partner' | 'user'
): boolean {
  const permissions = routePermissions[userType];
  
  return permissions.some(pattern => {
    if (pattern.endsWith('/*')) {
      return route.startsWith(pattern.slice(0, -2));
    }
    return route === pattern;
  });
}

/**
 * Get redirect after login based on user type
 */
export function getDefaultRedirect(
  userType: 'demo' | 'poc' | 'partner' | 'user'
): string {
  switch (userType) {
    case 'demo':
      return routes.app.demo.dashboard;
    case 'poc':
      return routes.app.poc.dashboard;
    case 'partner':
      return routes.app.partner.dashboard;
    case 'user':
    default:
      return routes.app.dashboard;
  }
}

// =====================================================
// EXPORT TYPES
// =====================================================

export type RouteParams = Record<string, string>;
export type UserType = 'public' | 'demo' | 'poc' | 'partner' | 'user';
export type RoutePermission = typeof routePermissions;
