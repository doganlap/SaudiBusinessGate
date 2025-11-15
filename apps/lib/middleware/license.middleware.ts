/**
 * License-aware middleware for Saudi Store Platform
 * Integrates with existing security middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { LicenseService } from '../services/license.service';
import { RBACService } from '../auth/rbac-service';

// Create database pool (should be singleton)
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create services with proper dependencies
const dbService = {
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    const client = await dbPool.connect();
    try {
      const result = await client.query(sql, params);
      return { rows: result.rows };
    } finally {
      client.release();
    }
  }
};

const rbacService = new RBACService(dbPool);
const licenseService = new LicenseService(dbService, rbacService);

interface LicenseCheckConfig {
  featureCode?: string;
  requiresAuth?: boolean;
  bypassForPaths?: string[];
}

export async function licenseMiddleware(
  request: NextRequest,
  config: LicenseCheckConfig = {}
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // Skip license checking for certain paths
  const bypassPaths = [
    '/api/health',
    '/api/auth',
    '/api/billing/webhook',
    '/_next',
    '/favicon.ico',
    ...(config.bypassForPaths || [])
  ];

  if (bypassPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // Extract tenant ID from headers or path
    const tenantId = request.headers.get('x-tenant-id') || 
                    extractTenantIdFromPath(pathname);

    if (!tenantId) {
      // If no tenant ID available, allow request to continue
      // (other middleware should handle authentication)
      return NextResponse.next();
    }

    // Determine feature code from path or explicit config
    const featureCode = config.featureCode || 
                       mapPathToFeature(pathname);

    if (!featureCode) {
      // No feature mapping, allow request
      return NextResponse.next();
    }

    // Check license access
    const validation = await licenseService.checkFeatureAccess(
      tenantId,
      featureCode
    );

    if (!validation.canUseFeature) {
      // Feature not available in current license
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: validation.reason,
          upgradeRequired: validation.upgradeRequired,
          suggestedPlan: validation.suggestedPlan,
          upgradeUrl: `/billing/upgrade?feature=${featureCode}&tenant=${tenantId}`
        },
        { 
          status: 402, // Payment Required
          headers: {
            'X-Feature-Blocked': featureCode,
            'X-Upgrade-Required': validation.upgradeRequired ? 'true' : 'false'
          }
        }
      );
    }

    // Track usage for analytics (async, don't await)
    licenseService.trackUsage(tenantId, featureCode, 1, {
      path: pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('Failed to track usage:', error);
    });

    // Add license info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('X-License-Code', validation.isValid ? 'valid' : 'invalid');
    response.headers.set('X-Feature-Access', validation.canUseFeature ? 'granted' : 'denied');
    response.headers.set('X-Tenant-Id', tenantId);

    return response;

  } catch (error) {
    console.error('License middleware error:', error);
    
    // On error, allow request to continue but log issue
    // Don't break the application for license checking errors
    return NextResponse.next();
  }
}

/**
 * Extract tenant ID from request path
 * Assumes paths like /api/[tenantId]/... or /dashboard/[tenantId]/...
 */
function extractTenantIdFromPath(pathname: string): string | null {
  // Pattern 1: /api/tenant/{tenantId}/...
  const apiTenantMatch = pathname.match(/^\/api\/tenant\/([^\/]+)/);
  if (apiTenantMatch) {
    return apiTenantMatch[1];
  }

  // Pattern 2: /dashboard/{tenantId}/...
  const dashboardMatch = pathname.match(/^\/dashboard\/([^\/]+)/);
  if (dashboardMatch) {
    return dashboardMatch[1];
  }

  // Pattern 3: Query parameter (as fallback)
  // Would need to parse URL search params
  
  return null;
}

/**
 * Map API paths to feature codes
 */
function mapPathToFeature(pathname: string): string | null {
  const featureMap: Record<string, string> = {
    // Dashboard features
    '/api/dashboard/analytics': 'dashboard.analytics',
    '/api/dashboard/reports': 'dashboard.reports', 
    '/api/dashboard/kpis': 'dashboard.kpis',
    
    // Business features
    '/api/business/leads': 'business.leads',
    '/api/business/opportunities': 'business.opportunities',
    '/api/business/quotes': 'business.quotes',
    '/api/business/contracts': 'business.contracts',
    
    // Analytics features
    '/api/analytics/advanced': 'analytics.advanced',
    '/api/analytics/custom': 'analytics.custom',
    '/api/analytics/exports': 'analytics.exports',
    
    // Admin features
    '/api/admin/users': 'admin.users',
    '/api/admin/settings': 'admin.settings',
    '/api/admin/audit': 'admin.audit',
    
    // Integration features  
    '/api/integrations': 'integrations.api',
    '/api/webhooks': 'integrations.webhooks',
    
    // Storage features
    '/api/files/upload': 'storage.upload',
    '/api/files/download': 'storage.download',
    
    // Billing features (most should be always accessible)
    '/api/billing/usage': 'billing.usage',
    '/api/billing/reports': 'billing.reports'
  };

  // Direct path match
  if (featureMap[pathname]) {
    return featureMap[pathname];
  }

  // Pattern-based matching
  for (const [pattern, feature] of Object.entries(featureMap)) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(pathname)) {
      return feature;
    }
  }

  // Dashboard paths
  if (pathname.includes('/dashboard')) {
    if (pathname.includes('/analytics')) return 'dashboard.analytics';
    if (pathname.includes('/reports')) return 'dashboard.reports';
    if (pathname.includes('/admin')) return 'dashboard.admin';
    return 'dashboard.basic';
  }

  // API paths that need basic API access
  if (pathname.startsWith('/api/')) {
    return 'api.access';
  }

  return null;
}

/**
 * Enhanced middleware that combines license checking with existing security
 */
export function createLicenseEnforcedMiddleware(
  existingMiddleware?: (request: NextRequest) => NextResponse | Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Run existing middleware first (security, auth, etc.)
    if (existingMiddleware) {
      const existingResponse = await existingMiddleware(request);
      
      // If existing middleware blocks the request, respect that
      if (existingResponse.status !== 200) {
        return existingResponse;
      }
    }

    // Then check license enforcement
    return await licenseMiddleware(request);
  };
}

/**
 * Utility for checking specific feature access in API routes
 */
export async function checkFeatureInRoute(
  tenantId: string, 
  featureCode: string,
  userId?: string
): Promise<{
  allowed: boolean;
  response?: NextResponse;
}> {
  try {
    const validation = await licenseService.checkFeatureAccess(
      tenantId,
      featureCode,
      userId
    );

    if (!validation.canUseFeature) {
      const response = NextResponse.json(
        {
          error: 'Feature not available',
          message: validation.reason,
          upgradeRequired: validation.upgradeRequired,
          suggestedPlan: validation.suggestedPlan,
          featureCode
        },
        { status: 402 }
      );

      return { allowed: false, response };
    }

    // Track usage
    await licenseService.trackUsage(tenantId, featureCode);

    return { allowed: true };

  } catch (error) {
    console.error('Feature check error:', error);
    
    // On error, allow access but log
    return { allowed: true };
  }
}