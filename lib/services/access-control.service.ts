/**
 * Professional Access Control Service
 * Complete RBAC implementation using platform tables
 */

import { query } from '@/lib/db/connection';

export interface UserPermission {
  permission: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface UserRole {
  roleId: string;
  roleName: string;
  roleSlug: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  permissions: string[];
}

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  userRoles?: UserRole[];
  userPermissions?: string[];
}

export class AccessControlService {
  /**
   * Get all permissions for a user (from roles + direct access)
   */
  static async getUserPermissions(
    tenantId: string,
    userId: string
  ): Promise<string[]> {
    try {
      // Get permissions from roles
      const rolePermissions = await query<{ permission: string }>(`
        SELECT DISTINCT pr.name as permission
        FROM platform_user_roles pur
        JOIN platform_roles pr ON pur.role_id = pr.id
        JOIN platform_role_permissions prp ON pr.id = prp.role_id
        JOIN platform_permissions pp ON prp.permission_id = pp.id
        WHERE pur.tenant_id = $1 
          AND pur.user_id = $2
          AND pur.is_active = true
          AND pr.is_active = true
          AND (pur.expires_at IS NULL OR pur.expires_at > NOW())
      `, [tenantId, userId]);

      // Get direct access permissions
      const directPermissions = await query<{ permission: string }>(`
        SELECT DISTINCT permission
        FROM platform_user_access
        WHERE tenant_id = $1 
          AND user_id = $2
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW())
      `, [tenantId, userId]);

      // Combine and deduplicate
      const allPermissions = new Set<string>();
      
      rolePermissions.rows.forEach(row => {
        allPermissions.add(row.permission);
      });
      
      directPermissions.rows.forEach(row => {
        allPermissions.add(row.permission);
      });

      // Get user's direct permissions array (legacy support)
      const userResult = await query<{ permissions: string[] }>(`
        SELECT permissions
        FROM platform_users
        WHERE tenant_id = $1 AND user_id = $2
      `, [tenantId, userId]);

      if (userResult.rows[0]?.permissions) {
        userResult.rows[0].permissions.forEach(perm => allPermissions.add(perm));
      }

      return Array.from(allPermissions);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get all roles for a user
   */
  static async getUserRoles(
    tenantId: string,
    userId: string
  ): Promise<UserRole[]> {
    try {
      const result = await query<{
        role_id: string;
        role_name: string;
        role_slug: string;
        assigned_at: string;
        expires_at?: string;
        is_active: boolean;
        permissions: string[];
      }>(`
        SELECT 
          pr.id as role_id,
          pr.name as role_name,
          pr.slug as role_slug,
          pur.assigned_at,
          pur.expires_at,
          pur.is_active,
          pr.permissions
        FROM platform_user_roles pur
        JOIN platform_roles pr ON pur.role_id = pr.id
        WHERE pur.tenant_id = $1 
          AND pur.user_id = $2
          AND pur.is_active = true
          AND pr.is_active = true
          AND (pur.expires_at IS NULL OR pur.expires_at > NOW())
        ORDER BY pr.role_level DESC
      `, [tenantId, userId]);

      return result.rows.map(row => ({
        roleId: row.role_id,
        roleName: row.role_name,
        roleSlug: row.role_slug,
        assignedAt: row.assigned_at,
        expiresAt: row.expires_at,
        isActive: row.is_active,
        permissions: row.permissions || []
      }));
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Check if user has a specific permission
   */
  static async hasPermission(
    tenantId: string,
    userId: string,
    requiredPermission: string
  ): Promise<boolean> {
    try {
      // Check if user is super admin
      const userResult = await query<{ is_super_admin: boolean; role: string }>(`
        SELECT is_super_admin, role
        FROM platform_users
        WHERE tenant_id = $1 AND user_id = $2
      `, [tenantId, userId]);

      const user = userResult.rows[0];
      if (!user) return false;

      // Super admin or tenant admin has all permissions
      if (user.is_super_admin || user.role === 'super_admin' || user.role === 'tenant_admin') {
        return true;
      }

      // Get all user permissions
      const userPermissions = await this.getUserPermissions(tenantId, userId);

      // Check for wildcard permission
      if (userPermissions.includes('*')) {
        return true;
      }

      // Check for exact match
      if (userPermissions.includes(requiredPermission)) {
        return true;
      }

      // Check for resource wildcard (e.g., 'crm:*' matches 'crm:read')
      const [resource, action] = requiredPermission.split(':');
      if (resource && action) {
        const resourceWildcard = `${resource}:*`;
        if (userPermissions.includes(resourceWildcard)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the required permissions
   */
  static async hasAnyPermission(
    tenantId: string,
    userId: string,
    requiredPermissions: string[]
  ): Promise<boolean> {
    if (requiredPermissions.length === 0) return true;

    for (const permission of requiredPermissions) {
      if (await this.hasPermission(tenantId, userId, permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has all of the required permissions
   */
  static async hasAllPermissions(
    tenantId: string,
    userId: string,
    requiredPermissions: string[]
  ): Promise<boolean> {
    if (requiredPermissions.length === 0) return true;

    for (const permission of requiredPermissions) {
      if (!(await this.hasPermission(tenantId, userId, permission))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
    assignedBy?: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      await query(`
        INSERT INTO platform_user_roles (tenant_id, user_id, role_id, assigned_by, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (tenant_id, user_id, role_id)
        DO UPDATE SET 
          is_active = true,
          assigned_at = CURRENT_TIMESTAMP,
          assigned_by = $4,
          expires_at = $5
      `, [tenantId, userId, roleId, assignedBy || null, expiresAt || null]);

      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  static async removeRole(
    tenantId: string,
    userId: string,
    roleId: string
  ): Promise<boolean> {
    try {
      await query(`
        UPDATE platform_user_roles
        SET is_active = false, expires_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $1 AND user_id = $2 AND role_id = $3
      `, [tenantId, userId, roleId]);

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * Grant direct permission to user
   */
  static async grantPermission(
    tenantId: string,
    userId: string,
    resourceType: string,
    permission: string,
    resourceId?: string,
    grantedBy?: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      await query(`
        INSERT INTO platform_user_access (
          tenant_id, user_id, resource_type, resource_id, permission, granted_by, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [tenantId, userId, resourceType, resourceId || null, permission, grantedBy || null, expiresAt || null]);

      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      return false;
    }
  }

  /**
   * Revoke direct permission from user
   */
  static async revokePermission(
    tenantId: string,
    userId: string,
    resourceType: string,
    permission: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      await query(`
        UPDATE platform_user_access
        SET is_active = false
        WHERE tenant_id = $1 
          AND user_id = $2 
          AND resource_type = $3 
          AND permission = $4
          AND ($5 IS NULL OR resource_id = $5)
      `, [tenantId, userId, resourceType, permission, resourceId || null]);

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      return false;
    }
  }

  /**
   * Check resource-level access
   */
  static async checkResourceAccess(
    tenantId: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredPermission: string
  ): Promise<boolean> {
    // First check general permission
    const hasGeneralPermission = await this.hasPermission(
      tenantId,
      userId,
      `${resourceType}:${requiredPermission}`
    );

    if (hasGeneralPermission) return true;

    // Check resource-specific permission
    try {
      const result = await query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM platform_user_access
        WHERE tenant_id = $1 
          AND user_id = $2
          AND resource_type = $3
          AND resource_id = $4
          AND permission = $5
          AND is_active = true
          AND (expires_at IS NULL OR expires_at > NOW())
      `, [tenantId, userId, resourceType, resourceId, requiredPermission]);

      return parseInt(result.rows[0]?.count || '0') > 0;
    } catch (error) {
      console.error('Error checking resource access:', error);
      return false;
    }
  }

  /**
   * Get complete access check result
   */
  static async checkAccess(
    tenantId: string,
    userId: string,
    requiredPermission: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<AccessCheckResult> {
    const userRoles = await this.getUserRoles(tenantId, userId);
    const userPermissions = await this.getUserPermissions(tenantId, userId);

    let hasAccess = false;

    if (resourceType && resourceId) {
      hasAccess = await this.checkResourceAccess(
        tenantId,
        userId,
        resourceType,
        resourceId,
        requiredPermission
      );
    } else {
      hasAccess = await this.hasPermission(tenantId, userId, requiredPermission);
    }

    return {
      hasAccess,
      reason: hasAccess ? undefined : 'Insufficient permissions',
      userRoles,
      userPermissions
    };
  }

  /**
   * Get all available roles for a tenant
   */
  static async getTenantRoles(tenantId: string): Promise<any[]> {
    try {
      const result = await query(`
        SELECT *
        FROM platform_roles
        WHERE (tenant_id = $1 OR tenant_id IS NULL)
          AND is_active = true
        ORDER BY role_level DESC, name ASC
      `, [tenantId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting tenant roles:', error);
      return [];
    }
  }

  /**
   * Get all available permissions
   */
  static async getAllPermissions(): Promise<any[]> {
    try {
      const result = await query(`
        SELECT *
        FROM platform_permissions
        ORDER BY resource, action
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting permissions:', error);
      return [];
    }
  }
}

export default AccessControlService;

