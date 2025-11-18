-- Create tax_records table for Saudi VAT compliance
CREATE TABLE IF NOT EXISTS tax_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    tax_type VARCHAR(50) NOT NULL, -- 'vat', 'withholding', 'zakat'
    transaction_type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'adjustment'
    tax_code VARCHAR(50) NOT NULL, -- 'VAT_15', 'VAT_EXEMPT', 'VAT_ZERO'
    amount DECIMAL(15,2) NOT NULL,
    base_amount DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    tax_period VARCHAR(20) NOT NULL, -- '2024-Q4', '2024-12'
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'posted', 'filed'
    zatca_status VARCHAR(50), -- 'pending', 'validated', 'reported', 'rejected'
    zatca_uuid VARCHAR(100),
    zatca_qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_records_tenant_id ON tax_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_tax_period ON tax_records(tax_period);
CREATE INDEX IF NOT EXISTS idx_tax_records_transaction_date ON tax_records(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_records_status ON tax_records(status);
CREATE INDEX IF NOT EXISTS idx_tax_records_tax_type ON tax_records(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_records_zatca_status ON tax_records(zatca_status);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_records TO authenticated;

-- Insert sample tax data for testing Saudi VAT compliance
INSERT INTO tax_records (tenant_id, tax_type, transaction_type, tax_code, amount, base_amount, tax_rate, tax_period, transaction_date, reference_number, description, status, zatca_status) VALUES
('demo-tenant', 'vat', 'sale', 'VAT_15', 1500.00, 10000.00, 15.00, '2024-Q4', '2024-12-01', 'INV-2024-001', 'Standard VAT on sales - December 2024', 'posted', 'validated'),
('demo-tenant', 'vat', 'sale', 'VAT_15', 2250.00, 15000.00, 15.00, '2024-Q4', '2024-12-15', 'INV-2024-002', 'Standard VAT on sales - December 2024', 'posted', 'validated'),
('demo-tenant', 'vat', 'purchase', 'VAT_INPUT', 750.00, 5000.00, 15.00, '2024-Q4', '2024-12-05', 'PO-2024-001', 'Input VAT on purchases - December 2024', 'posted', 'validated'),
('demo-tenant', 'vat', 'purchase', 'VAT_INPUT', 450.00, 3000.00, 15.00, '2024-Q4', '2024-12-20', 'PO-2024-002', 'Input VAT on purchases - December 2024', 'posted', 'validated'),
('demo-tenant', 'vat', 'sale', 'VAT_15', 1800.00, 12000.00, 15.00, '2024-Q4', '2024-11-10', 'INV-2024-003', 'Standard VAT on sales - November 2024', 'posted', 'validated'),
('demo-tenant', 'vat', 'purchase', 'VAT_INPUT', 600.00, 4000.00, 15.00, '2024-Q4', '2024-11-25', 'PO-2024-003', 'Input VAT on purchases - November 2024', 'posted', 'validated');