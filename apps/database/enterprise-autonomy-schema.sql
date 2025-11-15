-- ================================================================
-- ENTERPRISE AUTONOMY ENGINE - DATABASE SCHEMA
-- Advanced License Management with AI-Powered Analytics
-- ================================================================

-- Enhanced License Usage Logs with Detailed Tracking
CREATE TABLE IF NOT EXISTS license_usage_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    user_id INTEGER,
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_usage_tenant_date (tenant_id, created_at),
    INDEX idx_usage_endpoint (endpoint),
    INDEX idx_usage_user (user_id),
    INDEX idx_usage_date (created_at)
);

-- License Tier Features Mapping
CREATE TABLE IF NOT EXISTS license_tier_features (
    id SERIAL PRIMARY KEY,
    tier_code VARCHAR(50) NOT NULL,
    feature_code VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tier_code, feature_code)
);

-- Insert default tier features
INSERT INTO license_tier_features (tier_code, feature_code) VALUES
-- FREE tier
('free', 'dashboard.basic'),
('free', 'reports.basic'),

-- STARTER tier
('starter', 'dashboard.basic'),
('starter', 'dashboard.business'),
('starter', 'reports.basic'),
('starter', 'reports.advanced'),
('starter', 'crm.basic'),
('starter', 'finance.basic'),

-- PROFESSIONAL tier
('professional', 'dashboard.basic'),
('professional', 'dashboard.business'),
('professional', 'dashboard.executive'),
('professional', 'reports.basic'),
('professional', 'reports.advanced'),
('professional', 'reports.custom'),
('professional', 'crm.basic'),
('professional', 'crm.advanced'),
('professional', 'crm.automation'),
('professional', 'finance.basic'),
('professional', 'finance.advanced'),
('professional', 'analytics.basic'),
('professional', 'analytics.advanced'),
('professional', 'workflows.basic'),
('professional', 'grc.basic'),
('professional', 'hr.basic'),
('professional', 'hr.payroll'),

-- ENTERPRISE tier (all features)
('enterprise', '*')
ON CONFLICT (tier_code, feature_code) DO NOTHING;

-- License Usage Analytics (Aggregated)
CREATE TABLE IF NOT EXISTS license_usage_analytics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    hour INTEGER, -- NULL for daily aggregates
    
    -- Usage metrics
    api_calls_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    unique_endpoints INTEGER DEFAULT 0,
    total_response_time_ms BIGINT DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Top endpoints
    top_endpoint VARCHAR(500),
    top_endpoint_calls INTEGER DEFAULT 0,
    
    -- Resource usage
    data_transferred_mb DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, date, hour),
    INDEX idx_analytics_tenant_date (tenant_id, date)
);

-- License Alerts and Notifications
CREATE TABLE IF NOT EXISTS license_alerts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'LIMIT_WARNING', 'LIMIT_EXCEEDED', 'UPGRADE_RECOMMENDED'
    severity VARCHAR(20) NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Alert data
    current_value DECIMAL(10,2),
    limit_value DECIMAL(10,2),
    percent_used DECIMAL(5,2),
    recommended_tier VARCHAR(50),
    
    is_read BOOLEAN DEFAULT false,
    is_actioned BOOLEAN DEFAULT false,
    actioned_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_alerts_tenant (tenant_id),
    INDEX idx_alerts_unread (tenant_id, is_read)
);

-- License Upgrade Recommendations (AI-Generated)
CREATE TABLE IF NOT EXISTS license_upgrade_recommendations (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    current_tier VARCHAR(50) NOT NULL,
    recommended_tier VARCHAR(50) NOT NULL,
    
    -- Reasoning
    reason_code VARCHAR(50) NOT NULL, -- 'HIGH_USAGE', 'RAPID_GROWTH', 'FEATURE_REQUEST'
    reason_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Supporting data
    usage_data JSONB,
    growth_metrics JSONB,
    projected_needs JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed'
    expires_at TIMESTAMP, -- Recommendation expires after 30 days
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recommendations_tenant (tenant_id),
    INDEX idx_recommendations_status (tenant_id, status)
);

-- API Rate Limiting State (Redis backup)
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    window_start TIMESTAMP NOT NULL,
    request_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, endpoint, window_start),
    INDEX idx_rate_limits_tenant_endpoint (tenant_id, endpoint)
);

-- Function to aggregate usage data (called by cron)
CREATE OR REPLACE FUNCTION aggregate_license_usage()
RETURNS void AS $$
BEGIN
    -- Aggregate hourly data
    INSERT INTO license_usage_analytics (
        tenant_id, date, hour,
        api_calls_count, unique_users, unique_endpoints,
        total_response_time_ms, avg_response_time_ms,
        error_count, error_rate,
        top_endpoint, top_endpoint_calls,
        data_transferred_mb
    )
    SELECT 
        tenant_id,
        DATE(created_at) as date,
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as api_calls_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT endpoint) as unique_endpoints,
        SUM(response_time_ms) as total_response_time_ms,
        AVG(response_time_ms)::INTEGER as avg_response_time_ms,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
        (SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100) as error_rate,
        MODE() WITHIN GROUP (ORDER BY endpoint) as top_endpoint,
        MAX(endpoint_count) as top_endpoint_calls,
        SUM(COALESCE(response_size_bytes, 0) / 1048576.0) as data_transferred_mb
    FROM (
        SELECT 
            *,
            COUNT(*) OVER (PARTITION BY tenant_id, endpoint, DATE(created_at), EXTRACT(HOUR FROM created_at)) as endpoint_count
        FROM license_usage_logs
        WHERE created_at >= NOW() - INTERVAL '2 hours'
        AND created_at < NOW() - INTERVAL '1 hour'
    ) sub
    GROUP BY tenant_id, DATE(created_at), EXTRACT(HOUR FROM created_at)
    ON CONFLICT (tenant_id, date, hour) DO UPDATE SET
        api_calls_count = EXCLUDED.api_calls_count,
        unique_users = EXCLUDED.unique_users,
        unique_endpoints = EXCLUDED.unique_endpoints,
        total_response_time_ms = EXCLUDED.total_response_time_ms,
        avg_response_time_ms = EXCLUDED.avg_response_time_ms,
        error_count = EXCLUDED.error_count,
        error_rate = EXCLUDED.error_rate,
        top_endpoint = EXCLUDED.top_endpoint,
        top_endpoint_calls = EXCLUDED.top_endpoint_calls,
        data_transferred_mb = EXCLUDED.data_transferred_mb,
        updated_at = CURRENT_TIMESTAMP;
        
    -- Aggregate daily data
    INSERT INTO license_usage_analytics (
        tenant_id, date,
        api_calls_count, unique_users, unique_endpoints,
        total_response_time_ms, avg_response_time_ms,
        error_count, error_rate,
        data_transferred_mb
    )
    SELECT 
        tenant_id,
        date,
        SUM(api_calls_count),
        MAX(unique_users), -- Max of hourly unique counts
        MAX(unique_endpoints),
        SUM(total_response_time_ms),
        AVG(avg_response_time_ms)::INTEGER,
        SUM(error_count),
        AVG(error_rate),
        SUM(data_transferred_mb)
    FROM license_usage_analytics
    WHERE date = CURRENT_DATE - INTERVAL '1 day'
    AND hour IS NOT NULL
    GROUP BY tenant_id, date
    ON CONFLICT (tenant_id, date, hour) DO UPDATE SET
        api_calls_count = EXCLUDED.api_calls_count,
        unique_users = EXCLUDED.unique_users,
        unique_endpoints = EXCLUDED.unique_endpoints,
        total_response_time_ms = EXCLUDED.total_response_time_ms,
        avg_response_time_ms = EXCLUDED.avg_response_time_ms,
        error_count = EXCLUDED.error_count,
        error_rate = EXCLUDED.error_rate,
        data_transferred_mb = EXCLUDED.data_transferred_mb,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to check and create usage alerts
CREATE OR REPLACE FUNCTION check_usage_alerts()
RETURNS void AS $$
DECLARE
    rec RECORD;
    tier_config RECORD;
BEGIN
    FOR rec IN 
        SELECT 
            l.tenant_id,
            l.license_code,
            COUNT(*) as daily_calls
        FROM licenses l
        JOIN license_usage_logs u ON l.tenant_id = u.tenant_id
        WHERE DATE(u.created_at) = CURRENT_DATE
        AND l.status = 'active'
        GROUP BY l.tenant_id, l.license_code
    LOOP
        -- Get tier configuration (hardcoded for now, could be from config table)
        -- Check if approaching limit (>80%)
        -- Create alert if needed
        
        -- Example: Free tier has 1000 calls/day limit
        IF rec.license_code = 'free' AND rec.daily_calls > 800 THEN
            INSERT INTO license_alerts (
                tenant_id, alert_type, severity, title, message,
                current_value, limit_value, percent_used, recommended_tier
            )
            VALUES (
                rec.tenant_id,
                'LIMIT_WARNING',
                'WARNING',
                'Approaching Daily API Limit',
                'You have used more than 80% of your daily API call limit. Consider upgrading to avoid service interruption.',
                rec.daily_calls,
                1000,
                (rec.daily_calls::DECIMAL / 1000 * 100),
                'starter'
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_created 
    ON license_usage_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_logs_endpoint_created 
    ON license_usage_logs(endpoint, created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT ON license_usage_logs TO app_user;
GRANT SELECT ON license_tier_features TO app_user;
GRANT SELECT, INSERT, UPDATE ON license_usage_analytics TO app_user;
GRANT SELECT, INSERT, UPDATE ON license_alerts TO app_user;
GRANT SELECT, INSERT, UPDATE ON license_upgrade_recommendations TO app_user;

COMMENT ON TABLE license_usage_logs IS 'Detailed API usage logs for license enforcement and analytics';
COMMENT ON TABLE license_tier_features IS 'Mapping of features available in each license tier';
COMMENT ON TABLE license_usage_analytics IS 'Aggregated usage metrics for performance and reporting';
COMMENT ON TABLE license_alerts IS 'Automated alerts for license usage and recommendations';
COMMENT ON TABLE license_upgrade_recommendations IS 'AI-generated upgrade recommendations based on usage patterns';
