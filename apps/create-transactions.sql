-- Finance Module Database Schema

-- Financial Accounts Table
CREATE TABLE IF NOT EXISTS financial_accounts (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, account_number)
);

-- Create index on tenant_id for performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_tenant_id ON financial_accounts(tenant_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  transaction_number VARCHAR(20) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  account_id INTEGER REFERENCES financial_accounts(id),
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on tenant_id for performance
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);