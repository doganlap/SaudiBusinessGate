-- Enhanced Finance Module Database Schema
-- Complete end-to-end finance system with all relations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Financial Accounts (Chart of Accounts)
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    account_subtype VARCHAR(100), -- current_asset, fixed_asset, current_liability, etc.
    parent_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    opening_balance DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false,
    description TEXT,
    tax_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, account_code),
    INDEX idx_financial_accounts_tenant (tenant_id),
    INDEX idx_financial_accounts_type (account_type),
    INDEX idx_financial_accounts_parent (parent_account_id)
);

-- Journal Entries (Double Entry Bookkeeping)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    entry_number VARCHAR(100) NOT NULL,
    entry_date DATE NOT NULL,
    reference VARCHAR(255),
    description TEXT NOT NULL,
    total_debit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_credit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    entry_type VARCHAR(100) DEFAULT 'manual', -- manual, automatic, adjustment, closing
    source_document VARCHAR(255), -- invoice, receipt, payment, etc.
    source_id UUID,
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, entry_number),
    INDEX idx_journal_entries_tenant (tenant_id),
    INDEX idx_journal_entries_date (entry_date),
    INDEX idx_journal_entries_status (status),
    INDEX idx_journal_entries_type (entry_type)
);

-- Journal Entry Lines (Individual debits and credits)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    line_number INTEGER NOT NULL,
    description TEXT,
    debit_amount DECIMAL(15, 2) DEFAULT 0.00,
    credit_amount DECIMAL(15, 2) DEFAULT 0.00,
    reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_journal_lines_tenant (tenant_id),
    INDEX idx_journal_lines_entry (journal_entry_id),
    INDEX idx_journal_lines_account (account_id),
    UNIQUE(journal_entry_id, line_number)
);

-- Invoices (Accounts Receivable)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    customer_id UUID, -- Reference to CRM customer
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance_due DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_terms VARCHAR(100),
    notes TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, invoice_number),
    INDEX idx_invoices_tenant (tenant_id),
    INDEX idx_invoices_customer (customer_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_due_date (due_date)
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) GENERATED ALWAYS AS (line_total * tax_rate / 100) STORED,
    account_id UUID REFERENCES financial_accounts(id),
    
    INDEX idx_invoice_lines_tenant (tenant_id),
    INDEX idx_invoice_lines_invoice (invoice_id),
    UNIQUE(invoice_id, line_number)
);

-- Bills (Accounts Payable)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    bill_number VARCHAR(100) NOT NULL,
    vendor_id UUID, -- Reference to procurement vendor
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255),
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance_due DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'approved', 'paid', 'overdue', 'cancelled')),
    payment_terms VARCHAR(100),
    notes TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, bill_number),
    INDEX idx_bills_tenant (tenant_id),
    INDEX idx_bills_vendor (vendor_id),
    INDEX idx_bills_status (status),
    INDEX idx_bills_due_date (due_date)
);

-- Bill Line Items
CREATE TABLE IF NOT EXISTS bill_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) GENERATED ALWAYS AS (line_total * tax_rate / 100) STORED,
    account_id UUID REFERENCES financial_accounts(id),
    
    INDEX idx_bill_lines_tenant (tenant_id),
    INDEX idx_bill_lines_bill (bill_id),
    UNIQUE(bill_id, line_number)
);

-- Payments (Both Received and Made)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    payment_number VARCHAR(100) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('received', 'made')),
    payment_method VARCHAR(100) NOT NULL, -- cash, check, bank_transfer, credit_card, etc.
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    bank_account_id UUID REFERENCES financial_accounts(id),
    customer_id UUID, -- For received payments
    vendor_id UUID, -- For made payments
    invoice_id UUID REFERENCES invoices(id),
    bill_id UUID REFERENCES bills(id),
    journal_entry_id UUID REFERENCES journal_entries(id),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, payment_number),
    INDEX idx_payments_tenant (tenant_id),
    INDEX idx_payments_type (payment_type),
    INDEX idx_payments_date (payment_date),
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_bill (bill_id)
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    budget_name VARCHAR(255) NOT NULL,
    budget_period VARCHAR(50) NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    total_budgeted DECIMAL(15, 2) DEFAULT 0.00,
    total_actual DECIMAL(15, 2) DEFAULT 0.00,
    variance DECIMAL(15, 2) GENERATED ALWAYS AS (total_actual - total_budgeted) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    INDEX idx_budgets_tenant (tenant_id),
    INDEX idx_budgets_period (budget_period),
    INDEX idx_budgets_year (fiscal_year)
);

-- Budget Line Items
CREATE TABLE IF NOT EXISTS budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    budgeted_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    actual_amount DECIMAL(15, 2) DEFAULT 0.00,
    variance DECIMAL(15, 2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
    notes TEXT,
    
    INDEX idx_budget_lines_tenant (tenant_id),
    INDEX idx_budget_lines_budget (budget_id),
    INDEX idx_budget_lines_account (account_id),
    UNIQUE(budget_id, account_id)
);

-- Financial Reports Configuration
CREATE TABLE IF NOT EXISTS financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL, -- balance_sheet, income_statement, cash_flow, trial_balance
    report_period VARCHAR(50) NOT NULL, -- monthly, quarterly, yearly, custom
    start_date DATE,
    end_date DATE,
    generated_at TIMESTAMP WITH TIME ZONE,
    generated_by VARCHAR(255),
    report_data JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_financial_reports_tenant (tenant_id),
    INDEX idx_financial_reports_type (report_type),
    INDEX idx_financial_reports_period (start_date, end_date)
);

-- Sample Chart of Accounts
INSERT INTO financial_accounts (tenant_id, account_code, account_name, account_type, account_subtype, is_system_account) VALUES
-- Assets
('default-tenant', '1000', 'Cash and Cash Equivalents', 'asset', 'current_asset', true),
('default-tenant', '1100', 'Accounts Receivable', 'asset', 'current_asset', true),
('default-tenant', '1200', 'Inventory', 'asset', 'current_asset', true),
('default-tenant', '1500', 'Equipment', 'asset', 'fixed_asset', true),
('default-tenant', '1600', 'Accumulated Depreciation - Equipment', 'asset', 'fixed_asset', true),

-- Liabilities
('default-tenant', '2000', 'Accounts Payable', 'liability', 'current_liability', true),
('default-tenant', '2100', 'Accrued Expenses', 'liability', 'current_liability', true),
('default-tenant', '2500', 'Long-term Debt', 'liability', 'long_term_liability', true),

-- Equity
('default-tenant', '3000', 'Owner\'s Equity', 'equity', 'equity', true),
('default-tenant', '3100', 'Retained Earnings', 'equity', 'equity', true),

-- Revenue
('default-tenant', '4000', 'Sales Revenue', 'revenue', 'operating_revenue', true),
('default-tenant', '4100', 'Service Revenue', 'revenue', 'operating_revenue', true),

-- Expenses
('default-tenant', '5000', 'Cost of Goods Sold', 'expense', 'cost_of_sales', true),
('default-tenant', '6000', 'Operating Expenses', 'expense', 'operating_expense', true),
('default-tenant', '6100', 'Salaries and Wages', 'expense', 'operating_expense', true),
('default-tenant', '6200', 'Rent Expense', 'expense', 'operating_expense', true),
('default-tenant', '6300', 'Utilities Expense', 'expense', 'operating_expense', true)
ON CONFLICT (tenant_id, account_code) DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON financial_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
