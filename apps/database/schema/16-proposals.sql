-- Proposals Table
CREATE TABLE sales_proposals (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    quote_id INTEGER REFERENCES sales_quotes(id),
    deal_id INTEGER REFERENCES sales_deals(id),
    lead_id INTEGER REFERENCES sales_leads(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposal Sections Table
CREATE TABLE sales_proposal_sections (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES sales_proposals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    sort_order INTEGER
);

-- Proposal Templates Table
CREATE TABLE sales_proposal_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT
);

-- Indexes
CREATE INDEX idx_sales_proposals_tenant_id ON sales_proposals(tenant_id);
CREATE INDEX idx_sales_proposals_quote_id ON sales_proposals(quote_id);
CREATE INDEX idx_sales_proposals_deal_id ON sales_proposals(deal_id);
CREATE INDEX idx_sales_proposals_lead_id ON sales_proposals(lead_id);
CREATE INDEX idx_sales_proposal_sections_proposal_id ON sales_proposal_sections(proposal_id);

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at_on_sales_proposals() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_proposals_updated_at_trigger
BEFORE UPDATE ON sales_proposals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_sales_proposals();