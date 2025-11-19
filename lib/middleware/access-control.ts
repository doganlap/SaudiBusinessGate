/**
 * Access Control Middleware for Next.js API Routes
 * Professional implementation with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessControlService } from '@/lib/services/access-control.service';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    tenantId: string;
    userId: string;
    email: string;
    role?: string;
    isSuperAdmin?: boolean;
  };
}

/**
 * Get user from request (from auth token, session, etc.)
 * This should be implemented based on your auth system
 */
function getUserFromRequest(request: NextRequest): {
  tenantId: string;
  userId: string;
  email: string;
  role?: string;
  isSuperAdmin?: boolean;
} | null {
  // TODO: Implement based on your authentication system
  // For now, extract from headers or cookies
  const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('tenant_id')?.value;
  const userId = request.headers.get('x-user-id') || request.cookies.get('user_id')?.value;
  const email = request.headers.get('x-user-email') || request.cookies.get('user_email')?.value;

  if (!tenantId || !userId) {
    return null;
  }

  return {
    tenantId,
    userId,
    email: email || '',
    role: request.headers.get('x-user-role') || undefined,
    isSuperAdmin: request.headers.get('x-is-super-admin') === 'true'
  };
}

/**
 * Require authentication middleware
 */
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        },
        { status: 401 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  };
}

/**
 * Require permission middleware
 */
export function requirePermission(requiredPermission: string) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = getUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            message: 'Please log in to access this resource'
          },
          { status: 401 }
        );
      }

      // Check permission
      const hasPermission = await AccessControlService.hasPermission(
        user.tenantId,
        user.userId,
        requiredPermission
      );

      if (!hasPermission) {
        const userPermissions = await AccessControlService.getUserPermissions(
          user.tenantId,
          user.userId
        );

        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: `Required permission: ${requiredPermission}`,
            required: requiredPermission,
            userPermissions
          },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    };
  };
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(...requiredPermissions: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = getUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        );
      }

      const hasAnyPermission = await AccessControlService.hasAnyPermission(
        user.tenantId,
        user.userId,
        requiredPermissions
      );

      if (!hasAnyPermission) {
        const userPermissions = await AccessControlService.getUserPermissions(
          user.tenantId,
          user.userId
        );

        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: `Required one of: ${requiredPermissions.join(', ')}`,
            required: requiredPermissions,
            userPermissions
          },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    };
  };
}

/**
 * Require all of the specified permissions
 */
export function requireAllPermissions(...requiredPermissions: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = getUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        );
      }

      const hasAllPermissions = await AccessControlService.hasAllPermissions(
        user.tenantId,
        user.userId,
        requiredPermissions
      );

      if (!hasAllPermissions) {
        const userPermissions = await AccessControlService.getUserPermissions(
          user.tenantId,
          user.userId
        );

        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: `Required all of: ${requiredPermissions.join(', ')}`,
            required: requiredPermissions,
            userPermissions
          },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    };
  };
}

/**
 * Require resource-level access
 */
export function requireResourceAccess(
  resourceType: string,
  resourceIdParam: string = 'id',
  requiredPermission: string
) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const user = getUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        );
      }

      // Get resource ID from URL params or search params
      const url = new URL(req.url);
      const resourceId = url.searchParams.get(resourceIdParam) || 
                        url.pathname.split('/').pop() || '';

      if (!resourceId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Resource ID required'
          },
          { status: 400 }
        );
      }

      const hasAccess = await AccessControlService.checkResourceAccess(
        user.tenantId,
        user.userId,
        resourceType,
        resourceId,
        requiredPermission
      );

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied',
            message: `No access to ${resourceType}:${resourceId} with permission: ${requiredPermission}`
          },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    };
  };
}

