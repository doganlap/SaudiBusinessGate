-- Solution Module Database Schema
-- RFP and Solutioning Platform Tables
-- This file creates all tables for the Solution Module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RFPs Table
CREATE TABLE IF NOT EXISTS solution_rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  rfp_number VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  client_name VARCHAR(255) NOT NULL,
  client_industry VARCHAR(100),
  sector VARCHAR(100),
  language VARCHAR(10) DEFAULT 'both' CHECK (language IN ('ar', 'en', 'both')),
  received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submission_deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'intake' CHECK (status IN ('intake', 'qualified', 'solution_design', 'proposal', 'review', 'approved', 'submitted', 'won', 'lost')),
  qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
  win_probability DECIMAL(5,2) CHECK (win_probability >= 0 AND win_probability <= 100),
  tags JSONB DEFAULT '[]'::jsonb,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solution Designs Table
CREATE TABLE IF NOT EXISTS solution_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  rfp_id UUID NOT NULL,
  selected_modules JSONB DEFAULT '[]'::jsonb,
  custom_modules JSONB,
  value_propositions JSONB,
  estimated_timeline VARCHAR(255),
  complexity_assessment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfp_id) REFERENCES solution_rfps(id) ON DELETE CASCADE
);

-- Proposals Table
CREATE TABLE IF NOT EXISTS solution_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  rfp_id UUID NOT NULL,
  solution_design_id UUID NOT NULL,
  proposal_number VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  pricing JSONB,
  compliance JSONB,
  localization JSONB,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'submitted')),
  submitted_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfp_id) REFERENCES solution_rfps(id) ON DELETE CASCADE,
  FOREIGN KEY (solution_design_id) REFERENCES solution_designs(id) ON DELETE CASCADE
);

-- Proposal Reviews Table
CREATE TABLE IF NOT EXISTS solution_proposal_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL,
  reviewer_id VARCHAR(255) NOT NULL,
  section VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  comments TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES solution_proposals(id) ON DELETE CASCADE
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS solution_content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('executive_summary', 'solution_overview', 'module_description', 'pricing', 'timeline', 'compliance', 'custom')),
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'both' CHECK (language IN ('ar', 'en', 'both')),
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_solution_rfps_tenant ON solution_rfps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_solution_rfps_status ON solution_rfps(status);
CREATE INDEX IF NOT EXISTS idx_solution_rfps_sector ON solution_rfps(sector);
CREATE INDEX IF NOT EXISTS idx_solution_rfps_created ON solution_rfps(created_at);
CREATE INDEX IF NOT EXISTS idx_solution_rfps_assigned ON solution_rfps(assigned_to);
CREATE INDEX IF NOT EXISTS idx_solution_rfps_rfp_number ON solution_rfps(rfp_number);

CREATE INDEX IF NOT EXISTS idx_solution_designs_tenant ON solution_designs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_solution_designs_rfp ON solution_designs(rfp_id);

CREATE INDEX IF NOT EXISTS idx_solution_proposals_tenant ON solution_proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_solution_proposals_rfp ON solution_proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_solution_proposals_design ON solution_proposals(solution_design_id);
CREATE INDEX IF NOT EXISTS idx_solution_proposals_status ON solution_proposals(status);
CREATE INDEX IF NOT EXISTS idx_solution_proposals_proposal_number ON solution_proposals(proposal_number);

CREATE INDEX IF NOT EXISTS idx_solution_reviews_proposal ON solution_proposal_reviews(proposal_id);
CREATE INDEX IF NOT EXISTS idx_solution_reviews_status ON solution_proposal_reviews(status);

CREATE INDEX IF NOT EXISTS idx_solution_templates_tenant ON solution_content_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_solution_templates_type ON solution_content_templates(type);
CREATE INDEX IF NOT EXISTS idx_solution_templates_active ON solution_content_templates(is_active);

-- Create updated_at trigger for solution_rfps
CREATE OR REPLACE FUNCTION update_solution_rfps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_solution_rfps_updated_at
BEFORE UPDATE ON solution_rfps
FOR EACH ROW
EXECUTE FUNCTION update_solution_rfps_updated_at();

-- Create updated_at trigger for solution_designs
CREATE OR REPLACE FUNCTION update_solution_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_solution_designs_updated_at
BEFORE UPDATE ON solution_designs
FOR EACH ROW
EXECUTE FUNCTION update_solution_designs_updated_at();

-- Create updated_at trigger for solution_proposals
CREATE OR REPLACE FUNCTION update_solution_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_solution_proposals_updated_at
BEFORE UPDATE ON solution_proposals
FOR EACH ROW
EXECUTE FUNCTION update_solution_proposals_updated_at();

-- Create updated_at trigger for solution_content_templates
CREATE OR REPLACE FUNCTION update_solution_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_solution_templates_updated_at
BEFORE UPDATE ON solution_content_templates
FOR EACH ROW
EXECUTE FUNCTION update_solution_templates_updated_at();

