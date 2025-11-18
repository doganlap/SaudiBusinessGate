-- Finance module tables: financial_accounts and transactions
-- Ensures required schema for FinanceService

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- financial_accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense')),
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  parent_account_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_fin_accounts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_fin_accounts_parent FOREIGN KEY (parent_account_id) REFERENCES financial_accounts(id) ON DELETE SET NULL
);

-- Unique index for (tenant_id, account_code)
CREATE UNIQUE INDEX IF NOT EXISTS ux_financial_accounts_tenant_code ON financial_accounts(tenant_id, account_code);
CREATE INDEX IF NOT EXISTS ix_financial_accounts_tenant_type ON financial_accounts(tenant_id, account_type);
CREATE INDEX IF NOT EXISTS ix_financial_accounts_tenant_active ON financial_accounts(tenant_id, is_active);

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  account_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit','credit','payment','receipt')),
  amount NUMERIC(18,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reference_id TEXT NULL,
  transaction_number TEXT NULL,
  description TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','completed','cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_transactions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES financial_accounts(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_transactions_tenant_type ON transactions(tenant_id, transaction_type);
CREATE INDEX IF NOT EXISTS ix_transactions_tenant_status ON transactions(tenant_id, status);
CREATE INDEX IF NOT EXISTS ix_transactions_tenant_date ON transactions(tenant_id, transaction_date);

-- Trigger to auto-update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_financial_accounts_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_financial_accounts_updated_at
    BEFORE UPDATE ON financial_accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

    CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;