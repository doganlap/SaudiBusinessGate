/**
 * React Hook for Access Control
 * Professional implementation for frontend permission checking
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { AccessControlService, type AccessCheckResult } from '@/lib/services/access-control.service';

export interface UseAccessControlReturn {
  // Permission checks
  hasPermission: (permission: string) => Promise<boolean>;
  hasAnyPermission: (permissions: string[]) => Promise<boolean>;
  hasAllPermissions: (permissions: string[]) => Promise<boolean>;
  checkAccess: (permission: string, resourceType?: string, resourceId?: string) => Promise<AccessCheckResult>;
  
  // Resource access
  checkResourceAccess: (resourceType: string, resourceId: string, permission: string) => Promise<boolean>;
  
  // User info
  userPermissions: string[];
  userRoles: any[];
  isLoading: boolean;
  error: string | null;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useAccessControl(
  tenantId?: string,
  userId?: string
): UseAccessControlReturn {
  const params = useParams();
  
  // Get IDs from params or props
  const resolvedTenantId = tenantId || (params?.tenantId as string) || '';
  const resolvedUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('user_id') || '' : '');

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user permissions and roles
  const loadAccessData = async () => {
    if (!resolvedTenantId || !resolvedUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [permissions, roles] = await Promise.all([
        AccessControlService.getUserPermissions(resolvedTenantId, resolvedUserId),
        AccessControlService.getUserRoles(resolvedTenantId, resolvedUserId)
      ]);

      setUserPermissions(permissions);
      setUserRoles(roles);
    } catch (err: any) {
      console.error('Error loading access data:', err);
      setError(err.message || 'Failed to load access data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccessData();
  }, [resolvedTenantId, resolvedUserId]);

  // Permission check functions
  const hasPermission = useMemo(
    () => async (permission: string): Promise<boolean> => {
      if (!resolvedTenantId || !resolvedUserId) return false;
      return AccessControlService.hasPermission(resolvedTenantId, resolvedUserId, permission);
    },
    [resolvedTenantId, resolvedUserId]
  );

  const hasAnyPermission = useMemo(
    () => async (permissions: string[]): Promise<boolean> => {
      if (!resolvedTenantId || !resolvedUserId) return false;
      if (permissions.length === 0) return true;
      return AccessControlService.hasAnyPermission(resolvedTenantId, resolvedUserId, permissions);
    },
    [resolvedTenantId, resolvedUserId]
  );

  const hasAllPermissions = useMemo(
    () => async (permissions: string[]): Promise<boolean> => {
      if (!resolvedTenantId || !resolvedUserId) return false;
      if (permissions.length === 0) return true;
      return AccessControlService.hasAllPermissions(resolvedTenantId, resolvedUserId, permissions);
    },
    [resolvedTenantId, resolvedUserId]
  );

  const checkAccess = useMemo(
    () => async (
      permission: string,
      resourceType?: string,
      resourceId?: string
    ): Promise<AccessCheckResult> => {
      if (!resolvedTenantId || !resolvedUserId) {
        return {
          hasAccess: false,
          reason: 'User not authenticated',
          userPermissions: [],
          userRoles: []
        };
      }

      return AccessControlService.checkAccess(
        resolvedTenantId,
        resolvedUserId,
        permission,
        resourceType,
        resourceId
      );
    },
    [resolvedTenantId, resolvedUserId]
  );

  const checkResourceAccess = useMemo(
    () => async (
      resourceType: string,
      resourceId: string,
      permission: string
    ): Promise<boolean> => {
      if (!resolvedTenantId || !resolvedUserId) return false;
      return AccessControlService.checkResourceAccess(
        resolvedTenantId,
        resolvedUserId,
        resourceType,
        resourceId,
        permission
      );
    },
    [resolvedTenantId, resolvedUserId]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkAccess,
    checkResourceAccess,
    userPermissions,
    userRoles,
    isLoading,
    error,
    refresh: loadAccessData
  };
}

/**
 * Permission Guard Component
 */
export function PermissionGuard({
  permission,
  resourceType,
  resourceId,
  fallback = null,
  children
}: {
  permission: string;
  resourceType?: string;
  resourceId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const access = useAccessControl();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!access.isLoading) {
      access.checkAccess(permission, resourceType, resourceId).then(result => {
        setHasAccess(result.hasAccess);
      });
    }
  }, [access, permission, resourceType, resourceId]);

  if (access.isLoading || hasAccess === null) {
    return <>{fallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

