-- Complete License Management Migration Script
-- Version 2.0 - Enhanced for full license management system

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS license_events CASCADE;
DROP TABLE IF EXISTS tenant_license_usage CASCADE;
DROP TABLE IF EXISTS tenant_licenses CASCADE;
DROP TABLE IF EXISTS license_feature_map CASCADE;
DROP TABLE IF EXISTS license_features CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS dunning_schedules CASCADE;
DROP TABLE IF EXISTS renewal_communications CASCADE;
DROP TABLE IF EXISTS license_renewals CASCADE;
DROP TABLE IF EXISTS usage_aggregations CASCADE;
DROP TABLE IF EXISTS license_notifications CASCADE;
DROP VIEW IF EXISTS v_renewals_120d CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core tables for the License & Renewal module

-- licenses: Catalog of available licenses (SKUs)
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'basic', -- basic, professional, enterprise
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, annual, one-time
    max_users INT,
    max_storage_gb INT,
    max_api_calls INT,
    features_included TEXT[], -- Array of feature codes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_features: Defines individual features that can be licensed
CREATE TABLE license_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_code VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    module_layer INT, -- Maps to the 12 layers
    category VARCHAR(100), -- e.g., 'core', 'analytics', 'ai', 'integrations'
    is_countable BOOLEAN DEFAULT FALSE, -- Whether this feature has usage limits
    default_limit INT, -- Default limit if applicable
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_feature_map: Maps features to licenses, defining entitlements and limits
CREATE TABLE license_feature_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES license_features(id) ON DELETE CASCADE,
    limit_value INT, -- e.g., number of seats, API calls, etc. NULL for unlimited
    is_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE (license_id, feature_id)
);

-- tenant_licenses: Assigns licenses to tenants
CREATE TABLE tenant_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- FK to your tenants/organizations table
    license_id UUID NOT NULL REFERENCES licenses(id),
    contract_id UUID, -- FK to your contracts table (Layer 6)
    invoice_id UUID, -- FK to your invoices table (Layer 8)
    license_key VARCHAR(255) UNIQUE, -- Unique license key for the tenant
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, suspended, cancelled, trial
    auto_renew BOOLEAN DEFAULT TRUE,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    monthly_cost NUMERIC(10, 2),
    annual_cost NUMERIC(10, 2),
    current_users INT DEFAULT 0,
    current_storage_gb NUMERIC(10, 2) DEFAULT 0,
    current_api_calls INT DEFAULT 0,
    is_trial BOOLEAN DEFAULT FALSE,
    trial_days_remaining INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_renewals: Track renewal pipeline and communications
CREATE TABLE license_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id) ON DELETE CASCADE,
    renewal_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    renewal_type VARCHAR(50) DEFAULT 'standard', -- standard, upgrade, downgrade
    probability INT DEFAULT 50, -- 0-100 renewal probability percentage
    weighted_value NUMERIC(10, 2), -- probability * annual value
    risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    assigned_to UUID, -- Sales rep or account manager
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- renewal_communications: Track all renewal-related communications
CREATE TABLE renewal_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renewal_id UUID NOT NULL REFERENCES license_renewals(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- email, call, meeting, proposal_sent
    contact_person VARCHAR(255),
    subject VARCHAR(500),
    notes TEXT,
    next_follow_up TIMESTAMPTZ,
    created_by UUID, -- User who created the communication
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tenant_license_usage: Tracks usage of licensed features
CREATE TABLE tenant_license_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES license_features(id),
    used_value INT NOT NULL,
    usage_period_start TIMESTAMPTZ NOT NULL,
    usage_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- usage_aggregations: Pre-calculated usage statistics for performance
CREATE TABLE usage_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id) ON DELETE CASCADE,
    aggregation_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_users INT DEFAULT 0,
    total_storage_gb NUMERIC(10, 2) DEFAULT 0,
    total_api_calls INT DEFAULT 0,
    feature_usage JSONB, -- Detailed feature usage as JSON
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_license_id, aggregation_period, period_start)
);

-- license_events: Immutable log of all license-related events
CREATE TABLE license_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tenant_license_id UUID REFERENCES tenant_licenses(id),
    license_id UUID REFERENCES licenses(id),
    event_type VARCHAR(100) NOT NULL, -- e.g., 'activated', 'suspended', 'renewed', 'blocked', 'upgraded'
    event_details JSONB,
    user_id UUID, -- Who performed the action
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_notifications: Track notification preferences and delivery
CREATE TABLE license_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- usage_warning, renewal_reminder, upgrade_suggestion
    delivery_method VARCHAR(20) DEFAULT 'email', -- email, sms, dashboard
    template_name VARCHAR(100),
    is_enabled BOOLEAN DEFAULT TRUE,
    trigger_conditions JSONB, -- Conditions for when to send notification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- dunning_schedules: Configuration for renewal and dunning actions
CREATE TABLE dunning_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    days_relative_to_end INT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'email', 'create_quote', 'escalate_case'
    template_id VARCHAR(100),
    escalation_level INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX idx_tenant_licenses_tenant_id ON tenant_licenses(tenant_id);
CREATE INDEX idx_tenant_licenses_status ON tenant_licenses(status);
CREATE INDEX idx_tenant_licenses_end_date ON tenant_licenses(end_date);
CREATE INDEX idx_tenant_licenses_auto_renew ON tenant_licenses(auto_renew);

CREATE INDEX idx_license_renewals_renewal_date ON license_renewals(renewal_date);
CREATE INDEX idx_license_renewals_status ON license_renewals(status);
CREATE INDEX idx_license_renewals_probability ON license_renewals(probability);

CREATE INDEX idx_tenant_license_usage_tenant_license_id ON tenant_license_usage(tenant_license_id);
CREATE INDEX idx_tenant_license_usage_period ON tenant_license_usage(usage_period_start, usage_period_end);

CREATE INDEX idx_usage_aggregations_tenant_license_id ON usage_aggregations(tenant_license_id);
CREATE INDEX idx_usage_aggregations_period ON usage_aggregations(period_start, period_end);

CREATE INDEX idx_license_events_tenant_id ON license_events(tenant_id);
CREATE INDEX idx_license_events_event_type ON license_events(event_type);
CREATE INDEX idx_license_events_created_at ON license_events(created_at);

-- Create Views

-- v_renewals_120d: View for the renewal pipeline (next 120 days)
CREATE OR REPLACE VIEW v_renewals_120d AS
SELECT
    tl.id AS tenant_license_id,
    tl.tenant_id,
    l.license_name,
    l.sku,
    tl.license_key,
    tl.start_date,
    tl.end_date,
    tl.status,
    tl.auto_renew,
    tl.monthly_cost,
    tl.annual_cost,
    (tl.end_date::date - CURRENT_DATE) AS days_until_expiry,
    COALESCE(lr.probability, 50) AS renewal_probability,
    COALESCE(lr.risk_level, 'medium') AS risk_level,
    COALESCE(lr.status, 'pending') AS renewal_status,
    lr.assigned_to,
    lr.weighted_value
FROM
    tenant_licenses tl
JOIN
    licenses l ON tl.license_id = l.id
LEFT JOIN
    license_renewals lr ON tl.id = lr.tenant_license_id
WHERE
    tl.is_active = TRUE
    AND tl.status = 'active'
    AND tl.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '120 days'
ORDER BY
    tl.end_date ASC;

-- v_license_usage_summary: Current usage summary per tenant
CREATE OR REPLACE VIEW v_license_usage_summary AS
SELECT
    tl.id AS tenant_license_id,
    tl.tenant_id,
    l.license_name,
    l.sku,
    tl.current_users,
    l.max_users,
    CASE 
        WHEN l.max_users > 0 THEN ROUND((tl.current_users::NUMERIC / l.max_users * 100), 2)
        ELSE 0
    END AS user_usage_percentage,
    tl.current_storage_gb,
    l.max_storage_gb,
    CASE 
        WHEN l.max_storage_gb > 0 THEN ROUND((tl.current_storage_gb / l.max_storage_gb * 100), 2)
        ELSE 0
    END AS storage_usage_percentage,
    tl.current_api_calls,
    l.max_api_calls,
    CASE 
        WHEN l.max_api_calls > 0 THEN ROUND((tl.current_api_calls::NUMERIC / l.max_api_calls * 100), 2)
        ELSE 0
    END AS api_usage_percentage,
    tl.status,
    tl.end_date
FROM
    tenant_licenses tl
JOIN
    licenses l ON tl.license_id = l.id
WHERE
    tl.is_active = TRUE;

-- v_usage_trends: Monthly usage trends
CREATE OR REPLACE VIEW v_usage_trends AS
SELECT
    ua.tenant_license_id,
    tl.tenant_id,
    l.license_name,
    DATE_TRUNC('month', ua.period_start) AS month,
    AVG(ua.total_users) AS avg_users,
    AVG(ua.total_storage_gb) AS avg_storage_gb,
    AVG(ua.total_api_calls) AS avg_api_calls
FROM
    usage_aggregations ua
JOIN
    tenant_licenses tl ON ua.tenant_license_id = tl.id
JOIN
    licenses l ON tl.license_id = l.id
WHERE
    ua.aggregation_period = 'monthly'
GROUP BY
    ua.tenant_license_id, tl.tenant_id, l.license_name, DATE_TRUNC('month', ua.period_start)
ORDER BY
    month DESC;

-- Functions for common operations

-- Function to check feature availability for a tenant
CREATE OR REPLACE FUNCTION check_feature_availability(
    p_tenant_id UUID,
    p_feature_code VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    feature_available BOOLEAN := FALSE;
BEGIN
    SELECT TRUE INTO feature_available
    FROM tenant_licenses tl
    JOIN license_feature_map lfm ON tl.license_id = lfm.license_id
    JOIN license_features lf ON lfm.feature_id = lf.id
    WHERE tl.tenant_id = p_tenant_id
        AND lf.feature_code = p_feature_code
        AND tl.is_active = TRUE
        AND tl.status = 'active'
        AND tl.end_date > NOW()
        AND lfm.is_enabled = TRUE
    LIMIT 1;
    
    RETURN COALESCE(feature_available, FALSE);
END;
$$ LANGUAGE plpgsql;