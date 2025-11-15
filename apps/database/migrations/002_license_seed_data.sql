-- License Management Seed Data
-- Insert initial license configurations and test data

-- Insert base license tiers
INSERT INTO licenses (license_name, sku, description, price, tier, billing_cycle, max_users, max_storage_gb, max_api_calls, features_included) VALUES
('DoganHub Basic', 'DH-BASIC-M', 'Basic tier with essential features', 29.99, 'basic', 'monthly', 5, 10, 1000, ARRAY['core_features', 'basic_reporting']),
('DoganHub Professional', 'DH-PRO-M', 'Professional tier with advanced features', 99.99, 'professional', 'monthly', 25, 100, 10000, ARRAY['core_features', 'advanced_reporting', 'api_access', 'integrations']),
('DoganHub Enterprise', 'DH-ENT-M', 'Enterprise tier with full features', 299.99, 'enterprise', 'monthly', NULL, 1000, 100000, ARRAY['core_features', 'advanced_reporting', 'api_access', 'integrations', 'ai_features', 'white_label']),
('DoganHub Basic Annual', 'DH-BASIC-A', 'Basic tier annual billing', 299.99, 'basic', 'annual', 5, 10, 1000, ARRAY['core_features', 'basic_reporting']),
('DoganHub Professional Annual', 'DH-PRO-A', 'Professional tier annual billing', 999.99, 'professional', 'annual', 25, 100, 10000, ARRAY['core_features', 'advanced_reporting', 'api_access', 'integrations']),
('DoganHub Enterprise Annual', 'DH-ENT-A', 'Enterprise tier annual billing', 2999.99, 'enterprise', 'annual', NULL, 1000, 100000, ARRAY['core_features', 'advanced_reporting', 'api_access', 'integrations', 'ai_features', 'white_label']);

-- Insert license features
INSERT INTO license_features (feature_code, feature_name, description, module_layer, category, is_countable, default_limit) VALUES
('core_features', 'Core Platform Features', 'Basic platform functionality', 1, 'core', FALSE, NULL),
('basic_reporting', 'Basic Reporting', 'Standard reports and dashboards', 7, 'analytics', FALSE, NULL),
('advanced_reporting', 'Advanced Reporting', 'Custom reports and advanced analytics', 7, 'analytics', FALSE, NULL),
('api_access', 'API Access', 'REST API access for integrations', 12, 'integrations', TRUE, 1000),
('integrations', 'Third-party Integrations', 'Connect with external services', 12, 'integrations', FALSE, NULL),
('ai_features', 'AI & Machine Learning', 'AI-powered insights and automation', 11, 'ai', TRUE, 100),
('white_label', 'White Label Options', 'Custom branding and theming', 1, 'core', FALSE, NULL),
('user_management', 'User Management', 'Advanced user and role management', 2, 'core', TRUE, 5),
('data_storage', 'Data Storage', 'Cloud storage for documents and files', 9, 'storage', TRUE, 10),
('workflow_automation', 'Workflow Automation', 'Automated business processes', 10, 'automation', TRUE, 10),
('mobile_app', 'Mobile Application', 'Native mobile app access', 1, 'core', FALSE, NULL),
('priority_support', 'Priority Support', '24/7 priority customer support', 1, 'support', FALSE, NULL);

-- Create feature mappings for licenses
-- Basic License Features
INSERT INTO license_feature_map (license_id, feature_id, limit_value, is_enabled)
SELECT l.id, lf.id, 
    CASE 
        WHEN lf.feature_code = 'user_management' THEN 5
        WHEN lf.feature_code = 'data_storage' THEN 10
        WHEN lf.feature_code = 'api_access' THEN 1000
        ELSE NULL
    END,
    TRUE
FROM licenses l
CROSS JOIN license_features lf
WHERE l.sku IN ('DH-BASIC-M', 'DH-BASIC-A')
AND lf.feature_code IN ('core_features', 'basic_reporting', 'user_management', 'data_storage');

-- Professional License Features
INSERT INTO license_feature_map (license_id, feature_id, limit_value, is_enabled)
SELECT l.id, lf.id,
    CASE 
        WHEN lf.feature_code = 'user_management' THEN 25
        WHEN lf.feature_code = 'data_storage' THEN 100
        WHEN lf.feature_code = 'api_access' THEN 10000
        WHEN lf.feature_code = 'workflow_automation' THEN 10
        ELSE NULL
    END,
    TRUE
FROM licenses l
CROSS JOIN license_features lf
WHERE l.sku IN ('DH-PRO-M', 'DH-PRO-A')
AND lf.feature_code IN ('core_features', 'basic_reporting', 'advanced_reporting', 'api_access', 'integrations', 'user_management', 'data_storage', 'workflow_automation', 'mobile_app');

-- Enterprise License Features
INSERT INTO license_feature_map (license_id, feature_id, limit_value, is_enabled)
SELECT l.id, lf.id,
    CASE 
        WHEN lf.feature_code = 'user_management' THEN NULL -- Unlimited
        WHEN lf.feature_code = 'data_storage' THEN 1000
        WHEN lf.feature_code = 'api_access' THEN 100000
        WHEN lf.feature_code = 'workflow_automation' THEN NULL -- Unlimited
        WHEN lf.feature_code = 'ai_features' THEN 1000
        ELSE NULL
    END,
    TRUE
FROM licenses l
CROSS JOIN license_features lf
WHERE l.sku IN ('DH-ENT-M', 'DH-ENT-A');

-- Insert default dunning schedules
INSERT INTO dunning_schedules (days_relative_to_end, action_type, template_id, escalation_level, is_active) VALUES
(-90, 'email', 'renewal_notice_90_days', 1, TRUE),
(-60, 'email', 'renewal_notice_60_days', 2, TRUE),
(-30, 'email', 'renewal_notice_30_days', 3, TRUE),
(-14, 'email', 'renewal_urgent_14_days', 4, TRUE),
(-7, 'email', 'renewal_final_notice_7_days', 5, TRUE),
(-1, 'email', 'renewal_last_chance', 6, TRUE),
(0, 'escalate_case', 'renewal_expired_escalation', 7, TRUE);

-- Insert sample tenant licenses for testing (using placeholder tenant IDs)
INSERT INTO tenant_licenses (
    tenant_id, 
    license_id, 
    license_key, 
    start_date, 
    end_date, 
    status, 
    auto_renew, 
    billing_cycle, 
    monthly_cost, 
    annual_cost,
    current_users,
    current_storage_gb,
    current_api_calls,
    is_trial
)
SELECT 
    gen_random_uuid() as tenant_id,
    l.id as license_id,
    'LIC-' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 16)) as license_key,
    NOW() - INTERVAL '6 months' as start_date,
    CASE 
        WHEN l.billing_cycle = 'monthly' THEN NOW() + INTERVAL '1 month' * (1 + FLOOR(RANDOM() * 3))
        ELSE NOW() + INTERVAL '1 year' * (1 + FLOOR(RANDOM() * 1))
    END as end_date,
    'active' as status,
    RANDOM() > 0.3 as auto_renew, -- 70% auto-renew
    l.billing_cycle,
    CASE WHEN l.billing_cycle = 'monthly' THEN l.price ELSE NULL END,
    CASE WHEN l.billing_cycle = 'annual' THEN l.price ELSE l.price * 10 END, -- Annual discount
    FLOOR(RANDOM() * COALESCE(l.max_users, 50)) + 1,
    RANDOM() * COALESCE(l.max_storage_gb, 100),
    FLOOR(RANDOM() * COALESCE(l.max_api_calls, 1000)),
    FALSE
FROM licenses l
WHERE l.sku IN ('DH-PRO-M', 'DH-ENT-A', 'DH-BASIC-M')
LIMIT 15;

-- Insert renewal records for licenses ending in the next 120 days
INSERT INTO license_renewals (
    tenant_license_id, 
    renewal_date, 
    status, 
    probability, 
    weighted_value, 
    risk_level,
    notes
)
SELECT 
    tl.id,
    tl.end_date,
    CASE 
        WHEN RANDOM() > 0.7 THEN 'completed'
        WHEN RANDOM() > 0.5 THEN 'in_progress'
        ELSE 'pending'
    END,
    30 + FLOOR(RANDOM() * 70), -- Probability between 30-100%
    tl.annual_cost * (30 + FLOOR(RANDOM() * 70)) / 100, -- Weighted value
    CASE 
        WHEN RANDOM() > 0.7 THEN 'low'
        WHEN RANDOM() > 0.4 THEN 'medium'
        ELSE 'high'
    END,
    'Sample renewal record for testing'
FROM tenant_licenses tl
WHERE tl.end_date BETWEEN NOW() AND NOW() + INTERVAL '120 days';

-- Insert sample communication records
INSERT INTO renewal_communications (
    renewal_id, 
    communication_type, 
    contact_person, 
    subject, 
    notes, 
    next_follow_up,
    created_at
)
SELECT 
    lr.id,
    CASE FLOOR(RANDOM() * 4)
        WHEN 0 THEN 'email'
        WHEN 1 THEN 'call'
        WHEN 2 THEN 'meeting'
        ELSE 'proposal_sent'
    END,
    'John Smith',
    'Renewal Discussion',
    'Follow-up on license renewal. Customer interested in upgrading to enterprise tier.',
    NOW() + INTERVAL '1 week',
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
FROM license_renewals lr
WHERE RANDOM() > 0.5; -- 50% of renewals have communication records

-- Insert sample usage aggregations
INSERT INTO usage_aggregations (
    tenant_license_id,
    aggregation_period,
    period_start,
    period_end,
    total_users,
    total_storage_gb,
    total_api_calls,
    feature_usage
)
SELECT 
    tl.id,
    'monthly',
    DATE_TRUNC('month', NOW() - INTERVAL '1 month'),
    DATE_TRUNC('month', NOW()) - INTERVAL '1 day',
    GREATEST(1, FLOOR(tl.current_users * (0.8 + RANDOM() * 0.4))),
    tl.current_storage_gb * (0.8 + RANDOM() * 0.4),
    GREATEST(1, FLOOR(tl.current_api_calls * (0.8 + RANDOM() * 0.4))),
    jsonb_build_object(
        'core_features', FLOOR(RANDOM() * 1000),
        'api_access', FLOOR(RANDOM() * 5000),
        'reporting', FLOOR(RANDOM() * 100)
    )
FROM tenant_licenses tl;

-- Insert notification preferences
INSERT INTO license_notifications (tenant_id, notification_type, delivery_method, template_name, trigger_conditions)
SELECT DISTINCT 
    tl.tenant_id,
    'renewal_reminder',
    'email',
    'renewal_reminder_template',
    jsonb_build_object('days_before_expiry', 30)
FROM tenant_licenses tl
WHERE tl.is_active = TRUE;

INSERT INTO license_notifications (tenant_id, notification_type, delivery_method, template_name, trigger_conditions)
SELECT DISTINCT 
    tl.tenant_id,
    'usage_warning',
    'email',
    'usage_warning_template',
    jsonb_build_object('usage_threshold', 80)
FROM tenant_licenses tl
WHERE tl.is_active = TRUE;

-- Insert some license events for audit trail
INSERT INTO license_events (tenant_id, tenant_license_id, license_id, event_type, event_details, user_id)
SELECT 
    tl.tenant_id,
    tl.id,
    tl.license_id,
    'activated',
    jsonb_build_object(
        'license_key', tl.license_key,
        'start_date', tl.start_date,
        'end_date', tl.end_date
    ),
    gen_random_uuid()
FROM tenant_licenses tl
WHERE tl.is_active = TRUE;

-- Success message
SELECT 'License management database setup completed successfully!' as status;