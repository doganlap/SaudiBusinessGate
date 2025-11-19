/**
 * User Permissions API
 * Professional implementation with access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessControlService } from '@/lib/services/access-control.service';
import { requireAuth } from '@/lib/middleware/access-control';

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// Get user permissions
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = req.headers.get('x-user-id') || 
                 req.cookies.get('user_id')?.value || 
                 null;
    const tenantId = req.headers.get('x-tenant-id') || 
                    req.cookies.get('tenant_id')?.value || 
                    null;

    if (!user || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Check if user can view other users' permissions
    const canView = userId === user || 
                   await AccessControlService.hasPermission(tenantId, user, 'users:read');

    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    const [permissions, roles] = await Promise.all([
      AccessControlService.getUserPermissions(tenantId, userId),
      AccessControlService.getUserRoles(tenantId, userId)
    ]);

    return NextResponse.json({
      success: true,
      permissions,
      roles
    });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

