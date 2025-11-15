-- =====================================================
-- Saudi Store - Advanced Multi-tenant Schema
-- White-label, Multi-team, Role-based Architecture
-- =====================================================

-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- Define available subscription tiers
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan Details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_name JSONB NOT NULL, -- {'en': 'Professional', 'ar': 'احترافي'}
    description JSONB,
    
    -- Pricing
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Plan Type
    plan_type VARCHAR(50) DEFAULT 'standard' CHECK (plan_type IN ('free', 'trial', 'standard', 'professional', 'enterprise', 'whitelabel')),
    
    -- Features & Limits
    max_users INTEGER DEFAULT 5,
    max_teams INTEGER DEFAULT 1,
    max_storage_gb INTEGER DEFAULT 10,
    max_api_calls_per_month INTEGER DEFAULT 10000,
    
    -- Module Access (JSON array of enabled modules)
    enabled_modules JSONB DEFAULT '[]', -- ['crm', 'sales', 'finance', 'hr', etc.]
    
    -- Feature Flags
    features JSONB DEFAULT '{}', -- {ai_agents: true, white_label: true, custom_domain: true}
    
    -- White-label Features
    allow_white_label BOOLEAN DEFAULT FALSE,
    allow_custom_branding BOOLEAN DEFAULT FALSE,
    allow_custom_domain BOOLEAN DEFAULT FALSE,
    allow_reselling BOOLEAN DEFAULT FALSE,
    reseller_commission_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MODULES TABLE
-- Define all available modules/features
-- =====================================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Module Details
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_name JSONB NOT NULL, -- {'en': 'CRM', 'ar': 'إدارة العملاء'}
    description JSONB,
    icon VARCHAR(50), -- Icon name/path
    
    -- Module Type
    module_type VARCHAR(50) CHECK (module_type IN ('core', 'addon', 'premium', 'enterprise')),
    category VARCHAR(100), -- 'operations', 'finance', 'hr', etc.
    
    -- Routing
    base_path VARCHAR(255) NOT NULL, -- '/crm', '/sales', etc.
    
    -- Dependencies
    parent_module_id UUID REFERENCES modules(id),
    required_modules JSONB DEFAULT '[]', -- Module IDs this depends on
    
    -- Pricing (for addon modules)
    monthly_price DECIMAL(10, 2) DEFAULT 0,
    is_addon BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_beta BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAMS TABLE
-- Multi-team support within tenants
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Association
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Team Details
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Team Type
    team_type VARCHAR(50) DEFAULT 'department' CHECK (team_type IN ('department', 'project', 'cross_functional', 'temporary')),
    
    -- Hierarchy
    parent_team_id UUID REFERENCES teams(id),
    
    -- Team Lead
    team_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint: tenant + slug
    CONSTRAINT unique_team_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- =====================================================
-- ROLES TABLE
-- Flexible role-based access control
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Association (null = system-wide role)
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Role Details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    display_name JSONB NOT NULL,
    description JSONB,
    
    -- Role Type
    role_type VARCHAR(50) DEFAULT 'custom' CHECK (role_type IN ('system', 'tenant', 'team', 'custom')),
    role_level INTEGER DEFAULT 1, -- 1=viewer, 5=admin, 10=owner
    
    -- Permissions (JSON array)
    permissions JSONB DEFAULT '[]', -- ['users:read', 'users:write', 'crm:*', etc.]
    
    -- Module Access
    module_access JSONB DEFAULT '{}', -- {crm: 'full', sales: 'read', finance: 'none'}
    
    -- Is this a default role?
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_role_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- =====================================================
-- USER_TEAMS TABLE
-- Many-to-many: Users can belong to multiple teams
-- =====================================================
CREATE TABLE IF NOT EXISTS user_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Role in this team
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    
    -- Permissions specific to this team
    team_permissions JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_user_team UNIQUE (user_id, team_id)
);

-- =====================================================
-- TENANT_MODULES TABLE
-- Track which modules are enabled for each tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    
    -- Status
    is_enabled BOOLEAN DEFAULT TRUE,
    enabled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disabled_at TIMESTAMP WITH TIME ZONE,
    
    -- Module-specific settings
    module_settings JSONB DEFAULT '{}',
    
    -- Trial/Subscription
    is_trial BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_tenant_module UNIQUE (tenant_id, module_id)
);

-- =====================================================
-- WHITE_LABEL_CONFIGS TABLE
-- White-label branding configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS white_label_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Association
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Branding
    company_name VARCHAR(255),
    logo_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    
    -- Colors (JSON)
    primary_color VARCHAR(7), -- #0ea5e9
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    theme_colors JSONB DEFAULT '{}',
    
    -- Domain
    custom_domain VARCHAR(255) UNIQUE,
    domain_verified BOOLEAN DEFAULT FALSE,
    domain_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Email Branding
    email_from_name VARCHAR(255),
    email_from_address VARCHAR(255),
    email_reply_to VARCHAR(255),
    email_logo_url TEXT,
    
    -- Legal
    terms_url TEXT,
    privacy_url TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    
    -- Social Links
    social_links JSONB DEFAULT '{}',
    
    -- Custom CSS/JS
    custom_css TEXT,
    custom_js TEXT,
    custom_head_html TEXT,
    
    -- Features
    hide_powered_by BOOLEAN DEFAULT FALSE,
    show_custom_footer BOOLEAN DEFAULT FALSE,
    custom_footer_html TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESELLER_CONFIGS TABLE
-- Reseller program configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant (who is reselling)
    reseller_tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Reseller Details
    reseller_name VARCHAR(255) NOT NULL,
    reseller_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Commission
    commission_rate DECIMAL(5, 2) DEFAULT 20.00, -- 20%
    commission_type VARCHAR(50) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    fixed_commission_amount DECIMAL(10, 2),
    
    -- Limits
    max_clients INTEGER,
    max_revenue_per_month DECIMAL(15, 2),
    
    -- Pricing Control
    can_set_custom_pricing BOOLEAN DEFAULT FALSE,
    markup_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Features
    can_manage_clients BOOLEAN DEFAULT TRUE,
    can_white_label BOOLEAN DEFAULT TRUE,
    can_create_sub_resellers BOOLEAN DEFAULT FALSE,
    
    -- Billing
    payout_method VARCHAR(50), -- 'bank_transfer', 'paypal', etc.
    payout_schedule VARCHAR(50) DEFAULT 'monthly',
    min_payout_amount DECIMAL(10, 2) DEFAULT 100.00,
    
    -- Stats
    total_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    total_commission_paid DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TENANT_SUBSCRIPTIONS TABLE
-- Track tenant subscriptions and billing
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    -- Reseller (if subscribed through reseller)
    reseller_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Subscription Details
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'past_due', 'cancelled', 'suspended')),
    
    -- Billing
    billing_cycle VARCHAR(50) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Dates
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    
    -- Usage Tracking
    users_count INTEGER DEFAULT 0,
    teams_count INTEGER DEFAULT 0,
    storage_used_gb DECIMAL(10, 2) DEFAULT 0,
    api_calls_this_month INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Subscription Plans
CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_type ON subscription_plans(plan_type);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Modules
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_type ON modules(module_type);
CREATE INDEX idx_modules_sort_order ON modules(sort_order);

-- Teams
CREATE INDEX idx_teams_tenant_id ON teams(tenant_id);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_parent_id ON teams(parent_team_id);
CREATE INDEX idx_teams_lead_id ON teams(team_lead_id);

-- Roles
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_type ON roles(role_type);
CREATE INDEX idx_roles_level ON roles(role_level);

-- User Teams
CREATE INDEX idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX idx_user_teams_team_id ON user_teams(team_id);
CREATE INDEX idx_user_teams_role_id ON user_teams(role_id);

-- Tenant Modules
CREATE INDEX idx_tenant_modules_tenant_id ON tenant_modules(tenant_id);
CREATE INDEX idx_tenant_modules_module_id ON tenant_modules(module_id);
CREATE INDEX idx_tenant_modules_enabled ON tenant_modules(is_enabled);

-- White Label
CREATE INDEX idx_white_label_tenant_id ON white_label_configs(tenant_id);
CREATE INDEX idx_white_label_domain ON white_label_configs(custom_domain);

-- Reseller
CREATE INDEX idx_reseller_tenant_id ON reseller_configs(reseller_tenant_id);
CREATE INDEX idx_reseller_code ON reseller_configs(reseller_code);

-- Subscriptions
CREATE INDEX idx_tenant_subs_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subs_plan_id ON tenant_subscriptions(plan_id);
CREATE INDEX idx_tenant_subs_reseller_id ON tenant_subscriptions(reseller_id);
CREATE INDEX idx_tenant_subs_status ON tenant_subscriptions(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_teams_updated_at
    BEFORE UPDATE ON user_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_modules_updated_at
    BEFORE UPDATE ON tenant_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_updated_at
    BEFORE UPDATE ON white_label_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reseller_updated_at
    BEFORE UPDATE ON reseller_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subs_updated_at
    BEFORE UPDATE ON tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Subscription plans and pricing tiers';
COMMENT ON TABLE modules IS 'Available modules/features in the platform';
COMMENT ON TABLE teams IS 'Teams within tenants for multi-team support';
COMMENT ON TABLE roles IS 'Flexible role-based access control';
COMMENT ON TABLE user_teams IS 'Many-to-many relationship: users in teams';
COMMENT ON TABLE tenant_modules IS 'Track enabled modules per tenant';
COMMENT ON TABLE white_label_configs IS 'White-label branding configurations';
COMMENT ON TABLE reseller_configs IS 'Reseller program configurations';
COMMENT ON TABLE tenant_subscriptions IS 'Tenant subscription and billing tracking';
