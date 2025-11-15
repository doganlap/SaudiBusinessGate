-- =====================================================
-- Saudi Store - Demo & POC Requests Schema
-- Public demo and proof-of-concept request management
-- =====================================================

-- =====================================================
-- DEMO_REQUESTS TABLE
-- Public demo requests from website visitors
-- =====================================================
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request Information
    request_type VARCHAR(50) DEFAULT 'demo' CHECK (request_type IN ('demo', 'trial', 'consultation')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted', 'converted', 'cancelled')),
    
    -- Contact Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    
    -- Company Details
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    industry VARCHAR(100),
    country_code VARCHAR(3) DEFAULT 'SAU',
    city VARCHAR(100),
    
    -- Demo Preferences
    preferred_date DATE,
    preferred_time TIME,
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    demo_type VARCHAR(50) CHECK (demo_type IN ('online', 'onsite', 'recorded')),
    
    -- Interest & Requirements
    interested_modules JSONB DEFAULT '[]', -- ['crm', 'finance', 'hr', etc.]
    use_cases TEXT,
    requirements TEXT,
    budget_range VARCHAR(50),
    expected_users INTEGER,
    
    -- Source Tracking
    source VARCHAR(100), -- 'website', 'linkedin', 'referral', etc.
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer_url TEXT,
    
    -- Assignment & Follow-up
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    contacted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Conversion Tracking
    converted_to_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(15, 2),
    
    -- Communication
    notes TEXT,
    internal_notes TEXT,
    communication_history JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for demo_requests
CREATE INDEX idx_demo_requests_email ON demo_requests(email);
CREATE INDEX idx_demo_requests_status ON demo_requests(status);
CREATE INDEX idx_demo_requests_request_type ON demo_requests(request_type);
CREATE INDEX idx_demo_requests_assigned_to ON demo_requests(assigned_to);
CREATE INDEX idx_demo_requests_created_at ON demo_requests(created_at DESC);
CREATE INDEX idx_demo_requests_company_name ON demo_requests(company_name);
CREATE INDEX idx_demo_requests_source ON demo_requests(source);

-- =====================================================
-- POC_REQUESTS TABLE
-- Proof-of-Concept project requests
-- =====================================================
CREATE TABLE IF NOT EXISTS poc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request Information
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Contact Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(100),
    
    -- Company Details
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    industry VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) DEFAULT 'SAU',
    city VARCHAR(100),
    website_url TEXT,
    
    -- POC Details
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    business_objectives TEXT,
    success_criteria TEXT,
    
    -- Technical Requirements
    required_modules JSONB NOT NULL DEFAULT '[]', -- ['crm', 'finance', 'hr', etc.]
    technical_requirements TEXT,
    integration_needs TEXT,
    data_migration_needed BOOLEAN DEFAULT FALSE,
    existing_systems TEXT,
    
    -- Scope & Timeline
    expected_duration_weeks INTEGER,
    expected_start_date DATE,
    expected_users INTEGER,
    expected_data_volume VARCHAR(50),
    
    -- Budget & Resources
    budget_range VARCHAR(50),
    budget_approved BOOLEAN DEFAULT FALSE,
    decision_timeline VARCHAR(50),
    decision_makers JSONB DEFAULT '[]',
    
    -- Evaluation Criteria
    evaluation_criteria TEXT,
    competitors_considered TEXT,
    
    -- Assignment & Management
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    poc_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- POC Execution
    poc_start_date DATE,
    poc_end_date DATE,
    poc_status_updates JSONB DEFAULT '[]',
    deliverables JSONB DEFAULT '[]',
    
    -- Documents & Attachments
    proposal_url TEXT,
    contract_url TEXT,
    documents JSONB DEFAULT '[]',
    
    -- Conversion Tracking
    converted_to_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(15, 2),
    contract_value DECIMAL(15, 2),
    
    -- Communication
    notes TEXT,
    internal_notes TEXT,
    communication_history JSONB DEFAULT '[]',
    meeting_notes JSONB DEFAULT '[]',
    
    -- Source Tracking
    source VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for poc_requests
CREATE INDEX idx_poc_requests_email ON poc_requests(email);
CREATE INDEX idx_poc_requests_status ON poc_requests(status);
CREATE INDEX idx_poc_requests_priority ON poc_requests(priority);
CREATE INDEX idx_poc_requests_assigned_to ON poc_requests(assigned_to);
CREATE INDEX idx_poc_requests_company_name ON poc_requests(company_name);
CREATE INDEX idx_poc_requests_created_at ON poc_requests(created_at DESC);
CREATE INDEX idx_poc_requests_source ON poc_requests(source);
CREATE INDEX idx_poc_requests_poc_manager ON poc_requests(poc_manager_id);

-- =====================================================
-- PARTNER_INVITATIONS TABLE
-- Partner program invitations and referrals
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Invitation Code
    invitation_code VARCHAR(50) UNIQUE NOT NULL,
    invitation_type VARCHAR(50) DEFAULT 'partner' CHECK (invitation_type IN ('partner', 'reseller', 'affiliate', 'referral')),
    
    -- Partner Information
    partner_name VARCHAR(255) NOT NULL,
    partner_email VARCHAR(255) NOT NULL,
    partner_phone VARCHAR(50),
    partner_company VARCHAR(255),
    partner_website TEXT,
    
    -- Partnership Details
    partnership_tier VARCHAR(50) DEFAULT 'basic' CHECK (partnership_tier IN ('basic', 'silver', 'gold', 'platinum')),
    commission_rate DECIMAL(5, 2) DEFAULT 10.00,
    revenue_share_percentage DECIMAL(5, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired', 'revoked')),
    
    -- Invitation Details
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Acceptance
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Terms & Conditions
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_version VARCHAR(50),
    nda_signed BOOLEAN DEFAULT FALSE,
    
    -- Permissions & Access
    allowed_features JSONB DEFAULT '[]',
    access_level VARCHAR(50) DEFAULT 'standard',
    
    -- Tracking
    referral_count INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(15, 2) DEFAULT 0.00,
    total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Documents
    contract_url TEXT,
    documents JSONB DEFAULT '[]',
    
    -- Communication
    welcome_message TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_partner_email CHECK (partner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 100),
    CONSTRAINT valid_revenue_share CHECK (revenue_share_percentage IS NULL OR (revenue_share_percentage >= 0 AND revenue_share_percentage <= 100))
);

-- Indexes for partner_invitations
CREATE INDEX idx_partner_invitations_code ON partner_invitations(invitation_code);
CREATE INDEX idx_partner_invitations_email ON partner_invitations(partner_email);
CREATE INDEX idx_partner_invitations_status ON partner_invitations(status);
CREATE INDEX idx_partner_invitations_invited_by ON partner_invitations(invited_by);
CREATE INDEX idx_partner_invitations_type ON partner_invitations(invitation_type);
CREATE INDEX idx_partner_invitations_created_at ON partner_invitations(created_at DESC);

-- =====================================================
-- TRIGGERS
-- Auto-update timestamps
-- =====================================================

-- Apply trigger to demo_requests
CREATE TRIGGER update_demo_requests_updated_at
    BEFORE UPDATE ON demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to poc_requests
CREATE TRIGGER update_poc_requests_updated_at
    BEFORE UPDATE ON poc_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to partner_invitations
CREATE TRIGGER update_partner_invitations_updated_at
    BEFORE UPDATE ON partner_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE demo_requests IS 'Public demo requests from website visitors';
COMMENT ON TABLE poc_requests IS 'Proof-of-concept project requests and tracking';
COMMENT ON TABLE partner_invitations IS 'Partner program invitations and referral tracking';

COMMENT ON COLUMN demo_requests.status IS 'pending, approved, rejected, contacted, converted, cancelled';
COMMENT ON COLUMN poc_requests.status IS 'pending, reviewing, approved, rejected, in_progress, completed, cancelled';
COMMENT ON COLUMN partner_invitations.status IS 'pending, sent, accepted, rejected, expired, revoked';
