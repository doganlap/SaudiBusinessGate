-- =====================================================
-- GRC Control Administration Database Schema
-- Shahin-AI DoganHubStore - Control Management System
-- Multi-tenant, Bilingual (AR/EN), RBAC-enabled
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FRAMEWORKS & REGULATORY MAPPING
-- =====================================================

-- Regulatory frameworks (NCA, SAMA, PDPL, ISO, SOX, etc.)
CREATE TABLE IF NOT EXISTS frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL, -- NCA, SAMA, PDPL, ISO27001, SOX
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description_en TEXT,
    description_ar TEXT,
    version VARCHAR(50),
    effective_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, deprecated, draft
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- Framework sections/requirements
CREATE TABLE IF NOT EXISTS framework_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    section_code VARCHAR(100) NOT NULL, -- AC-1, AC-2, etc.
    title_en VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description_en TEXT,
    description_ar TEXT,
    parent_section_id UUID REFERENCES framework_sections(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, framework_id, section_code)
);

-- =====================================================
-- 2. CORE CONTROLS
-- =====================================================

-- Main controls table
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    code VARCHAR(100) NOT NULL, -- CTRL-NCA-AC-001
    title_en VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    objective_en TEXT NOT NULL,
    objective_ar TEXT,
    domain VARCHAR(100) NOT NULL, -- ITGC, Application, Cyber, Privacy, Financial
    process_area VARCHAR(100), -- Access Control, Change Management, etc.
    control_type VARCHAR(50) NOT NULL, -- Preventive, Detective, Corrective
    control_nature VARCHAR(50) NOT NULL, -- Manual, Automated, Semi-automated
    frequency VARCHAR(50) NOT NULL, -- Daily, Weekly, Monthly, Quarterly, Annual, On-event
    criticality VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Critical, High, Medium, Low
    maturity_level INTEGER DEFAULT 1, -- 1-5 maturity scale
    status VARCHAR(50) DEFAULT 'draft', -- draft, design_review, ready, operating, changed, retired
    owner_id UUID, -- Control Owner
    backup_owner_id UUID, -- Backup Owner
    process_owner_id UUID, -- Process Owner
    assertions JSONB, -- SOX, Privacy, NCA assertions
    evidence_requirements JSONB, -- What evidence is needed
    test_strategy JSONB, -- Design vs Operating effectiveness
    risk_links JSONB, -- Connected risk IDs
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    UNIQUE(tenant_id, code)
);

-- Framework to control mapping
CREATE TABLE IF NOT EXISTS framework_control_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES framework_sections(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) DEFAULT 'primary', -- primary, secondary, supporting
    compliance_status VARCHAR(50) DEFAULT 'pending', -- compliant, non_compliant, pending, not_applicable
    mapped_by UUID,
    mapped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes_en TEXT,
    notes_ar TEXT,
    UNIQUE(tenant_id, framework_id, section_id, control_id)
);

-- =====================================================
-- 3. CONTROL IMPLEMENTATIONS
-- =====================================================

-- Control implementation instances
CREATE TABLE IF NOT EXISTS control_implementations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    implementation_name_en VARCHAR(255) NOT NULL,
    implementation_name_ar VARCHAR(255),
    owner_id UUID NOT NULL, -- Implementation Owner
    status VARCHAR(50) DEFAULT 'planned', -- planned, ready, active, suspended, retired
    implementation_date DATE,
    next_review_date DATE,
    sop_links JSONB, -- Standard Operating Procedure links
    system_configs JSONB, -- System configuration details
    automation_details JSONB, -- CCM connector details
    delegation_rules JSONB, -- Who can act on behalf
    notes_en TEXT,
    notes_ar TEXT,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. EVIDENCE MANAGEMENT
-- =====================================================

-- Document repository
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    doc_type VARCHAR(100) NOT NULL, -- evidence, procedure, policy, report
    file_path VARCHAR(1000),
    file_size BIGINT,
    file_hash VARCHAR(255), -- SHA-256 hash for integrity
    mime_type VARCHAR(100),
    retention_label VARCHAR(100), -- 1Y, 3Y, 7Y, Permanent
    retention_expires_at TIMESTAMP,
    classification VARCHAR(50) DEFAULT 'internal', -- public, internal, confidential, restricted
    language VARCHAR(10) DEFAULT 'en', -- en, ar, both
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Control evidence linking
CREATE TABLE IF NOT EXISTS control_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    implementation_id UUID REFERENCES control_implementations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL, -- screenshot, export, log, attestation, report
    evidence_period_start DATE,
    evidence_period_end DATE,
    linked_by UUID,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validation_checklist JSONB, -- Authenticity, Completeness, Relevance, Readability
    validation_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    validated_by UUID,
    validated_at TIMESTAMP,
    notes_en TEXT,
    notes_ar TEXT
);

-- =====================================================
-- 5. TESTING & ASSESSMENT
-- =====================================================

-- Control testing plans and results
CREATE TABLE IF NOT EXISTS control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    implementation_id UUID REFERENCES control_implementations(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL, -- design_effectiveness, operating_effectiveness
    test_name_en VARCHAR(255) NOT NULL,
    test_name_ar VARCHAR(255),
    planned_date DATE,
    executed_at TIMESTAMP,
    executed_by UUID, -- Tester
    reviewed_by UUID, -- Reviewer (SoD)
    test_objective_en TEXT,
    test_objective_ar TEXT,
    test_procedure_en TEXT,
    test_procedure_ar TEXT,
    population_description_en TEXT,
    population_description_ar TEXT,
    sample_plan JSONB, -- Sample selection methodology and size
    sample_results JSONB, -- Detailed sample testing results
    overall_result VARCHAR(50), -- pass, partial, fail
    findings JSONB, -- Array of findings with severity
    recommendations_en TEXT,
    recommendations_ar TEXT,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, closed
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. EXCEPTIONS & ISSUES
-- =====================================================

-- Control exceptions and compensating controls
CREATE TABLE IF NOT EXISTS control_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    exception_type VARCHAR(50) NOT NULL, -- temporary, permanent, compensating
    reason_en TEXT NOT NULL,
    reason_ar TEXT,
    business_justification_en TEXT,
    business_justification_ar TEXT,
    risk_assessment JSONB, -- Risk impact and likelihood
    compensating_controls JSONB, -- Alternative controls
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'proposed', -- proposed, approved, active, expired, closed
    requested_by UUID,
    approved_by UUID, -- Risk Manager or Compliance Officer
    approved_at TIMESTAMP,
    review_frequency VARCHAR(50), -- Monthly, Quarterly, Semi-annual
    next_review_date DATE,
    closure_reason_en TEXT,
    closure_reason_ar TEXT,
    closed_by UUID,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. CHANGE MANAGEMENT
-- =====================================================

-- Control change requests
CREATE TABLE IF NOT EXISTS control_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- minor, major, emergency
    change_description_en TEXT NOT NULL,
    change_description_ar TEXT,
    change_justification_en TEXT,
    change_justification_ar TEXT,
    impact_analysis JSONB, -- Impact on frameworks, assessments, reports
    proposed_changes JSONB, -- Field-level changes
    current_version INTEGER,
    target_version INTEGER,
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected, implemented
    requested_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    implemented_by UUID,
    implemented_at TIMESTAMP,
    rollback_plan JSONB,
    approval_chain JSONB, -- Multi-level approval workflow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. CONTINUOUS CONTROL MONITORING (CCM)
-- =====================================================

-- CCM connectors and data sources
CREATE TABLE IF NOT EXISTS ccm_connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    connector_type VARCHAR(100) NOT NULL, -- SIEM, IAM, Config_Mgmt, Ticketing, Database
    connection_details JSONB, -- API endpoints, credentials, etc.
    status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, error, maintenance
    last_sync_at TIMESTAMP,
    sync_frequency VARCHAR(50) DEFAULT 'hourly', -- real_time, hourly, daily
    health_status VARCHAR(50) DEFAULT 'unknown', -- healthy, warning, critical, disconnected
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CCM rules and thresholds
CREATE TABLE IF NOT EXISTS ccm_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES ccm_connectors(id) ON DELETE CASCADE,
    rule_name_en VARCHAR(255) NOT NULL,
    rule_name_ar VARCHAR(255),
    rule_logic JSONB NOT NULL, -- Query/filter logic
    thresholds JSONB, -- Warning and critical thresholds
    alert_frequency VARCHAR(50) DEFAULT 'immediate', -- immediate, daily, weekly
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, testing
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CCM alerts and signals
CREATE TABLE IF NOT EXISTS ccm_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    rule_id UUID NOT NULL REFERENCES ccm_rules(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- info, warning, critical
    alert_message_en TEXT NOT NULL,
    alert_message_ar TEXT,
    alert_data JSONB, -- Raw data that triggered alert
    anomaly_score DECIMAL(5,2), -- 0.00 to 100.00
    status VARCHAR(50) DEFAULT 'open', -- open, acknowledged, resolved, false_positive
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    resolution_notes_en TEXT,
    resolution_notes_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. AUDIT TRAIL & HISTORY
-- =====================================================

-- Comprehensive audit trail for all control activities
CREATE TABLE IF NOT EXISTS control_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- control, implementation, test, exception, etc.
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, approve, reject, etc.
    actor_id UUID, -- Who performed the action
    actor_role VARCHAR(100),
    old_values JSONB, -- Previous state
    new_values JSONB, -- New state
    change_summary_en TEXT,
    change_summary_ar TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. VIEWS FOR REPORTING & ANALYTICS
-- =====================================================

-- Control status summary view
CREATE OR REPLACE VIEW v_control_status AS
SELECT 
    c.id,
    c.tenant_id,
    c.code,
    c.title_en,
    c.title_ar,
    c.domain,
    c.criticality,
    c.status,
    c.owner_id,
    ci.status as implementation_status,
    ci.next_review_date,
    COALESCE(latest_test.overall_result, 'not_tested') as latest_test_result,
    latest_test.executed_at as latest_test_date,
    COUNT(ce.id) as evidence_count,
    COUNT(CASE WHEN ce.validation_status = 'approved' THEN 1 END) as approved_evidence_count,
    COUNT(active_exceptions.id) as active_exceptions_count,
    -- Control Effectiveness Score (CES) calculation
    CASE 
        WHEN c.status = 'operating' AND ci.status = 'active' THEN
            CASE 
                WHEN latest_test.overall_result = 'pass' THEN 
                    GREATEST(0, 100 * (
                        0.5 * 1.0 + -- Test factor
                        0.3 * GREATEST(0, 1 - EXTRACT(days FROM (CURRENT_DATE - ci.next_review_date::date)) / 90.0) + -- Evidence recency
                        0.2 * CASE WHEN ccm_health.health_status = 'healthy' THEN 1.0 
                                  WHEN ccm_health.health_status = 'warning' THEN 0.8
                                  WHEN ccm_health.health_status = 'critical' THEN 0.4
                                  ELSE 0.6 END -- CCM factor
                    ))
                WHEN latest_test.overall_result = 'partial' THEN 60
                WHEN latest_test.overall_result = 'fail' THEN 0
                ELSE 40 -- Not tested
            END
        WHEN c.status = 'ready' THEN 20
        ELSE 0
    END as control_effectiveness_score
FROM controls c
LEFT JOIN control_implementations ci ON c.id = ci.control_id AND ci.status = 'active'
LEFT JOIN LATERAL (
    SELECT ct.overall_result, ct.executed_at
    FROM control_tests ct 
    WHERE ct.control_id = c.id AND ct.status = 'completed'
    ORDER BY ct.executed_at DESC 
    LIMIT 1
) latest_test ON true
LEFT JOIN control_evidence ce ON c.id = ce.control_id
LEFT JOIN control_exceptions active_exceptions ON c.id = active_exceptions.control_id 
    AND active_exceptions.status = 'active' 
    AND (active_exceptions.end_date IS NULL OR active_exceptions.end_date > CURRENT_DATE)
LEFT JOIN LATERAL (
    SELECT ccr.control_id, ccmc.health_status
    FROM ccm_rules ccr
    JOIN ccm_connectors ccmc ON ccr.connector_id = ccmc.id
    WHERE ccr.control_id = c.id AND ccr.status = 'active'
    ORDER BY ccmc.last_sync_at DESC
    LIMIT 1
) ccm_health ON true
GROUP BY c.id, c.tenant_id, c.code, c.title_en, c.title_ar, c.domain, c.criticality, 
         c.status, c.owner_id, ci.status, ci.next_review_date, latest_test.overall_result, 
         latest_test.executed_at, ccm_health.health_status;

-- Framework compliance summary
CREATE OR REPLACE VIEW v_framework_compliance AS
SELECT 
    f.id as framework_id,
    f.tenant_id,
    f.code as framework_code,
    f.name_en as framework_name,
    COUNT(fcm.control_id) as total_controls,
    COUNT(CASE WHEN vcs.control_effectiveness_score >= 80 THEN 1 END) as effective_controls,
    COUNT(CASE WHEN vcs.control_effectiveness_score < 80 AND vcs.control_effectiveness_score > 0 THEN 1 END) as partially_effective_controls,
    COUNT(CASE WHEN vcs.control_effectiveness_score = 0 THEN 1 END) as ineffective_controls,
    ROUND(
        COUNT(CASE WHEN vcs.control_effectiveness_score >= 80 THEN 1 END) * 100.0 / 
        NULLIF(COUNT(fcm.control_id), 0), 2
    ) as compliance_percentage
FROM frameworks f
JOIN framework_control_map fcm ON f.id = fcm.framework_id
JOIN v_control_status vcs ON fcm.control_id = vcs.id
WHERE f.status = 'active'
GROUP BY f.id, f.tenant_id, f.code, f.name_en;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_controls_tenant_status ON controls(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_controls_tenant_domain ON controls(tenant_id, domain);
CREATE INDEX IF NOT EXISTS idx_controls_tenant_criticality ON controls(tenant_id, criticality);
CREATE INDEX IF NOT EXISTS idx_controls_owner ON controls(owner_id);
CREATE INDEX IF NOT EXISTS idx_controls_code ON controls(tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_framework_control_map_tenant ON framework_control_map(tenant_id);
CREATE INDEX IF NOT EXISTS idx_framework_control_map_framework ON framework_control_map(framework_id);
CREATE INDEX IF NOT EXISTS idx_framework_control_map_control ON framework_control_map(control_id);

CREATE INDEX IF NOT EXISTS idx_control_implementations_tenant ON control_implementations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_implementations_control ON control_implementations(control_id);
CREATE INDEX IF NOT EXISTS idx_control_implementations_owner ON control_implementations(owner_id);
CREATE INDEX IF NOT EXISTS idx_control_implementations_status ON control_implementations(status);

CREATE INDEX IF NOT EXISTS idx_control_evidence_tenant ON control_evidence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_evidence_control ON control_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_control_evidence_validation ON control_evidence(validation_status);

CREATE INDEX IF NOT EXISTS idx_control_tests_tenant ON control_tests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_tests_control ON control_tests(control_id);
CREATE INDEX IF NOT EXISTS idx_control_tests_executed ON control_tests(executed_at);
CREATE INDEX IF NOT EXISTS idx_control_tests_status ON control_tests(status);

CREATE INDEX IF NOT EXISTS idx_control_exceptions_tenant ON control_exceptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_exceptions_control ON control_exceptions(control_id);
CREATE INDEX IF NOT EXISTS idx_control_exceptions_status ON control_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_control_exceptions_dates ON control_exceptions(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ccm_alerts_tenant ON ccm_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ccm_alerts_control ON ccm_alerts(control_id);
CREATE INDEX IF NOT EXISTS idx_ccm_alerts_status ON ccm_alerts(status);
CREATE INDEX IF NOT EXISTS idx_ccm_alerts_created ON ccm_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_trail_tenant ON control_audit_trail(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON control_audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor ON control_audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON control_audit_trail(created_at);

-- =====================================================
-- TRIGGERS FOR AUDIT TRAIL
-- =====================================================

-- Function to create audit trail entries
CREATE OR REPLACE FUNCTION create_control_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO control_audit_trail (
        tenant_id,
        entity_type,
        entity_id,
        action,
        actor_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
        CURRENT_TIMESTAMP
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit trail
CREATE TRIGGER controls_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON controls
    FOR EACH ROW EXECUTE FUNCTION create_control_audit_entry();

CREATE TRIGGER control_implementations_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON control_implementations
    FOR EACH ROW EXECUTE FUNCTION create_control_audit_entry();

CREATE TRIGGER control_tests_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON control_tests
    FOR EACH ROW EXECUTE FUNCTION create_control_audit_entry();

CREATE TRIGGER control_exceptions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON control_exceptions
    FOR EACH ROW EXECUTE FUNCTION create_control_audit_entry();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample framework (NCA - National Cybersecurity Authority)
INSERT INTO frameworks (tenant_id, code, name_en, name_ar, description_en, version, status) 
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'NCA',
    'National Cybersecurity Authority Framework',
    'إطار الهيئة الوطنية للأمن السيبراني',
    'Saudi Arabia National Cybersecurity Authority regulatory framework',
    '2.0',
    'active'
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insert sample framework sections
INSERT INTO framework_sections (tenant_id, framework_id, section_code, title_en, title_ar) 
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    f.id,
    'AC-1',
    'Access Control Policy and Procedures',
    'سياسة وإجراءات التحكم في الوصول'
FROM frameworks f 
WHERE f.code = 'NCA' AND f.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
ON CONFLICT (tenant_id, framework_id, section_code) DO NOTHING;

-- Insert sample control
INSERT INTO controls (
    tenant_id, code, title_en, title_ar, objective_en, objective_ar,
    domain, control_type, control_nature, frequency, criticality, status
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'CTRL-NCA-AC-001',
    'User Access Review',
    'مراجعة وصول المستخدمين',
    'Ensure user access rights are reviewed and validated periodically',
    'ضمان مراجعة والتحقق من صحة حقوق وصول المستخدمين بشكل دوري',
    'ITGC',
    'Detective',
    'Manual',
    'Quarterly',
    'High',
    'draft'
) ON CONFLICT (tenant_id, code) DO NOTHING;

COMMENT ON TABLE controls IS 'Core controls registry with bilingual support and multi-tenant isolation';
COMMENT ON TABLE framework_control_map IS 'Mapping between regulatory frameworks and controls';
COMMENT ON TABLE control_implementations IS 'Control implementation instances with ownership and status tracking';
COMMENT ON TABLE control_evidence IS 'Evidence collection and validation for controls';
COMMENT ON TABLE control_tests IS 'Control testing plans, execution, and results';
COMMENT ON TABLE control_exceptions IS 'Control exceptions and compensating controls management';
COMMENT ON TABLE ccm_connectors IS 'Continuous Control Monitoring data source connectors';
COMMENT ON TABLE ccm_alerts IS 'Real-time alerts from CCM monitoring';
COMMENT ON TABLE control_audit_trail IS 'Comprehensive audit trail for all control-related activities';
