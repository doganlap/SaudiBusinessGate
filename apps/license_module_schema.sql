-- License Module Schema
-- Version 1.0

-- Core tables for the License & Renewal module

-- licenses: Catalog of available licenses (SKUs)
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_feature_map: Maps features to licenses, defining entitlements and limits
CREATE TABLE license_feature_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id),
    feature_id UUID NOT NULL REFERENCES license_features(id),
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
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tenant_license_usage: Tracks usage of licensed features
CREATE TABLE tenant_license_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_license_id UUID NOT NULL REFERENCES tenant_licenses(id),
    feature_id UUID NOT NULL REFERENCES license_features(id),
    used_value INT NOT NULL,
    usage_period_start TIMESTAMPTZ NOT NULL,
    usage_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- license_events: Immutable log of all license-related events
CREATE TABLE license_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    license_id UUID,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'activated', 'suspended', 'renewed', 'blocked'
    event_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- dunning_schedules: Configuration for renewal and dunning actions
CREATE TABLE dunning_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    days_relative_to_end INT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'email', 'create_quote', 'escalate_case'
    template_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- v_renewals_120d: View for the renewal pipeline
CREATE OR REPLACE VIEW v_renewals_120d AS
SELECT
    tl.id AS tenant_license_id,
    tl.tenant_id,
    l.license_name,
    tl.start_date,
    tl.end_date,
    (tl.end_date - NOW()::date) AS days_until_expiry
FROM
    tenant_licenses tl
JOIN
    licenses l ON tl.license_id = l.id
WHERE
    tl.is_active = TRUE
    AND tl.end_date BETWEEN NOW() AND NOW() + INTERVAL '120 days';