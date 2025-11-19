-- =====================================================
-- Platform Tables - Tenants and Users
-- Required for multi-tenant platform functionality
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PLATFORM_TENANTS TABLE
-- Core tenant management table
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    subdomain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'inactive', 'trial')),
    subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 10,
    current_users INTEGER DEFAULT 0,
    storage_limit_gb INTEGER DEFAULT 10,
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    company_name VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    billing_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    postal_code VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    currency VARCHAR(10) DEFAULT 'SAR',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    language VARCHAR(10) DEFAULT 'ar',
    logo_url TEXT,
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    custom_css TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for platform_tenants
CREATE INDEX IF NOT EXISTS idx_platform_tenants_tenant_id ON platform_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_status ON platform_tenants(status);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_subscription_plan ON platform_tenants(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_contact_email ON platform_tenants(contact_email);

-- =====================================================
-- PLATFORM_USERS TABLE
-- User management table linked to tenants
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    phone VARCHAR(50),
    title VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'tenant_admin', 'manager', 'user', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT false,
    accessible_tenants TEXT[] DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(50),
    login_count INTEGER DEFAULT 0,
    two_factor_enabled BOOLEAN DEFAULT false,
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'ar',
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id),
    UNIQUE(tenant_id, email)
);

-- Create indexes for platform_users
CREATE INDEX IF NOT EXISTS idx_platform_users_tenant_id ON platform_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_status ON platform_users(status);
CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform_users(role);

-- =====================================================
-- PLATFORM_SETTINGS TABLE
-- Tenant-specific settings
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES platform_tenants(tenant_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, category, setting_key)
);

-- Create indexes for platform_settings
CREATE INDEX IF NOT EXISTS idx_platform_settings_tenant_id ON platform_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to platform_tenants
DROP TRIGGER IF EXISTS update_platform_tenants_updated_at ON platform_tenants;
CREATE TRIGGER update_platform_tenants_updated_at
    BEFORE UPDATE ON platform_tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to platform_users
DROP TRIGGER IF EXISTS update_platform_users_updated_at ON platform_users;
CREATE TRIGGER update_platform_users_updated_at
    BEFORE UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to platform_settings
DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

