-- Platform Admin Database Schema
-- Multi-tenant management, users, and platform administration

-- Tenants Table (Master tenant registry)
CREATE TABLE IF NOT EXISTS platform_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) UNIQUE NOT NULL, -- Used as foreign key in other tables
    tenant_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE, -- Custom domain for white-label
    subdomain VARCHAR(100) UNIQUE, -- Subdomain like 'acme.doganhub.com'
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, inactive, trial
    subscription_plan VARCHAR(100) DEFAULT 'basic', -- basic, professional, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired, trial
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 10,
    current_users INTEGER DEFAULT 0,
    storage_limit_gb INTEGER DEFAULT 10,
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    
    -- Contact Information
    company_name VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    billing_email VARCHAR(255),
    
    -- Address
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255) DEFAULT 'US',
    postal_code VARCHAR(20),
    
    -- Settings
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    language VARCHAR(10) DEFAULT 'en',
    
    -- White-label customization
    logo_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color code
    secondary_color VARCHAR(7),
    custom_css TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Indexes
    INDEX idx_platform_tenants_status (status),
    INDEX idx_platform_tenants_subscription (subscription_plan, subscription_status),
    INDEX idx_platform_tenants_domain (domain),
    INDEX idx_platform_tenants_subdomain (subdomain)
);

-- Platform Users Table (Cross-tenant user management)
CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Internal user ID
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(511) GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
    
    -- Authentication
    password_hash VARCHAR(255), -- For local auth
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Profile
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    title VARCHAR(255),
    department VARCHAR(255),
    
    -- Status and Permissions
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, pending
    role VARCHAR(100) DEFAULT 'user', -- super_admin, tenant_admin, manager, user, viewer
    permissions TEXT[], -- Array of permission strings
    
    -- Multi-tenant access
    is_super_admin BOOLEAN DEFAULT false, -- Can access multiple tenants
    accessible_tenants TEXT[], -- Array of tenant_ids this user can access
    
    -- Login tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    login_count INTEGER DEFAULT 0,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    recovery_codes TEXT[],
    
    -- Preferences
    timezone VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(50) DEFAULT 'light', -- light, dark, auto
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Unique constraint for email per tenant
    UNIQUE(tenant_id, email),
    UNIQUE(tenant_id, user_id),
    
    -- Indexes
    INDEX idx_platform_users_tenant (tenant_id),
    INDEX idx_platform_users_email (email),
    INDEX idx_platform_users_status (status),
    INDEX idx_platform_users_role (role),
    INDEX idx_platform_users_super_admin (is_super_admin)
);

-- Platform Settings Table (Global platform configuration)
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- general, security, billing, integrations, etc.
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json, array
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for setting per tenant
    UNIQUE(tenant_id, category, setting_key),
    
    -- Indexes
    INDEX idx_platform_settings_tenant (tenant_id),
    INDEX idx_platform_settings_category (category),
    INDEX idx_platform_settings_key (setting_key)
);

-- Platform Audit Log (Track all admin actions)
CREATE TABLE IF NOT EXISTS platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) REFERENCES platform_tenants(tenant_id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    action VARCHAR(255) NOT NULL, -- create_user, update_tenant, delete_data, etc.
    resource_type VARCHAR(100), -- user, tenant, setting, etc.
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_platform_audit_tenant (tenant_id),
    INDEX idx_platform_audit_user (user_id),
    INDEX idx_platform_audit_action (action),
    INDEX idx_platform_audit_resource (resource_type, resource_id),
    INDEX idx_platform_audit_created (created_at)
);

-- Platform API Keys (For integrations and external access)
CREATE TABLE IF NOT EXISTS platform_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret_hash VARCHAR(255),
    permissions TEXT[], -- Array of allowed permissions
    rate_limit_per_hour INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_platform_api_keys_tenant (tenant_id),
    INDEX idx_platform_api_keys_key (api_key),
    INDEX idx_platform_api_keys_active (is_active)
);

-- Sample data for testing
INSERT INTO platform_tenants (tenant_id, tenant_name, contact_email, company_name, status, subscription_plan) VALUES
('default-tenant', 'Default Organization', 'admin@default.com', 'Default Company', 'active', 'enterprise'),
('demo-tenant', 'Demo Organization', 'demo@demo.com', 'Demo Company', 'trial', 'professional'),
('test-tenant', 'Test Organization', 'test@test.com', 'Test Company', 'active', 'basic')
ON CONFLICT (tenant_id) DO NOTHING;

INSERT INTO platform_users (tenant_id, user_id, email, first_name, last_name, role, status, is_super_admin) VALUES
('default-tenant', 'admin-001', 'admin@default.com', 'System', 'Administrator', 'super_admin', 'active', true),
('default-tenant', 'user-001', 'sarah.johnson@default.com', 'Sarah', 'Johnson', 'tenant_admin', 'active', false),
('default-tenant', 'user-002', 'mike.chen@default.com', 'Mike', 'Chen', 'manager', 'active', false),
('demo-tenant', 'demo-001', 'demo@demo.com', 'Demo', 'User', 'tenant_admin', 'active', false)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Sample platform settings
INSERT INTO platform_settings (tenant_id, category, setting_key, setting_value, setting_type) VALUES
('default-tenant', 'general', 'platform_name', 'DoganHub Platform', 'string'),
('default-tenant', 'general', 'support_email', 'support@doganhub.com', 'string'),
('default-tenant', 'security', 'session_timeout', '3600', 'number'),
('default-tenant', 'security', 'require_2fa', 'false', 'boolean'),
('demo-tenant', 'general', 'platform_name', 'Demo Platform', 'string')
ON CONFLICT (tenant_id, category, setting_key) DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_tenants_updated_at BEFORE UPDATE ON platform_tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_users_updated_at BEFORE UPDATE ON platform_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
