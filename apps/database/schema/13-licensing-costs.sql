-- ============================================
-- LICENSING & COST MANAGEMENT SYSTEM
-- Saudi Store - المتجر السعودي
-- User licenses, subscriptions, and cost tracking
-- ============================================

-- ============================================
-- 1. LICENSE TYPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS license_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- License Info
  license_code VARCHAR(50) UNIQUE NOT NULL,
  license_name VARCHAR(255) NOT NULL,
  license_name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  
  -- Pricing
  monthly_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  annual_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  setup_fee NUMERIC(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'SAR',
  
  -- Features
  features JSONB DEFAULT '[]',
  max_users INTEGER,
  max_storage_gb INTEGER,
  max_transactions_per_month INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_trial_available BOOLEAN DEFAULT false,
  trial_days INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USER LICENSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Tenant
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- License Details
  license_type_id UUID NOT NULL REFERENCES license_types(id),
  license_key VARCHAR(255) UNIQUE NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  -- Status: active, suspended, expired, cancelled, trial
  
  -- Dates
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  trial_end_date DATE,
  last_validated_at TIMESTAMP,
  
  -- Billing
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  -- Billing: monthly, annual, one-time
  next_billing_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  
  -- Usage Tracking
  current_users INTEGER DEFAULT 0,
  current_storage_gb NUMERIC(10, 2) DEFAULT 0,
  current_transactions INTEGER DEFAULT 0,
  
  -- Owner Info
  is_owner BOOLEAN DEFAULT false,
  owner_permissions JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES platform_users(id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('active', 'suspended', 'expired', 'cancelled', 'trial')
  ),
  CONSTRAINT valid_billing_cycle CHECK (
    billing_cycle IN ('monthly', 'annual', 'one-time')
  ),
  CONSTRAINT unique_user_tenant UNIQUE (user_id, tenant_id)
);

-- ============================================
-- 3. LICENSE COSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS license_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- License Reference
  user_license_id UUID NOT NULL REFERENCES user_licenses(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Cost Details
  cost_type VARCHAR(50) NOT NULL,
  -- Types: license_fee, setup_fee, overage_fee, support_fee, custom
  
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  
  -- Period
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Description
  description TEXT,
  description_ar TEXT,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  -- Status: pending, paid, overdue, cancelled, refunded
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Invoice
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_cost_type CHECK (
    cost_type IN ('license_fee', 'setup_fee', 'overage_fee', 'support_fee', 'custom')
  ),
  CONSTRAINT valid_payment_status CHECK (
    payment_status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')
  )
);

-- ============================================
-- 4. LICENSE USAGE LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS license_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- License Reference
  user_license_id UUID NOT NULL REFERENCES user_licenses(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Usage Details
  usage_type VARCHAR(50) NOT NULL,
  -- Types: login, transaction, storage, api_call, export, report
  
  usage_count INTEGER DEFAULT 1,
  usage_data JSONB DEFAULT '{}',
  
  -- Timestamp
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_usage_type CHECK (
    usage_type IN ('login', 'transaction', 'storage', 'api_call', 'export', 'report', 'other')
  )
);

-- ============================================
-- 5. OWNER PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS owner_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner Reference
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Permissions
  can_manage_licenses BOOLEAN DEFAULT true,
  can_view_costs BOOLEAN DEFAULT true,
  can_manage_billing BOOLEAN DEFAULT true,
  can_add_users BOOLEAN DEFAULT true,
  can_remove_users BOOLEAN DEFAULT true,
  can_assign_roles BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT true,
  can_export_data BOOLEAN DEFAULT true,
  can_manage_integrations BOOLEAN DEFAULT true,
  can_configure_settings BOOLEAN DEFAULT true,
  
  -- Limits
  max_users_can_add INTEGER,
  max_cost_approval_limit NUMERIC(10, 2),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_owner_tenant UNIQUE (user_id, tenant_id)
);

-- ============================================
-- 6. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_licenses_user ON user_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_tenant ON user_licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_status ON user_licenses(status);
CREATE INDEX IF NOT EXISTS idx_user_licenses_owner ON user_licenses(is_owner);
CREATE INDEX IF NOT EXISTS idx_user_licenses_end_date ON user_licenses(end_date);

CREATE INDEX IF NOT EXISTS idx_license_costs_license ON license_costs(user_license_id);
CREATE INDEX IF NOT EXISTS idx_license_costs_tenant ON license_costs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_license_costs_status ON license_costs(payment_status);
CREATE INDEX IF NOT EXISTS idx_license_costs_period ON license_costs(billing_period_start, billing_period_end);

CREATE INDEX IF NOT EXISTS idx_license_usage_tenant ON license_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_license_usage_type ON license_usage_logs(usage_type);
CREATE INDEX IF NOT EXISTS idx_license_usage_date ON license_usage_logs(logged_at);

CREATE INDEX IF NOT EXISTS idx_owner_permissions_user ON owner_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_permissions_tenant ON owner_permissions(tenant_id);

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_license_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_license_types_updated
  BEFORE UPDATE ON license_types
  FOR EACH ROW
  EXECUTE FUNCTION update_license_timestamp();

CREATE TRIGGER trg_user_licenses_updated
  BEFORE UPDATE ON user_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_license_timestamp();

CREATE TRIGGER trg_license_costs_updated
  BEFORE UPDATE ON license_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_license_timestamp();

-- ============================================
-- 8. FUNCTIONS
-- ============================================

-- Function: Generate License Key
CREATE OR REPLACE FUNCTION generate_license_key(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS VARCHAR AS $$
DECLARE
  license_key VARCHAR;
BEGIN
  license_key := 'SS-' || 
                 UPPER(SUBSTRING(p_tenant_id::TEXT, 1, 8)) || '-' ||
                 UPPER(SUBSTRING(p_user_id::TEXT, 1, 8)) || '-' ||
                 UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
  RETURN license_key;
END;
$$ LANGUAGE plpgsql;

-- Function: Check License Validity
CREATE OR REPLACE FUNCTION check_license_validity(p_user_license_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  license_record RECORD;
  is_valid BOOLEAN := false;
BEGIN
  SELECT * INTO license_record
  FROM user_licenses
  WHERE id = p_user_license_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check status
  IF license_record.status NOT IN ('active', 'trial') THEN
    RETURN false;
  END IF;
  
  -- Check expiry
  IF license_record.end_date IS NOT NULL AND license_record.end_date < CURRENT_DATE THEN
    -- Update status to expired
    UPDATE user_licenses
    SET status = 'expired'
    WHERE id = p_user_license_id;
    RETURN false;
  END IF;
  
  -- Check trial expiry
  IF license_record.status = 'trial' AND 
     license_record.trial_end_date IS NOT NULL AND 
     license_record.trial_end_date < CURRENT_DATE THEN
    UPDATE user_licenses
    SET status = 'expired'
    WHERE id = p_user_license_id;
    RETURN false;
  END IF;
  
  -- Update last validated
  UPDATE user_licenses
  SET last_validated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_license_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Monthly Cost
CREATE OR REPLACE FUNCTION calculate_monthly_cost(p_tenant_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_cost NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(lt.monthly_cost), 0) INTO total_cost
  FROM user_licenses ul
  JOIN license_types lt ON ul.license_type_id = lt.id
  WHERE ul.tenant_id = p_tenant_id
    AND ul.status IN ('active', 'trial')
    AND ul.billing_cycle = 'monthly';
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function: Log License Usage
CREATE OR REPLACE FUNCTION log_license_usage(
  p_user_license_id UUID,
  p_usage_type VARCHAR,
  p_usage_count INTEGER DEFAULT 1,
  p_usage_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get tenant_id
  SELECT tenant_id INTO v_tenant_id
  FROM user_licenses
  WHERE id = p_user_license_id;
  
  -- Insert usage log
  INSERT INTO license_usage_logs (
    user_license_id,
    tenant_id,
    usage_type,
    usage_count,
    usage_data
  ) VALUES (
    p_user_license_id,
    v_tenant_id,
    p_usage_type,
    p_usage_count,
    p_usage_data
  );
  
  -- Update current usage in user_licenses
  IF p_usage_type = 'transaction' THEN
    UPDATE user_licenses
    SET current_transactions = current_transactions + p_usage_count
    WHERE id = p_user_license_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. SAMPLE DATA
-- ============================================

-- Insert License Types
INSERT INTO license_types (
  license_code,
  license_name,
  license_name_ar,
  monthly_cost,
  annual_cost,
  setup_fee,
  features,
  max_users,
  max_storage_gb,
  max_transactions_per_month,
  is_trial_available,
  trial_days
) VALUES
  (
    'BASIC',
    'Basic License',
    'ترخيص أساسي',
    99.00,
    990.00,
    0,
    '["Dashboard Access", "Basic Reports", "Email Support"]'::jsonb,
    5,
    10,
    1000,
    true,
    14
  ),
  (
    'PROFESSIONAL',
    'Professional License',
    'ترخيص احترافي',
    299.00,
    2990.00,
    500.00,
    '["Full Dashboard", "Advanced Reports", "API Access", "Priority Support", "Custom Workflows"]'::jsonb,
    25,
    100,
    10000,
    true,
    30
  ),
  (
    'ENTERPRISE',
    'Enterprise License',
    'ترخيص مؤسسي',
    999.00,
    9990.00,
    2000.00,
    '["Unlimited Features", "White Label", "Dedicated Support", "Custom Development", "SLA Guarantee"]'::jsonb,
    NULL,
    NULL,
    NULL,
    false,
    0
  ),
  (
    'OWNER',
    'Owner License',
    'ترخيص المالك',
    0,
    0,
    0,
    '["Full Access", "All Permissions", "Cost Management", "User Management", "Billing Control"]'::jsonb,
    NULL,
    NULL,
    NULL,
    false,
    0
  )
ON CONFLICT (license_code) DO NOTHING;

-- ============================================
-- 10. VIEWS
-- ============================================

-- View: Active Licenses Summary
CREATE OR REPLACE VIEW v_active_licenses AS
SELECT 
  ul.id as license_id,
  ul.tenant_id,
  t.tenant_name,
  ul.user_id,
  u.email as user_email,
  u.full_name as user_name,
  lt.license_name,
  lt.license_name_ar,
  ul.status,
  ul.is_owner,
  ul.start_date,
  ul.end_date,
  ul.billing_cycle,
  lt.monthly_cost,
  lt.annual_cost,
  ul.current_users,
  ul.current_storage_gb,
  ul.current_transactions,
  lt.max_users,
  lt.max_storage_gb,
  lt.max_transactions_per_month
FROM user_licenses ul
JOIN license_types lt ON ul.license_type_id = lt.id
JOIN tenants t ON ul.tenant_id = t.id
JOIN platform_users u ON ul.user_id = u.id
WHERE ul.status IN ('active', 'trial');

-- View: Cost Summary by Tenant
CREATE OR REPLACE VIEW v_tenant_costs AS
SELECT 
  lc.tenant_id,
  t.tenant_name,
  DATE_TRUNC('month', lc.billing_period_start) as billing_month,
  SUM(lc.amount) as total_cost,
  COUNT(*) as cost_count,
  SUM(CASE WHEN lc.payment_status = 'paid' THEN lc.amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN lc.payment_status = 'pending' THEN lc.amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN lc.payment_status = 'overdue' THEN lc.amount ELSE 0 END) as overdue_amount
FROM license_costs lc
JOIN tenants t ON lc.tenant_id = t.id
GROUP BY lc.tenant_id, t.tenant_name, DATE_TRUNC('month', lc.billing_period_start);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE license_types IS 'Available license types and their pricing';
COMMENT ON TABLE user_licenses IS 'User license assignments and tracking';
COMMENT ON TABLE license_costs IS 'Cost tracking for licenses and services';
COMMENT ON TABLE license_usage_logs IS 'Usage tracking for license limits';
COMMENT ON TABLE owner_permissions IS 'Special permissions for tenant owners';

COMMENT ON FUNCTION generate_license_key(UUID, UUID) IS 'Generates unique license key for user';
COMMENT ON FUNCTION check_license_validity(UUID) IS 'Validates license status and expiry';
COMMENT ON FUNCTION calculate_monthly_cost(UUID) IS 'Calculates total monthly cost for tenant';
COMMENT ON FUNCTION log_license_usage(UUID, VARCHAR, INTEGER, JSONB) IS 'Logs license usage for tracking';

-- Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Licensing & Cost Management System Created!';
  RAISE NOTICE '📊 4 License Types Available';
  RAISE NOTICE '👥 User License Tracking Active';
  RAISE NOTICE '💰 Cost Management Ready';
  RAISE NOTICE '📈 Usage Logging Enabled';
  RAISE NOTICE '🔐 Owner Permissions Configured';
END $$;
