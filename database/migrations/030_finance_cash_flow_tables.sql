-- Finance Cash Flow and Enhanced Tables Migration
-- Adds missing tables for cash flow, accounts payable, and accounts receivable management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cash Flow Statements Table
CREATE TABLE IF NOT EXISTS cash_flow_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    statement_period VARCHAR(50) NOT NULL, -- 'month', 'quarter', 'year'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Operating Activities
    operating_income DECIMAL(15, 2) DEFAULT 0.00,
    operating_expenses DECIMAL(15, 2) DEFAULT 0.00,
    operating_net DECIMAL(15, 2) GENERATED ALWAYS AS (operating_income - operating_expenses) STORED,
    
    -- Investing Activities
    investing_purchases DECIMAL(15, 2) DEFAULT 0.00,
    investing_sales DECIMAL(15, 2) DEFAULT 0.00,
    investing_net DECIMAL(15, 2) GENERATED ALWAYS AS (investing_sales - investing_purchases) STORED,
    
    -- Financing Activities
    financing_borrowings DECIMAL(15, 2) DEFAULT 0.00,
    financing_repayments DECIMAL(15, 2) DEFAULT 0.00,
    financing_dividends DECIMAL(15, 2) DEFAULT 0.00,
    financing_net DECIMAL(15, 2) GENERATED ALWAYS AS (financing_borrowings - financing_repayments - financing_dividends) STORED,
    
    -- Net Cash Flow
    net_cash_flow DECIMAL(15, 2) GENERATED ALWAYS AS (
        operating_net + investing_net + financing_net
    ) STORED,
    
    -- Beginning and Ending Balances
    beginning_balance DECIMAL(15, 2) DEFAULT 0.00,
    ending_balance DECIMAL(15, 2) GENERATED ALWAYS AS (beginning_balance + net_cash_flow) STORED,
    
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, statement_period, period_start, period_end),
    INDEX idx_cash_flow_tenant (tenant_id),
    INDEX idx_cash_flow_period (period_start, period_end)
);

-- Accounts Payable (Enhanced from bills table)
-- This table extends the existing bills table with additional fields
-- If bills table doesn't exist, create it
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    vendor_id UUID,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance DECIMAL(15, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    category VARCHAR(100),
    description TEXT,
    bill_id UUID, -- Reference to bills table if it exists
    journal_entry_id UUID, -- Reference to journal_entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, invoice_number),
    INDEX idx_ap_tenant (tenant_id),
    INDEX idx_ap_vendor (vendor_id),
    INDEX idx_ap_status (status),
    INDEX idx_ap_due_date (due_date),
    INDEX idx_ap_bill (bill_id)
);

-- Accounts Receivable (Enhanced from invoices table)
-- This table extends the existing invoices table with additional fields
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance DECIMAL(15, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    category VARCHAR(100),
    description TEXT,
    invoice_id UUID, -- Reference to invoices table if it exists
    journal_entry_id UUID, -- Reference to journal_entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    UNIQUE(tenant_id, invoice_number),
    INDEX idx_ar_tenant (tenant_id),
    INDEX idx_ar_customer (customer_id),
    INDEX idx_ar_status (status),
    INDEX idx_ar_due_date (due_date),
    INDEX idx_ar_invoice (invoice_id)
);

-- Cash Flow Transactions (Detailed transactions for cash flow calculation)
CREATE TABLE IF NOT EXISTS cash_flow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    cash_flow_statement_id UUID REFERENCES cash_flow_statements(id) ON DELETE CASCADE,
    transaction_id UUID, -- Reference to transactions table
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('operating', 'investing', 'financing')),
    transaction_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    account_id UUID REFERENCES financial_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cft_tenant (tenant_id),
    INDEX idx_cft_statement (cash_flow_statement_id),
    INDEX idx_cft_activity (activity_type),
    INDEX idx_cft_date (transaction_date)
);

-- Monthly Financial Summary (for dashboard and analytics)
CREATE TABLE IF NOT EXISTS monthly_financial_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    month DATE NOT NULL, -- First day of the month
    revenue DECIMAL(15, 2) DEFAULT 0.00,
    expenses DECIMAL(15, 2) DEFAULT 0.00,
    profit DECIMAL(15, 2) GENERATED ALWAYS AS (revenue - expenses) STORED,
    accounts_receivable DECIMAL(15, 2) DEFAULT 0.00,
    accounts_payable DECIMAL(15, 2) DEFAULT 0.00,
    cash_flow DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, month),
    INDEX idx_mfs_tenant (tenant_id),
    INDEX idx_mfs_month (month)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cash_flow_statements_updated_at') THEN
        CREATE TRIGGER update_cash_flow_statements_updated_at 
        BEFORE UPDATE ON cash_flow_statements 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_payable_updated_at') THEN
        CREATE TRIGGER update_accounts_payable_updated_at 
        BEFORE UPDATE ON accounts_payable 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_receivable_updated_at') THEN
        CREATE TRIGGER update_accounts_receivable_updated_at 
        BEFORE UPDATE ON accounts_receivable 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_monthly_financial_summary_updated_at') THEN
        CREATE TRIGGER update_monthly_financial_summary_updated_at 
        BEFORE UPDATE ON monthly_financial_summary 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Function to automatically update status to 'overdue' for past due invoices/bills
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('paid', 'cancelled') THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply overdue triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ap_overdue_status') THEN
        CREATE TRIGGER update_ap_overdue_status
        BEFORE INSERT OR UPDATE ON accounts_payable
        FOR EACH ROW EXECUTE FUNCTION update_overdue_status();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ar_overdue_status') THEN
        CREATE TRIGGER update_ar_overdue_status
        BEFORE INSERT OR UPDATE ON accounts_receivable
        FOR EACH ROW EXECUTE FUNCTION update_overdue_status();
    END IF;
END$$;

