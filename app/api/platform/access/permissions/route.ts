/**
 * Platform Permissions API
 * Professional implementation with access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessControlService } from '@/lib/services/access-control.service';
import { requireAuth, requirePermission } from '@/lib/middleware/access-control';

// Get all available permissions
export const GET = requireAuth(async (req) => {
  try {
    const tenantId = req.user!.tenantId;
    
    // Check permission
    const hasPermission = await AccessControlService.hasPermission(
      tenantId,
      req.user!.userId,
      'settings:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission denied', message: 'Required: settings:read' },
        { status: 403 }
      );
    }

    const permissions = await AccessControlService.getAllPermissions();
    
    return NextResponse.json({
      success: true,
      permissions
    });
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
});

