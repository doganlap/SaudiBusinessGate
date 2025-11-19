-- =====================================================
-- CREATE GRC TABLES (Controls, Tests, Frameworks, Exceptions, Alerts)
-- =====================================================

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Frameworks Table
CREATE TABLE IF NOT EXISTS grc_frameworks (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    framework_name VARCHAR(255) NOT NULL,
    framework_name_ar VARCHAR(255),
    framework_type VARCHAR(100), -- ISO27001, NIST, COSO, SOX, etc.
    description TEXT,
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Framework Sections Table
CREATE TABLE IF NOT EXISTS grc_framework_sections (
    id SERIAL PRIMARY KEY,
    framework_id INTEGER REFERENCES grc_frameworks(id) ON DELETE CASCADE,
    section_code VARCHAR(50),
    section_name VARCHAR(255),
    section_name_ar VARCHAR(255),
    description TEXT,
    parent_section_id INTEGER REFERENCES grc_framework_sections(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Controls Table
CREATE TABLE IF NOT EXISTS grc_controls (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    control_code VARCHAR(100) UNIQUE NOT NULL,
    control_name VARCHAR(255) NOT NULL,
    control_name_ar VARCHAR(255),
    framework_id INTEGER REFERENCES grc_frameworks(id) ON DELETE SET NULL,
    section_id INTEGER REFERENCES grc_framework_sections(id) ON DELETE SET NULL,
    control_type VARCHAR(50), -- preventive, detective, corrective
    control_category VARCHAR(100), -- access, process, technical, physical
    description TEXT,
    objective TEXT,
    frequency VARCHAR(50), -- daily, weekly, monthly, quarterly, annually
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, retired
    effectiveness_rating INTEGER, -- 1-5
    last_reviewed_date DATE,
    next_review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Control Tests Table
CREATE TABLE IF NOT EXISTS grc_control_tests (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    control_id INTEGER REFERENCES grc_controls(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_description TEXT,
    test_type VARCHAR(50), -- walkthrough, inquiry, observation, inspection, reperformance
    test_date DATE NOT NULL,
    tester VARCHAR(255),
    test_result VARCHAR(50), -- passed, failed, exception, not_applicable
    findings TEXT,
    recommendations TEXT,
    evidence_url TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exceptions Table
CREATE TABLE IF NOT EXISTS grc_exceptions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    exception_number VARCHAR(100) UNIQUE NOT NULL,
    control_id INTEGER REFERENCES grc_controls(id) ON DELETE SET NULL,
    test_id INTEGER REFERENCES grc_control_tests(id) ON DELETE SET NULL,
    exception_type VARCHAR(50), -- control_failure, policy_violation, process_breakdown
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    identified_date DATE NOT NULL,
    identified_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open', -- open, in_review, resolved, closed, accepted
    root_cause TEXT,
    remediation_plan TEXT,
    remediation_due_date DATE,
    remediation_completed_date DATE,
    residual_risk VARCHAR(50),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS grc_alerts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- control_failure, test_overdue, exception_created, review_due
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- control, test, exception, framework
    related_entity_id INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- active, acknowledged, resolved, dismissed
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk Assessments Table
CREATE TABLE IF NOT EXISTS grc_risk_assessments (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    assessment_date DATE NOT NULL,
    assessed_by VARCHAR(255),
    risk_category VARCHAR(100),
    risk_description TEXT,
    likelihood VARCHAR(50), -- rare, unlikely, possible, likely, almost_certain
    impact VARCHAR(50), -- negligible, minor, moderate, major, catastrophic
    risk_level VARCHAR(50), -- low, medium, high, critical
    existing_controls TEXT,
    risk_owner VARCHAR(255),
    mitigation_strategy TEXT,
    residual_risk_level VARCHAR(50),
    review_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, completed, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grc_frameworks_tenant_id ON grc_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_framework_sections_framework_id ON grc_framework_sections(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_tenant_id ON grc_controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_framework_id ON grc_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_grc_controls_status ON grc_controls(status);
CREATE INDEX IF NOT EXISTS idx_grc_control_tests_tenant_id ON grc_control_tests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_control_tests_control_id ON grc_control_tests(control_id);
CREATE INDEX IF NOT EXISTS idx_grc_control_tests_status ON grc_control_tests(status);
CREATE INDEX IF NOT EXISTS idx_grc_exceptions_tenant_id ON grc_exceptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_exceptions_control_id ON grc_exceptions(control_id);
CREATE INDEX IF NOT EXISTS idx_grc_exceptions_status ON grc_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_grc_exceptions_severity ON grc_exceptions(severity);
CREATE INDEX IF NOT EXISTS idx_grc_alerts_tenant_id ON grc_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_alerts_status ON grc_alerts(status);
CREATE INDEX IF NOT EXISTS idx_grc_alerts_severity ON grc_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_grc_risk_assessments_tenant_id ON grc_risk_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grc_risk_assessments_status ON grc_risk_assessments(status);

-- Create updated_at triggers
CREATE TRIGGER update_grc_frameworks_updated_at BEFORE UPDATE ON grc_frameworks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grc_controls_updated_at BEFORE UPDATE ON grc_controls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grc_control_tests_updated_at BEFORE UPDATE ON grc_control_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grc_exceptions_updated_at BEFORE UPDATE ON grc_exceptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grc_alerts_updated_at BEFORE UPDATE ON grc_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grc_risk_assessments_updated_at BEFORE UPDATE ON grc_risk_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

