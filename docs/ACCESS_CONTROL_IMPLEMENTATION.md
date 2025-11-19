# Access Control Implementation Guide

## Overview

This document describes the professional access control system implementation for the platform, including database tables, services, middleware, and API integration.

## Database Schema

### Core Tables

1. **platform_roles** - Role definitions
   - System roles: Super Admin, Tenant Admin, Manager, User, Viewer
   - Tenant-specific custom roles
   - Role levels (1-10)
   - Permissions arrays

2. **platform_permissions** - Granular permission definitions
   - Resource-action structure (e.g., `users:read`, `crm:write`)
   - System and custom permissions

3. **platform_role_permissions** - Many-to-many: Roles → Permissions
   - Links roles to their permissions
   - Tracks who granted permissions

4. **platform_user_roles** - Many-to-many: Users → Roles
   - Links users to their roles
   - Supports expiration dates
   - Tenant-aware

5. **platform_user_access** - Direct user permissions
   - Fine-grained resource-level permissions
   - Override role-based permissions
   - Resource-specific access control

## Access Control Service

### Location
`lib/services/access-control.service.ts`

### Key Methods

#### Permission Checking
```typescript
// Check if user has a specific permission
AccessControlService.hasPermission(tenantId, userId, 'users:read')

// Check if user has any of the required permissions
AccessControlService.hasAnyPermission(tenantId, userId, ['users:read', 'users:write'])

// Check if user has all of the required permissions
AccessControlService.hasAllPermissions(tenantId, userId, ['users:read', 'users:write'])

// Check resource-level access
AccessControlService.checkResourceAccess(tenantId, userId, 'customers', 'customer-123', 'read')
```

#### Role Management
```typescript
// Get all roles for a user
AccessControlService.getUserRoles(tenantId, userId)

// Assign role to user
AccessControlService.assignRole(tenantId, userId, roleId, assignedBy, expiresAt)

// Remove role from user
AccessControlService.removeRole(tenantId, userId, roleId)
```

#### Permission Management
```typescript
// Grant direct permission to user
AccessControlService.grantPermission(tenantId, userId, resourceType, permission, resourceId)

// Revoke direct permission from user
AccessControlService.revokePermission(tenantId, userId, resourceType, permission, resourceId)
```

#### User Permissions
```typescript
// Get all permissions for a user (roles + direct)
AccessControlService.getUserPermissions(tenantId, userId)

// Complete access check with details
AccessControlService.checkAccess(tenantId, userId, requiredPermission, resourceType, resourceId)
```

## Middleware

### Location
`lib/middleware/access-control.ts`

### Usage in Next.js API Routes

#### Require Authentication
```typescript
import { requireAuth } from '@/lib/middleware/access-control';

export const GET = requireAuth(async (req) => {
  // User is authenticated, available as req.user
  const { tenantId, userId, email } = req.user!;
  
  return NextResponse.json({ success: true, data: {} });
});
```

#### Require Permission
```typescript
import { requirePermission } from '@/lib/middleware/access-control';

export const GET = requirePermission('users:read')(async (req) => {
  // User has required permission
  return NextResponse.json({ success: true, data: {} });
});
```

#### Require Any Permission
```typescript
import { requireAnyPermission } from '@/lib/middleware/access-control';

export const POST = requireAnyPermission('users:write', 'users:create')(async (req) => {
  // User has at least one of the required permissions
  return NextResponse.json({ success: true, data: {} });
});
```

#### Require All Permissions
```typescript
import { requireAllPermissions } from '@/lib/middleware/access-control';

export const PUT = requireAllPermissions('users:read', 'users:write')(async (req) => {
  // User has all of the required permissions
  return NextResponse.json({ success: true, data: {} });
});
```

#### Require Resource Access
```typescript
import { requireResourceAccess } from '@/lib/middleware/access-control';

export const GET = requireResourceAccess('customers', 'id', 'read')(async (req) => {
  // User has access to the specific resource
  return NextResponse.json({ success: true, data: {} });
});
```

## API Integration

### Automatic Role Assignment

When creating users or tenants, roles are automatically assigned:

#### Tenant Creation
```typescript
// In app/api/platform/tenants/route.ts
// Admin user automatically gets 'tenant_admin' role
```

#### User Creation
```typescript
// In app/api/platform/users/route.ts
// Users can be assigned roles via:
// - body.role_id (UUID)
// - body.role_slug (string)
// - body.role (string) - mapped to role slug/name
```

### Example API Routes

#### Protected Route with Permission Check
```typescript
// app/api/crm/customers/route.ts
import { requirePermission } from '@/lib/middleware/access-control';

export const GET = requirePermission('crm:read')(async (req) => {
  const { tenantId, userId } = req.user!;
  
  // Fetch customers for tenant
  const customers = await fetchCustomers(tenantId);
  
  return NextResponse.json({ success: true, customers });
});

export const POST = requirePermission('crm:write')(async (req) => {
  const { tenantId, userId } = req.user!;
  const body = await req.json();
  
  // Create customer
  const customer = await createCustomer(tenantId, body);
  
  return NextResponse.json({ success: true, customer });
});
```

## Permission Naming Convention

### Format
`{resource}:{action}` or `{resource}:*` for all actions

### Examples
- `users:read` - Read users
- `users:write` - Create/Update users
- `users:delete` - Delete users
- `users:*` - All user permissions
- `crm:*` - All CRM permissions
- `*` - All permissions (super admin)

### Standard Resources
- `dashboard` - Dashboard access
- `users` - User management
- `crm` - CRM module
- `sales` - Sales module
- `finance` - Finance module
- `settings` - Settings management
- `tenant` - Tenant management
- `reports` - Reports access
- `profile` - Profile management

## Default Roles

### System Roles (Available to All Tenants)

1. **Super Admin** (`super_admin`)
   - Level: 10
   - Permissions: `[*]`
   - Full system access across all tenants

2. **Tenant Admin** (`tenant_admin`)
   - Level: 9
   - Permissions: `[tenant:*, users:*, settings:*]`
   - Full access within tenant

3. **Manager** (`manager`)
   - Level: 7
   - Permissions: `[crm:*, sales:*, reports:read]`
   - Management access

4. **User** (`user`)
   - Level: 5
   - Permissions: `[dashboard:read, profile:write]`
   - Standard user access

5. **Viewer** (`viewer`)
   - Level: 1
   - Permissions: `[dashboard:read, reports:read]`
   - Read-only access

## Best Practices

### 1. Use Middleware for Route Protection
Always use middleware for API route protection instead of manual checks:
```typescript
// ✅ Good
export const GET = requirePermission('users:read')(async (req) => { ... });

// ❌ Bad
export async function GET(req) {
  const hasPermission = await AccessControlService.hasPermission(...);
  if (!hasPermission) { ... }
}
```

### 2. Check Permissions Early
Fail fast with permission checks at the beginning of handlers.

### 3. Use Resource-Level Permissions for Sensitive Data
For fine-grained control, use `platform_user_access` table:
```typescript
// Grant access to specific customer
await AccessControlService.grantPermission(
  tenantId,
  userId,
  'customers',
  'read',
  'customer-123'
);
```

### 4. Cache Permission Checks
The service includes built-in caching for permission checks (5-minute TTL).

### 5. Log Permission Denials
Always log permission denials for audit purposes.

### 6. Use Role Hierarchy
Respect role levels when assigning permissions. Higher levels have more access.

## Testing

### Test Permission Checks
```typescript
// Test user has permission
const hasPermission = await AccessControlService.hasPermission(
  'tenant-123',
  'user-456',
  'users:read'
);
expect(hasPermission).toBe(true);
```

### Test Role Assignment
```typescript
// Assign role and verify
await AccessControlService.assignRole('tenant-123', 'user-456', roleId);
const roles = await AccessControlService.getUserRoles('tenant-123', 'user-456');
expect(roles).toContainEqual(expect.objectContaining({ roleSlug: 'manager' }));
```

## Troubleshooting

### Common Issues

1. **Permission Denied Despite Role**
   - Check if role is active
   - Verify role has the permission
   - Check if permission is expired
   - Verify tenant isolation

2. **Role Not Assigned**
   - Check role exists for tenant
   - Verify role assignment didn't fail silently
   - Check logs for errors

3. **Resource Access Not Working**
   - Verify resource-level permission exists
   - Check if permission is expired
   - Verify resource ID matches

## Security Considerations

1. **Tenant Isolation**: All permission checks are tenant-scoped
2. **Default Deny**: Users have no permissions by default
3. **Audit Trail**: All role/permission assignments are logged
4. **Expiration Support**: Permissions can have expiration dates
5. **Super Admin Bypass**: Super admins have all permissions (use with caution)

## API Endpoints

### Access Control APIs

- `GET /api/platform/access/roles` - Get all roles
- `GET /api/platform/access/permissions` - Get all permissions
- `GET /api/platform/access/users/[userId]/permissions` - Get user permissions

### Usage
```typescript
// Get all roles for tenant
const response = await fetch('/api/platform/access/roles', {
  headers: {
    'x-tenant-id': tenantId,
    'x-user-id': userId
  }
});
```

## Migration Notes

The access control system is fully integrated with:
- Platform tenant creation
- Platform user creation
- All API routes can use middleware
- Database tables are created automatically

No additional migration needed - everything is ready to use!
