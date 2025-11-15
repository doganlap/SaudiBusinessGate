-- Finance Module Database Schema
-- DoganHubStore Enterprise Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Financial Accounts Table
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    parent_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, account_code)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'payment', 'receipt')),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_id VARCHAR(255),
    transaction_number VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
    budget_name VARCHAR(255) NOT NULL,
    budget_period VARCHAR(50) NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cost Centers Table
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    cost_center_code VARCHAR(50) NOT NULL,
    cost_center_name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, cost_center_code)
);

-- Transaction Cost Center Allocation
CREATE TABLE IF NOT EXISTS transaction_cost_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    cost_center_id UUID NOT NULL REFERENCES cost_centers(id) ON DELETE RESTRICT,
    allocation_percentage DECIMAL(5, 2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    allocated_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_tenant ON financial_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_type ON financial_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_active ON financial_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_code ON financial_accounts(account_code);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_budgets_tenant ON budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_budgets_account ON budgets(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

CREATE INDEX IF NOT EXISTS idx_cost_centers_tenant ON cost_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_active ON cost_centers(is_active);

CREATE INDEX IF NOT EXISTS idx_cost_allocations_transaction ON transaction_cost_allocations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_cost_center ON transaction_cost_allocations(cost_center_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON financial_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data for Development/Testing
INSERT INTO financial_accounts (tenant_id, account_name, account_code, account_type, balance, description) VALUES
('default', 'Cash and Cash Equivalents', '1000', 'asset', 125000.00, 'Primary operating cash account'),
('default', 'Accounts Receivable', '1200', 'asset', 78000.00, 'Outstanding customer invoices'),
('default', 'Inventory', '1300', 'asset', 45000.00, 'Product inventory and supplies'),
('default', 'Office Equipment', '1500', 'asset', 25000.00, 'Computer equipment and office furniture'),
('default', 'Software Licenses', '1600', 'asset', 15000.00, 'Software licenses and subscriptions'),
('default', 'Accounts Payable', '2000', 'liability', 32000.00, 'Outstanding vendor bills'),
('default', 'Revenue', '4000', 'revenue', 125000.00, 'Primary revenue account'),
('default', 'Operating Expenses', '5000', 'expense', 93000.00, 'General operating expenses')
ON CONFLICT (tenant_id, account_code) DO NOTHING;

-- Sample Transactions
INSERT INTO transactions (tenant_id, account_id, transaction_type, amount, transaction_date, reference_id, description, status) 
SELECT 
    'default',
    (SELECT id FROM financial_accounts WHERE tenant_id = 'default' AND account_code = '1200' LIMIT 1),
    'receipt',
    45000.00,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'INV-2024-001',
    'Software licensing and support services',
    'pending'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference_id = 'INV-2024-001');

INSERT INTO transactions (tenant_id, account_id, transaction_type, amount, transaction_date, reference_id, description, status)
SELECT 
    'default',
    (SELECT id FROM financial_accounts WHERE tenant_id = 'default' AND account_code = '2000' LIMIT 1),
    'payment',
    12500.00,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'BILL-2024-089',
    'Hardware procurement and installation',
    'pending'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference_id = 'BILL-2024-089');

COMMENT ON TABLE financial_accounts IS 'Chart of accounts for multi-tenant financial management';
COMMENT ON TABLE transactions IS 'Financial transactions with account linkage';
COMMENT ON TABLE budgets IS 'Budget planning and tracking';
COMMENT ON TABLE cost_centers IS 'Cost center management for expense allocation';
COMMENT ON TABLE transaction_cost_allocations IS 'Cost center allocation for transactions';
