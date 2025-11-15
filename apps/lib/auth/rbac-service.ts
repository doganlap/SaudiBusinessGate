/**
 * Role-Based Access Control (RBAC) Service
 * Enterprise-grade permission management
 */

import { Pool } from 'pg';

// =====================================================
// INTERFACES
// =====================================================

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  isSystem: boolean;
}

export interface UserPermissions {
  userId: number;
  organizationId: number;
  roles: Role[];
  permissions: Permission[];
}

// =====================================================
// RBAC SERVICE
// =====================================================

export class RBACService {
  private db: Pool;
  private permissionCache: Map<string, boolean>;

  constructor(dbPool: Pool) {
    this.db = dbPool;
    this.permissionCache = new Map();
  }

  // =====================================================
  // PERMISSION CHECKING
  // =====================================================

  async checkPermission(
    userId: number,
    permission: string,
    organizationId: number
  ): Promise<boolean> {
    const cacheKey = `${userId}:${organizationId}:${permission}`;
    
    // Check cache first (5-minute TTL)
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1
        AND ur.organization_id = $2
        AND p.name = $3
        AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      ) as has_permission
    `;

    const result = await this.db.query(query, [userId, organizationId, permission]);
    const hasPermission = result.rows[0]?.has_permission || false;

    // Cache the result
    this.permissionCache.set(cacheKey, hasPermission);
    setTimeout(() => this.permissionCache.delete(cacheKey), 300000); // 5 minutes

    return hasPermission;
  }

  async checkMultiplePermissions(
    userId: number,
    permissions: string[],
    organizationId: number,
    requireAll: boolean = true
  ): Promise<boolean> {
    const results = await Promise.all(
      permissions.map(perm => this.checkPermission(userId, perm, organizationId))
    );

    return requireAll ? results.every(r => r) : results.some(r => r);
  }

  async getUserPermissions(
    userId: number,
    organizationId: number
  ): Promise<UserPermissions> {
    const query = `
      SELECT DISTINCT
        r.id as role_id,
        r.name as role_name,
        r.display_name as role_display_name,
        r.description as role_description,
        p.id as permission_id,
        p.name as permission_name,
        p.resource,
        p.action,
        p.description as permission_description
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1
      AND ur.organization_id = $2
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      ORDER BY r.name, p.name
    `;

    const result = await this.db.query(query, [userId, organizationId]);

    const roles: Map<number, Role> = new Map();
    const permissions: Map<number, Permission> = new Map();

    result.rows.forEach(row => {
      if (!roles.has(row.role_id)) {
        roles.set(row.role_id, {
          id: row.role_id,
          name: row.role_name,
          displayName: row.role_display_name,
          description: row.role_description,
          isSystem: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      if (!permissions.has(row.permission_id)) {
        permissions.set(row.permission_id, {
          id: row.permission_id,
          name: row.permission_name,
          resource: row.resource,
          action: row.action,
          description: row.permission_description,
          isSystem: false
        });
      }
    });

    return {
      userId,
      organizationId,
      roles: Array.from(roles.values()),
      permissions: Array.from(permissions.values())
    };
  }

  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================

  async assignRole(
    userId: number,
    roleId: number,
    organizationId: number,
    assignedBy: number,
    expiresAt?: Date
  ): Promise<void> {
    const query = `
      INSERT INTO user_roles (user_id, role_id, organization_id, assigned_by, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, role_id, organization_id) DO NOTHING
    `;

    await this.db.query(query, [userId, roleId, organizationId, assignedBy, expiresAt]);

    // Invalidate cache
    this.invalidateUserCache(userId, organizationId);
  }

  async removeRole(
    userId: number,
    roleId: number,
    organizationId: number
  ): Promise<void> {
    const query = `
      DELETE FROM user_roles
      WHERE user_id = $1 AND role_id = $2 AND organization_id = $3
    `;

    await this.db.query(query, [userId, roleId, organizationId]);

    // Invalidate cache
    this.invalidateUserCache(userId, organizationId);
  }

  async getUserRoles(
    userId: number,
    organizationId: number
  ): Promise<Role[]> {
    const query = `
      SELECT r.*
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      AND ur.organization_id = $2
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      ORDER BY r.name
    `;

    const result = await this.db.query(query, [userId, organizationId]);
    return result.rows;
  }

  // =====================================================
  // PERMISSION MANAGEMENT
  // =====================================================

  async createRole(
    name: string,
    displayName: string,
    description: string,
    permissionIds: number[]
  ): Promise<Role> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Create role
      const roleQuery = `
        INSERT INTO roles (name, display_name, description)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const roleResult = await client.query(roleQuery, [name, displayName, description]);
      const role = roleResult.rows[0];

      // Assign permissions
      if (permissionIds.length > 0) {
        const permQuery = `
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT $1, id FROM permissions WHERE id = ANY($2)
        `;
        await client.query(permQuery, [role.id, permissionIds]);
      }

      await client.query('COMMIT');
      return role;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async addPermissionToRole(
    roleId: number,
    permissionId: number,
    grantedBy: number
  ): Promise<void> {
    const query = `
      INSERT INTO role_permissions (role_id, permission_id, granted_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `;

    await this.db.query(query, [roleId, permissionId, grantedBy]);
    this.clearPermissionCache();
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number
  ): Promise<void> {
    const query = `
      DELETE FROM role_permissions
      WHERE role_id = $1 AND permission_id = $2
    `;

    await this.db.query(query, [roleId, permissionId]);
    this.clearPermissionCache();
  }

  // =====================================================
  // CACHE MANAGEMENT
  // =====================================================

  private invalidateUserCache(userId: number, organizationId: number): void {
    // Clear all cached permissions for this user in this organization
    const keysToDelete: string[] = [];
    this.permissionCache.forEach((_, key) => {
      if (key.startsWith(`${userId}:${organizationId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  private clearPermissionCache(): void {
    this.permissionCache.clear();
  }

  // =====================================================
  // QUERY HELPERS
  // =====================================================

  async getAllPermissions(): Promise<Permission[]> {
    const query = 'SELECT * FROM permissions ORDER BY resource, action';
    const result = await this.db.query(query);
    return result.rows;
  }

  async getAllRoles(): Promise<Role[]> {
    const query = 'SELECT * FROM roles ORDER BY name';
    const result = await this.db.query(query);
    return result.rows;
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const query = `
      SELECT p.*
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.resource, p.action
    `;

    const result = await this.db.query(query, [roleId]);
    return result.rows;
  }
}

// =====================================================
// EXPRESS MIDDLEWARE
// =====================================================

export function createRBACMiddleware(rbacService: RBACService) {
  return function requirePermission(...requiredPermissions: string[]) {
    return async (req: any, res: any, next: any) => {
      try {
        const userId = req.user?.id;
        const organizationId = req.user?.organizationId || req.headers['x-organization-id'];

        if (!userId || !organizationId) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasPermission = await rbacService.checkMultiplePermissions(
          userId,
          requiredPermissions,
          parseInt(organizationId),
          true // Require all permissions
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: requiredPermissions
          });
        }

        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    };
  };
}

export default RBACService;

