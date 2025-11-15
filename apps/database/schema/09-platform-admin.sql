-- ============================================================================
-- PLATFORM ADMINISTRATION - Complete Database Schema
-- Multi-tenant platform management with RBAC and security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANTS - Multi-tenant Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_name_ar VARCHAR(255),
    
    -- Subscription
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'basic', -- basic, professional, enterprise
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, cancelled, trial
    subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subscription_end_date DATE,
    trial_ends_at DATE,
    
    -- Limits
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 50,
    max_api_calls_per_day INTEGER DEFAULT 10000,
    current_users INTEGER DEFAULT 0,
    current_storage_gb DECIMAL(10,2) DEFAULT 0,
    current_api_calls_today INTEGER DEFAULT 0,
    
    -- White-Label
    custom_domain VARCHAR(255),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    custom_css TEXT,
    custom_footer TEXT,
    
    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(50),
    billing_email VARCHAR(255),
    support_email VARCHAR(255),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    postal_code VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    
    -- Features
    enabled_modules TEXT[] DEFAULT ARRAY['dashboard'],
    feature_flags JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    INDEX idx_tenants_code (tenant_code),
    INDEX idx_tenants_status (subscription_status),
    INDEX idx_tenants_tier (subscription_tier),
    INDEX idx_tenants_active (is_active)
);

-- ============================================================================
-- USERS - User Management with Security
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    password_hash TEXT NOT NULL,
    
    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en', -- en, ar
    timezone VARCHAR(100) DEFAULT 'Asia/Riyadh',
    
    -- Role & Permissions
    role VARCHAR(100) NOT NULL DEFAULT 'user',
    custom_permissions JSONB DEFAULT '[]',
    department VARCHAR(100),
    job_title VARCHAR(100),
    employee_id VARCHAR(50),
    
    -- Security
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret TEXT,
    mfa_backup_codes TEXT[],
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    must_change_password BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    security_questions JSONB,
    
    -- Session
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    current_session_id VARCHAR(255),
    
    -- Preferences
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deactivation_reason TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT uk_user_email UNIQUE(tenant_id, email),
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (is_active),
    INDEX idx_users_last_login (last_login_at)
);

-- ============================================================================
-- ROLES - Role Definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Role Definition
    role_code VARCHAR(100) NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_name_ar VARCHAR(255),
    role_description TEXT,
    role_description_ar TEXT,
    
    -- Permissions
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    is_custom_role BOOLEAN DEFAULT true,
    
    -- Hierarchy
    parent_role_id UUID REFERENCES platform_roles(id),
    role_level INTEGER DEFAULT 1,
    
    -- Scope
    applies_to_modules TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT uk_role_code UNIQUE(tenant_id, role_code),
    INDEX idx_roles_tenant (tenant_id),
    INDEX idx_roles_system (is_system_role),
    INDEX idx_roles_active (is_active)
);

-- ============================================================================
-- PERMISSIONS - Permission Catalog
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Permission Definition
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    permission_name_ar VARCHAR(255),
    permission_category VARCHAR(100) NOT NULL,
    
    -- Scope
    resource_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- view, create, edit, delete, approve, export, admin
    
    -- Description
    description TEXT,
    description_ar TEXT,
    
    -- Metadata
    is_dangerous BOOLEAN DEFAULT false,
    requires_mfa BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_permissions_category (permission_category),
    INDEX idx_permissions_resource (resource_type),
    INDEX idx_permissions_action (action)
);

-- ============================================================================
-- AUDIT LOGS - Complete Audit Trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Actor
    user_id UUID REFERENCES platform_users(id),
    actor_type VARCHAR(50) NOT NULL, -- user, system, api, agent
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    
    -- Action
    action_type VARCHAR(100) NOT NULL,
    action_category VARCHAR(100) NOT NULL,
    action_description TEXT,
    action_description_ar TEXT,
    
    -- Target
    target_type VARCHAR(100),
    target_id VARCHAR(255),
    target_name VARCHAR(255),
    
    -- Changes
    old_value JSONB,
    new_value JSONB,
    changes JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    
    -- Result
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Metadata
    metadata JSONB,
    duration_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_category (action_category),
    INDEX idx_audit_date (created_at),
    INDEX idx_audit_target (target_type, target_id),
    INDEX idx_audit_success (success)
);

-- ============================================================================
-- SYSTEM SETTINGS - Configuration Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Setting
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_category VARCHAR(100) NOT NULL,
    setting_type VARCHAR(50) NOT NULL, -- string, number, boolean, json, encrypted
    
    -- Metadata
    description TEXT,
    description_ar TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_system_setting BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    
    -- Validation
    validation_rules JSONB,
    default_value JSONB,
    
    -- Audit
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    
    CONSTRAINT uk_setting UNIQUE(tenant_id, setting_key),
    INDEX idx_settings_tenant (tenant_id),
    INDEX idx_settings_category (setting_category),
    INDEX idx_settings_public (is_public)
);

-- ============================================================================
-- API KEYS - API Key Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
    
    -- Key
    key_name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    
    -- Permissions
    scopes JSONB DEFAULT '[]',
    allowed_ips TEXT[],
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Usage
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    last_used_ip INET,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by VARCHAR(255),
    revocation_reason TEXT,
    
    INDEX idx_api_keys_tenant (tenant_id),
    INDEX idx_api_keys_user (user_id),
    INDEX idx_api_keys_prefix (key_prefix),
    INDEX idx_api_keys_active (is_active)
);

-- ============================================================================
-- USER SESSIONS - Session Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
    
    -- Session
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    
    -- Device
    device_type VARCHAR(50), -- desktop, mobile, tablet
    device_name VARCHAR(255),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    
    -- Location
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Security
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_sessions_tenant (tenant_id),
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_active (is_active, expires_at),
    INDEX idx_sessions_ip (ip_address)
);

-- ============================================================================
-- ACTIVITY LOGS - User Activity Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES platform_user_sessions(id) ON DELETE SET NULL,
    
    -- Activity
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    
    -- Context
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_activity_tenant (tenant_id),
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_date (created_at)
);

-- ============================================================================
-- SAMPLE DATA - System Roles and Permissions
-- ============================================================================

-- Insert System Permissions
INSERT INTO platform_permissions (permission_code, permission_name, permission_name_ar, permission_category, resource_type, action, description, description_ar) VALUES
-- Tenant Management
('tenant.view', 'View Tenants', 'عرض المستأجرين', 'tenant_management', 'tenant', 'view', 'View tenant information', 'عرض معلومات المستأجر'),
('tenant.create', 'Create Tenants', 'إنشاء المستأجرين', 'tenant_management', 'tenant', 'create', 'Create new tenants', 'إنشاء مستأجرين جدد'),
('tenant.edit', 'Edit Tenants', 'تحرير المستأجرين', 'tenant_management', 'tenant', 'edit', 'Edit tenant information', 'تحرير معلومات المستأجر'),
('tenant.delete', 'Delete Tenants', 'حذف المستأجرين', 'tenant_management', 'tenant', 'delete', 'Delete tenants', 'حذف المستأجرين'),
('tenant.admin', 'Tenant Admin', 'مسؤول المستأجر', 'tenant_management', 'tenant', 'admin', 'Full tenant administration', 'إدارة كاملة للمستأجر'),

-- User Management
('user.view', 'View Users', 'عرض المستخدمين', 'user_management', 'user', 'view', 'View user information', 'عرض معلومات المستخدم'),
('user.create', 'Create Users', 'إنشاء المستخدمين', 'user_management', 'user', 'create', 'Create new users', 'إنشاء مستخدمين جدد'),
('user.edit', 'Edit Users', 'تحرير المستخدمين', 'user_management', 'user', 'edit', 'Edit user information', 'تحرير معلومات المستخدم'),
('user.delete', 'Delete Users', 'حذف المستخدمين', 'user_management', 'user', 'delete', 'Delete users', 'حذف المستخدمين'),
('user.admin', 'User Admin', 'مسؤول المستخدمين', 'user_management', 'user', 'admin', 'Full user administration', 'إدارة كاملة للمستخدمين'),

-- Role Management
('role.view', 'View Roles', 'عرض الأدوار', 'role_management', 'role', 'view', 'View role information', 'عرض معلومات الدور'),
('role.create', 'Create Roles', 'إنشاء الأدوار', 'role_management', 'role', 'create', 'Create new roles', 'إنشاء أدوار جديدة'),
('role.edit', 'Edit Roles', 'تحرير الأدوار', 'role_management', 'role', 'edit', 'Edit role information', 'تحرير معلومات الدور'),
('role.delete', 'Delete Roles', 'حذف الأدوار', 'role_management', 'role', 'delete', 'Delete roles', 'حذف الأدوار'),

-- Audit Logs
('audit.view', 'View Audit Logs', 'عرض سجلات التدقيق', 'audit', 'audit_log', 'view', 'View audit logs', 'عرض سجلات التدقيق'),
('audit.export', 'Export Audit Logs', 'تصدير سجلات التدقيق', 'audit', 'audit_log', 'export', 'Export audit logs', 'تصدير سجلات التدقيق'),

-- Settings
('settings.view', 'View Settings', 'عرض الإعدادات', 'settings', 'setting', 'view', 'View system settings', 'عرض إعدادات النظام'),
('settings.edit', 'Edit Settings', 'تحرير الإعدادات', 'settings', 'setting', 'edit', 'Edit system settings', 'تحرير إعدادات النظام'),

-- API Keys
('apikey.view', 'View API Keys', 'عرض مفاتيح API', 'api', 'api_key', 'view', 'View API keys', 'عرض مفاتيح API'),
('apikey.create', 'Create API Keys', 'إنشاء مفاتيح API', 'api', 'api_key', 'create', 'Create API keys', 'إنشاء مفاتيح API'),
('apikey.delete', 'Delete API Keys', 'حذف مفاتيح API', 'api', 'api_key', 'delete', 'Delete API keys', 'حذف مفاتيح API')

ON CONFLICT (permission_code) DO NOTHING;

-- Insert System Roles
INSERT INTO platform_roles (tenant_id, role_code, role_name, role_name_ar, role_description, role_description_ar, permissions, is_system_role, is_custom_role, role_level) VALUES
(NULL, 'super_admin', 'Super Administrator', 'مسؤول النظام الأعلى', 'Full system access across all tenants', 'وصول كامل للنظام عبر جميع المستأجرين', 
 '["tenant.admin", "user.admin", "role.admin", "audit.view", "audit.export", "settings.edit", "apikey.admin"]', 
 true, false, 10),

(NULL, 'tenant_admin', 'Tenant Administrator', 'مدير المستأجر', 'Full access within tenant scope', 'وصول كامل ضمن نطاق المستأجر',
 '["user.admin", "role.admin", "audit.view", "settings.edit", "apikey.create"]',
 true, false, 8),

(NULL, 'user_manager', 'User Manager', 'مدير المستخدمين', 'Manage users and roles', 'إدارة المستخدمين والأدوار',
 '["user.view", "user.create", "user.edit", "role.view"]',
 true, false, 6),

(NULL, 'security_officer', 'Security Officer', 'مسؤول الأمن', 'Security and compliance management', 'إدارة الأمن والامتثال',
 '["audit.view", "audit.export", "settings.view", "user.view"]',
 true, false, 7),

(NULL, 'viewer', 'Viewer', 'مشاهد', 'Read-only access', 'وصول للقراءة فقط',
 '["user.view", "role.view", "settings.view"]',
 true, false, 1)

ON CONFLICT (tenant_id, role_code) DO NOTHING;

-- ============================================================================
-- TRIGGERS - Automatic Updates
-- ============================================================================

-- Update tenant updated_at
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

-- Update user updated_at
CREATE TRIGGER trigger_update_user_updated_at
    BEFORE UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update role updated_at
CREATE TRIGGER trigger_update_role_updated_at
    BEFORE UPDATE ON platform_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
