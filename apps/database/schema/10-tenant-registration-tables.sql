-- ============================================================================
-- TENANT REGISTRATION - Extended Tables for Complete Registration
-- All related tables to support comprehensive customer registration
-- ============================================================================

-- ============================================================================
-- TENANT EXTENDED INFO - Additional Company Information
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_extended_info (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Legal Names
    trade_name VARCHAR(255),
    trade_name_ar VARCHAR(255),
    
    -- Registration Details
    registration_number VARCHAR(50) NOT NULL,
    tax_number VARCHAR(50) NOT NULL,
    commercial_license VARCHAR(50) NOT NULL,
    license_issue_date DATE,
    license_expiry_date DATE,
    
    -- Company Details
    company_type VARCHAR(50), -- LLC, Corporation, Partnership, etc.
    establishment_date DATE,
    industry VARCHAR(100) NOT NULL,
    sub_industry VARCHAR(100),
    number_of_employees VARCHAR(50),
    annual_revenue VARCHAR(50),
    
    -- Business Description
    business_description TEXT,
    business_description_ar TEXT,
    website VARCHAR(255),
    linkedin_profile VARCHAR(255),
    po_box VARCHAR(50),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_extended_registration (registration_number),
    INDEX idx_tenant_extended_tax (tax_number),
    INDEX idx_tenant_extended_industry (industry)
);

-- ============================================================================
-- TENANT CONTACTS - Multiple Contact Persons
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Contact Type
    contact_type VARCHAR(50) NOT NULL, -- primary, financial, technical, billing
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    
    -- Contact Details
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    direct_line VARCHAR(50),
    extension VARCHAR(20),
    
    -- Position
    position VARCHAR(100),
    department VARCHAR(100),
    title VARCHAR(100), -- CEO, CFO, CTO, Manager, etc.
    
    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_contacts_tenant (tenant_id),
    INDEX idx_tenant_contacts_type (contact_type),
    INDEX idx_tenant_contacts_email (email),
    INDEX idx_tenant_contacts_primary (is_primary)
);

-- ============================================================================
-- TENANT BILLING INFO - Payment and Banking Details
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_billing_info (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Billing Contact
    billing_contact_name VARCHAR(255),
    billing_email VARCHAR(255) NOT NULL,
    billing_phone VARCHAR(50),
    
    -- Billing Address (if different from main)
    billing_address VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    
    -- Payment Method
    payment_method VARCHAR(50), -- Bank Transfer, Credit Card, Invoice
    credit_terms VARCHAR(50), -- Net 30, Net 60, etc.
    
    -- Banking Details
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    iban VARCHAR(100),
    swift_code VARCHAR(50),
    branch_name VARCHAR(255),
    account_holder_name VARCHAR(255),
    
    -- Credit Card (encrypted)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    card_expiry_month INTEGER,
    card_expiry_year INTEGER,
    
    -- Stripe/Payment Gateway
    stripe_customer_id VARCHAR(255),
    payment_gateway_customer_id VARCHAR(255),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_billing_email (billing_email),
    INDEX idx_tenant_billing_stripe (stripe_customer_id)
);

-- ============================================================================
-- TENANT SUBSCRIPTIONS - Detailed Subscription Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan_name VARCHAR(50) NOT NULL, -- basic, professional, enterprise
    plan_duration_months INTEGER DEFAULT 12,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    trial_start_date DATE,
    trial_end_date DATE,
    
    -- Limits
    max_users INTEGER DEFAULT 10,
    storage_gb INTEGER DEFAULT 50,
    api_calls_per_day INTEGER DEFAULT 10000,
    
    -- Selected Features
    selected_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
    additional_services TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Pricing
    monthly_price DECIMAL(10,2),
    annual_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled, pending_payment
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_subscriptions_tenant (tenant_id),
    INDEX idx_tenant_subscriptions_status (status),
    INDEX idx_tenant_subscriptions_end_date (end_date)
);

-- ============================================================================
-- TENANT DOCUMENTS - Uploaded Legal Documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Document Details
    document_type VARCHAR(100) NOT NULL, -- commercial_license, tax_certificate, authorization_letter, id_copy
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Verification
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    rejection_reason TEXT,
    
    -- Expiry
    expiry_date DATE,
    is_expired BOOLEAN DEFAULT false,
    
    -- Requirements
    is_required BOOLEAN DEFAULT false,
    
    -- Audit
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_documents_tenant (tenant_id),
    INDEX idx_tenant_documents_type (document_type),
    INDEX idx_tenant_documents_status (verification_status),
    INDEX idx_tenant_documents_expiry (expiry_date)
);

-- ============================================================================
-- TENANT TERMS ACCEPTANCE - Legal Agreement Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_terms_acceptance (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Terms of Service
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    terms_version VARCHAR(20),
    
    -- Privacy Policy
    privacy_accepted BOOLEAN DEFAULT false,
    privacy_accepted_at TIMESTAMP WITH TIME ZONE,
    privacy_version VARCHAR(20),
    
    -- Service Level Agreement
    sla_accepted BOOLEAN DEFAULT false,
    sla_accepted_at TIMESTAMP WITH TIME ZONE,
    sla_version VARCHAR(20),
    
    -- Data Processing Agreement
    data_processing_accepted BOOLEAN DEFAULT false,
    data_processing_accepted_at TIMESTAMP WITH TIME ZONE,
    data_processing_version VARCHAR(20),
    
    -- Acceptable Use Policy
    aup_accepted BOOLEAN DEFAULT false,
    aup_accepted_at TIMESTAMP WITH TIME ZONE,
    aup_version VARCHAR(20),
    
    -- Payment Terms
    payment_terms_accepted BOOLEAN DEFAULT false,
    payment_terms_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Acceptance Details
    accepted_by_name VARCHAR(255),
    accepted_by_email VARCHAR(255),
    accepted_by_title VARCHAR(100),
    ip_address VARCHAR(100),
    user_agent TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TENANT ELECTRONIC SIGNATURES - Digital Signature Records
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_electronic_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Signer Information
    signer_name VARCHAR(255) NOT NULL,
    signer_title VARCHAR(100) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signer_phone VARCHAR(50),
    
    -- Signature Data
    signature_data TEXT NOT NULL, -- Base64 encoded signature or typed name
    signature_type VARCHAR(50) DEFAULT 'typed', -- typed, drawn, digital_certificate
    signature_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Technical Details
    ip_address VARCHAR(100),
    user_agent TEXT,
    geolocation VARCHAR(255),
    device_fingerprint TEXT,
    
    -- Document Details
    document_type VARCHAR(100) NOT NULL, -- registration_agreement, contract, amendment
    document_version VARCHAR(20),
    document_hash VARCHAR(255), -- SHA-256 hash of signed document
    
    -- Verification
    is_valid BOOLEAN DEFAULT true,
    verification_method VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_signatures_tenant (tenant_id),
    INDEX idx_tenant_signatures_email (signer_email),
    INDEX idx_tenant_signatures_date (signature_date),
    INDEX idx_tenant_signatures_type (document_type)
);

-- ============================================================================
-- TENANT COMPLIANCE - Compliance and Certifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_compliance (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Data Residency
    data_residency VARCHAR(100) DEFAULT 'Saudi Arabia',
    data_center_location VARCHAR(100),
    
    -- Compliance Requirements
    gdpr_compliance BOOLEAN DEFAULT false,
    sdaia_compliance BOOLEAN DEFAULT false,
    iso27001_certified BOOLEAN DEFAULT false,
    soc2_compliant BOOLEAN DEFAULT false,
    pci_dss_compliant BOOLEAN DEFAULT false,
    hipaa_compliant BOOLEAN DEFAULT false,
    
    -- Industry Regulations
    industry_regulations TEXT[],
    regulatory_body VARCHAR(255),
    
    -- Data Retention
    data_retention_years INTEGER DEFAULT 7,
    backup_frequency VARCHAR(50) DEFAULT 'daily',
    disaster_recovery_sla VARCHAR(50),
    
    -- Security Requirements
    mfa_required BOOLEAN DEFAULT true,
    password_policy VARCHAR(50) DEFAULT 'strong',
    session_timeout_minutes INTEGER DEFAULT 30,
    ip_whitelist TEXT[],
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TENANT VERIFICATION QUEUE - Document Verification Workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_verification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Verification Details
    verification_type VARCHAR(100) NOT NULL, -- document, identity, business, credit
    priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
    assigned_to UUID,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    verification_result VARCHAR(50), -- approved, rejected, needs_info
    verification_notes TEXT,
    rejection_reasons TEXT[],
    
    -- Timeline
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_verification_queue_tenant (tenant_id),
    INDEX idx_verification_queue_status (status),
    INDEX idx_verification_queue_priority (priority),
    INDEX idx_verification_queue_assigned (assigned_to),
    INDEX idx_verification_queue_deadline (sla_deadline)
);

-- ============================================================================
-- TENANT ONBOARDING - Onboarding Process Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_onboarding (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Onboarding Status
    onboarding_status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 10,
    completion_percentage INTEGER DEFAULT 0,
    
    -- Steps Completed
    account_verified BOOLEAN DEFAULT false,
    documents_verified BOOLEAN DEFAULT false,
    payment_setup BOOLEAN DEFAULT false,
    admin_created BOOLEAN DEFAULT false,
    users_invited BOOLEAN DEFAULT false,
    modules_configured BOOLEAN DEFAULT false,
    data_imported BOOLEAN DEFAULT false,
    training_completed BOOLEAN DEFAULT false,
    go_live_approved BOOLEAN DEFAULT false,
    
    -- Onboarding Call
    onboarding_call_scheduled TIMESTAMP WITH TIME ZONE,
    onboarding_call_completed TIMESTAMP WITH TIME ZONE,
    onboarding_specialist UUID,
    
    -- Timeline
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    target_go_live_date DATE,
    actual_go_live_date DATE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Add verification_status column to tenants table if not exists
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE tenants ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending';
        CREATE INDEX idx_tenants_verification ON tenants(verification_status);
    END IF;
END $$;

-- ============================================================================
-- Create Triggers for Updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_tenant_extended_info_updated_at BEFORE UPDATE ON tenant_extended_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_contacts_updated_at BEFORE UPDATE ON tenant_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_billing_info_updated_at BEFORE UPDATE ON tenant_billing_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_documents_updated_at BEFORE UPDATE ON tenant_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_compliance_updated_at BEFORE UPDATE ON tenant_compliance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_verification_queue_updated_at BEFORE UPDATE ON tenant_verification_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_onboarding_updated_at BEFORE UPDATE ON tenant_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE tenant_extended_info IS 'Extended company legal and business information';
COMMENT ON TABLE tenant_contacts IS 'Multiple contact persons per tenant (primary, financial, technical)';
COMMENT ON TABLE tenant_billing_info IS 'Payment methods and banking details';
COMMENT ON TABLE tenant_subscriptions IS 'Detailed subscription plans and features';
COMMENT ON TABLE tenant_documents IS 'Uploaded legal documents with verification status';
COMMENT ON TABLE tenant_terms_acceptance IS 'Legal agreements and terms acceptance tracking';
COMMENT ON TABLE tenant_electronic_signatures IS 'Digital signatures for legal documents';
COMMENT ON TABLE tenant_compliance IS 'Compliance requirements and certifications';
COMMENT ON TABLE tenant_verification_queue IS 'Document and identity verification workflow';
COMMENT ON TABLE tenant_onboarding IS 'Onboarding process tracking and completion';
