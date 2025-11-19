-- =====================================================
-- Platform Access Control Tables
-- Roles, Permissions, and User Access Management
-- Compatible with platform_tenants and platform_users
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PLATFORM_ROLES TABLE
-- Role definitions for access control
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    display_name JSONB DEFAULT '{}',
    description JSONB DEFAULT '{}',
    role_type VARCHAR(50) DEFAULT 'custom' CHECK (role_type IN ('system', 'tenant', 'team', 'custom')),
    role_level INTEGER DEFAULT 1 CHECK (role_level >= 1 AND role_level <= 10),
    permissions TEXT[] DEFAULT '{}',
    module_access JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Create indexes for platform_roles
CREATE INDEX IF NOT EXISTS idx_platform_roles_tenant_id ON platform_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_roles_slug ON platform_roles(slug);
CREATE INDEX IF NOT EXISTS idx_platform_roles_type ON platform_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_platform_roles_active ON platform_roles(is_active);

-- =====================================================
-- PLATFORM_PERMISSIONS TABLE
-- Granular permission definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for platform_permissions
CREATE INDEX IF NOT EXISTS idx_platform_permissions_resource ON platform_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_platform_permissions_action ON platform_permissions(action);
CREATE INDEX IF NOT EXISTS idx_platform_permissions_name ON platform_permissions(name);

-- =====================================================
-- PLATFORM_ROLE_PERMISSIONS TABLE
-- Many-to-many: Roles to Permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES platform_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES platform_permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(255),
    UNIQUE(role_id, permission_id)
);

-- Create indexes for platform_role_permissions
CREATE INDEX IF NOT EXISTS idx_platform_role_perms_role ON platform_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_platform_role_perms_perm ON platform_role_permissions(permission_id);

-- =====================================================
-- PLATFORM_USER_ROLES TABLE
-- Many-to-many: Users to Roles
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES platform_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(tenant_id, user_id, role_id),
    FOREIGN KEY (tenant_id, user_id) REFERENCES platform_users(tenant_id, user_id) ON DELETE CASCADE
);

-- Create indexes for platform_user_roles
CREATE INDEX IF NOT EXISTS idx_platform_user_roles_tenant_user ON platform_user_roles(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_platform_user_roles_role ON platform_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_platform_user_roles_active ON platform_user_roles(is_active);

-- =====================================================
-- PLATFORM_USER_ACCESS TABLE
-- Direct user access/permission tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    permission VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    FOREIGN KEY (tenant_id, user_id) REFERENCES platform_users(tenant_id, user_id) ON DELETE CASCADE
);

-- Create indexes for platform_user_access
CREATE INDEX IF NOT EXISTS idx_platform_user_access_tenant_user ON platform_user_access(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_platform_user_access_resource ON platform_user_access(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_platform_user_access_permission ON platform_user_access(permission);
CREATE INDEX IF NOT EXISTS idx_platform_user_access_active ON platform_user_access(is_active);

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- =====================================================
DROP TRIGGER IF EXISTS update_platform_roles_updated_at ON platform_roles;
CREATE TRIGGER update_platform_roles_updated_at
    BEFORE UPDATE ON platform_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT SYSTEM ROLES
-- =====================================================
INSERT INTO platform_roles (name, slug, display_name, description, role_type, role_level, permissions, is_system, is_default, tenant_id)
VALUES 
    ('Super Admin', 'super_admin', '{"en": "Super Administrator", "ar": "مدير عام"}'::jsonb, '{"en": "Full system access across all tenants", "ar": "وصول كامل للنظام عبر جميع المستأجرين"}'::jsonb, 'system', 10, ARRAY['*'], true, true, NULL),
    ('Tenant Admin', 'tenant_admin', '{"en": "Tenant Administrator", "ar": "مدير المستأجر"}'::jsonb, '{"en": "Full access within tenant", "ar": "وصول كامل داخل المستأجر"}'::jsonb, 'system', 9, ARRAY['tenant:*', 'users:*', 'settings:*'], true, true, NULL),
    ('Manager', 'manager', '{"en": "Manager", "ar": "مدير"}'::jsonb, '{"en": "Management access within tenant", "ar": "وصول إداري داخل المستأجر"}'::jsonb, 'system', 7, ARRAY['crm:*', 'sales:*', 'reports:read'], true, true, NULL),
    ('User', 'user', '{"en": "User", "ar": "مستخدم"}'::jsonb, '{"en": "Standard user access", "ar": "وصول مستخدم عادي"}'::jsonb, 'system', 5, ARRAY['dashboard:read', 'profile:write'], true, true, NULL),
    ('Viewer', 'viewer', '{"en": "Viewer", "ar": "مشاهد"}'::jsonb, '{"en": "Read-only access", "ar": "وصول للقراءة فقط"}'::jsonb, 'system', 1, ARRAY['dashboard:read', 'reports:read'], true, true, NULL)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =====================================================
-- INSERT DEFAULT PERMISSIONS
-- =====================================================
INSERT INTO platform_permissions (name, resource, action, description, is_system)
VALUES
    -- Dashboard
    ('dashboard:read', 'dashboard', 'read', 'View dashboard', true),
    ('dashboard:write', 'dashboard', 'write', 'Edit dashboard', true),
    
    -- Users
    ('users:read', 'users', 'read', 'View users', true),
    ('users:write', 'users', 'write', 'Create/Edit users', true),
    ('users:delete', 'users', 'delete', 'Delete users', true),
    ('users:*', 'users', '*', 'All user permissions', true),
    
    -- CRM
    ('crm:read', 'crm', 'read', 'View CRM data', true),
    ('crm:write', 'crm', 'write', 'Create/Edit CRM data', true),
    ('crm:delete', 'crm', 'delete', 'Delete CRM data', true),
    ('crm:*', 'crm', '*', 'All CRM permissions', true),
    
    -- Sales
    ('sales:read', 'sales', 'read', 'View sales data', true),
    ('sales:write', 'sales', 'write', 'Create/Edit sales data', true),
    ('sales:delete', 'sales', 'delete', 'Delete sales data', true),
    ('sales:*', 'sales', '*', 'All sales permissions', true),
    
    -- Finance
    ('finance:read', 'finance', 'read', 'View finance data', true),
    ('finance:write', 'finance', 'write', 'Create/Edit finance data', true),
    ('finance:delete', 'finance', 'delete', 'Delete finance data', true),
    ('finance:*', 'finance', '*', 'All finance permissions', true),
    
    -- Settings
    ('settings:read', 'settings', 'read', 'View settings', true),
    ('settings:write', 'settings', 'write', 'Edit settings', true),
    ('settings:*', 'settings', '*', 'All settings permissions', true),
    
    -- Tenant
    ('tenant:read', 'tenant', 'read', 'View tenant info', true),
    ('tenant:write', 'tenant', 'write', 'Edit tenant info', true),
    ('tenant:*', 'tenant', '*', 'All tenant permissions', true),
    
    -- Reports
    ('reports:read', 'reports', 'read', 'View reports', true),
    ('reports:write', 'reports', 'write', 'Create reports', true),
    ('reports:*', 'reports', '*', 'All report permissions', true),
    
    -- Profile
    ('profile:read', 'profile', 'read', 'View own profile', true),
    ('profile:write', 'profile', 'write', 'Edit own profile', true),
    ('profile:*', 'profile', '*', 'All profile permissions', true),
    
    -- Wildcard
    ('*', '*', '*', 'All permissions', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE platform_roles IS 'Role definitions for access control';
COMMENT ON TABLE platform_permissions IS 'Granular permission definitions';
COMMENT ON TABLE platform_role_permissions IS 'Many-to-many mapping: Roles to Permissions';
COMMENT ON TABLE platform_user_roles IS 'Many-to-many mapping: Users to Roles';
COMMENT ON TABLE platform_user_access IS 'Direct user access/permission tracking for fine-grained control';

