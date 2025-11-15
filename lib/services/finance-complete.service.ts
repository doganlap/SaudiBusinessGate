import { query, transaction, PoolClient } from '@/lib/db/connection';

// Complete Finance Service with all entities and relations
export interface FinancialAccount {
  id: string;
  tenant_id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_subtype?: string;
  parent_account_id?: string;
  balance: number;
  opening_balance: number;
  is_active: boolean;
  is_system_account: boolean;
  description?: string;
  tax_code?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface JournalEntry {
  id: string;
  tenant_id: string;
  entry_number: string;
  entry_date: string;
  reference?: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  entry_type: string;
  source_document?: string;
  source_id?: string;
  posted_at?: string;
  posted_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  tenant_id: string;
  journal_entry_id: string;
  account_id: string;
  line_number: number;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  reference?: string;
  created_at: string;
  account?: FinancialAccount;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_terms?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  tenant_id: string;
  invoice_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
  account_id?: string;
}

export interface Bill {
  id: string;
  tenant_id: string;
  bill_number: string;
  vendor_id?: string;
  vendor_name: string;
  vendor_email?: string;
  bill_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'received' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  payment_terms?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lines?: BillLine[];
}

export interface BillLine {
  id: string;
  tenant_id: string;
  bill_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
  account_id?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  payment_number: string;
  payment_type: 'received' | 'made';
  payment_method: string;
  payment_date: string;
  amount: number;
  reference?: string;
  description?: string;
  bank_account_id?: string;
  customer_id?: string;
  vendor_id?: string;
  invoice_id?: string;
  bill_id?: string;
  journal_entry_id?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Budget {
  id: string;
  tenant_id: string;
  budget_name: string;
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  fiscal_year: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_budgeted: number;
  total_actual: number;
  variance: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  lines?: BudgetLine[];
}

export interface BudgetLine {
  id: string;
  tenant_id: string;
  budget_id: string;
  account_id: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  notes?: string;
  account?: FinancialAccount;
}

export class CompleteFinanceService {
  // CHART OF ACCOUNTS OPERATIONS
  
  static async getAccounts(tenantId: string, filters?: {
    type?: string;
    isActive?: boolean;
    parentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<FinancialAccount[]> {
    let sql = `
      SELECT * FROM financial_accounts 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.type && filters.type !== 'all') {
      sql += ` AND account_type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters?.isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(filters.isActive);
      paramIndex++;
    }

    if (filters?.parentId) {
      sql += ` AND parent_account_id = $${paramIndex}`;
      params.push(filters.parentId);
      paramIndex++;
    }

    sql += ` ORDER BY account_code ASC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<FinancialAccount>(sql, params);
    return result.rows;
  }

  static async createAccount(tenantId: string, accountData: Omit<FinancialAccount, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<FinancialAccount> {
    const result = await query<FinancialAccount>(
      `INSERT INTO financial_accounts (
        tenant_id, account_code, account_name, account_type, account_subtype,
        parent_account_id, balance, opening_balance, is_active, is_system_account,
        description, tax_code, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        tenantId, accountData.account_code, accountData.account_name, accountData.account_type,
        accountData.account_subtype, accountData.parent_account_id, accountData.balance,
        accountData.opening_balance, accountData.is_active, accountData.is_system_account,
        accountData.description, accountData.tax_code, accountData.created_by
      ]
    );
    return result.rows[0];
  }

  // JOURNAL ENTRIES OPERATIONS

  static async getJournalEntries(tenantId: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<JournalEntry[]> {
    let sql = `
      SELECT je.*, 
        json_agg(
          json_build_object(
            'id', jel.id,
            'line_number', jel.line_number,
            'account_id', jel.account_id,
            'description', jel.description,
            'debit_amount', jel.debit_amount,
            'credit_amount', jel.credit_amount,
            'account_name', fa.account_name,
            'account_code', fa.account_code
          ) ORDER BY jel.line_number
        ) as lines
      FROM journal_entries je
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      LEFT JOIN financial_accounts fa ON jel.account_id = fa.id
      WHERE je.tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND je.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.dateFrom) {
      sql += ` AND je.entry_date >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters?.dateTo) {
      sql += ` AND je.entry_date <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    sql += ` GROUP BY je.id ORDER BY je.entry_date DESC, je.entry_number DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<any>(sql, params);
    return result.rows.map(row => ({
      ...row,
      lines: row.lines.filter((line: any) => line.id !== null)
    }));
  }

  static async createJournalEntry(tenantId: string, entryData: {
    description: string;
    entry_date: string;
    reference?: string;
    lines: Array<{
      account_id: string;
      description?: string;
      debit_amount: number;
      credit_amount: number;
    }>;
    created_by?: string;
  }): Promise<JournalEntry> {
    return await transaction(async (client) => {
      // Generate entry number
      const entryNumberResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_number
         FROM journal_entries WHERE tenant_id = $1`,
        [tenantId]
      );
      const entryNumber = `JE-${entryNumberResult.rows[0].next_number.toString().padStart(6, '0')}`;

      // Calculate totals
      const totalDebit = entryData.lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredit = entryData.lines.reduce((sum, line) => sum + line.credit_amount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Journal entry must balance: total debits must equal total credits');
      }

      // Create journal entry
      const entryResult = await client.query<JournalEntry>(
        `INSERT INTO journal_entries (
          tenant_id, entry_number, entry_date, reference, description,
          total_debit, total_credit, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [tenantId, entryNumber, entryData.entry_date, entryData.reference, 
         entryData.description, totalDebit, totalCredit, entryData.created_by]
      );

      const journalEntry = entryResult.rows[0];

      // Create journal entry lines
      for (let i = 0; i < entryData.lines.length; i++) {
        const line = entryData.lines[i];
        await client.query(
          `INSERT INTO journal_entry_lines (
            tenant_id, journal_entry_id, account_id, line_number,
            description, debit_amount, credit_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tenantId, journalEntry.id, line.account_id, i + 1,
           line.description, line.debit_amount, line.credit_amount]
        );
      }

      return journalEntry;
    });
  }

  static async postJournalEntry(tenantId: string, entryId: string, postedBy: string): Promise<JournalEntry> {
    return await transaction(async (client) => {
      // Update journal entry status
      const entryResult = await client.query<JournalEntry>(
        `UPDATE journal_entries 
         SET status = 'posted', posted_at = CURRENT_TIMESTAMP, posted_by = $3
         WHERE tenant_id = $1 AND id = $2 AND status = 'draft'
         RETURNING *`,
        [tenantId, entryId, postedBy]
      );

      if (entryResult.rows.length === 0) {
        throw new Error('Journal entry not found or already posted');
      }

      // Update account balances
      const lines = await client.query(
        `SELECT jel.*, fa.account_type 
         FROM journal_entry_lines jel
         JOIN financial_accounts fa ON jel.account_id = fa.id
         WHERE jel.journal_entry_id = $1`,
        [entryId]
      );

      for (const line of lines.rows) {
        const balanceChange = line.debit_amount - line.credit_amount;
        
        // For assets and expenses, debits increase balance
        // For liabilities, equity, and revenue, credits increase balance
        const multiplier = ['asset', 'expense'].includes(line.account_type) ? 1 : -1;
        const actualChange = balanceChange * multiplier;

        await client.query(
          `UPDATE financial_accounts 
           SET balance = balance + $3
           WHERE id = $1 AND tenant_id = $2`,
          [line.account_id, tenantId, actualChange]
        );
      }

      return entryResult.rows[0];
    });
  }

  // INVOICES OPERATIONS

  static async getInvoices(tenantId: string, filters?: {
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    let sql = `SELECT * FROM invoices WHERE tenant_id = $1`;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.customerId) {
      sql += ` AND customer_id = $${paramIndex}`;
      params.push(filters.customerId);
      paramIndex++;
    }

    if (filters?.dateFrom) {
      sql += ` AND invoice_date >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters?.dateTo) {
      sql += ` AND invoice_date <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    sql += ` ORDER BY invoice_date DESC, invoice_number DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Invoice>(sql, params);
    return result.rows;
  }

  static async createInvoice(tenantId: string, invoiceData: {
    customer_name: string;
    customer_email?: string;
    customer_id?: string;
    invoice_date: string;
    due_date: string;
    payment_terms?: string;
    notes?: string;
    lines: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      tax_rate?: number;
      account_id?: string;
    }>;
    created_by?: string;
  }): Promise<Invoice> {
    return await transaction(async (client) => {
      // Generate invoice number
      const invoiceNumberResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_number
         FROM invoices WHERE tenant_id = $1`,
        [tenantId]
      );
      const invoiceNumber = `INV-${invoiceNumberResult.rows[0].next_number.toString().padStart(6, '0')}`;

      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;

      for (const line of invoiceData.lines) {
        const lineTotal = line.quantity * line.unit_price;
        const lineTax = lineTotal * (line.tax_rate || 0) / 100;
        subtotal += lineTotal;
        taxAmount += lineTax;
      }

      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const invoiceResult = await client.query<Invoice>(
        `INSERT INTO invoices (
          tenant_id, invoice_number, customer_id, customer_name, customer_email,
          invoice_date, due_date, subtotal, tax_amount, total_amount,
          payment_terms, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [tenantId, invoiceNumber, invoiceData.customer_id, invoiceData.customer_name,
         invoiceData.customer_email, invoiceData.invoice_date, invoiceData.due_date,
         subtotal, taxAmount, totalAmount, invoiceData.payment_terms, 
         invoiceData.notes, invoiceData.created_by]
      );

      const invoice = invoiceResult.rows[0];

      // Create invoice lines
      for (let i = 0; i < invoiceData.lines.length; i++) {
        const line = invoiceData.lines[i];
        await client.query(
          `INSERT INTO invoice_lines (
            tenant_id, invoice_id, line_number, description, quantity,
            unit_price, tax_rate, account_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [tenantId, invoice.id, i + 1, line.description, line.quantity,
           line.unit_price, line.tax_rate || 0, line.account_id]
        );
      }

      return invoice;
    });
  }

  // FINANCIAL REPORTS

  static async generateTrialBalance(tenantId: string, asOfDate: string): Promise<any[]> {
    const result = await query(
      `SELECT 
        fa.account_code,
        fa.account_name,
        fa.account_type,
        fa.balance,
        CASE 
          WHEN fa.account_type IN ('asset', 'expense') AND fa.balance >= 0 THEN fa.balance
          WHEN fa.account_type IN ('liability', 'equity', 'revenue') AND fa.balance < 0 THEN ABS(fa.balance)
          ELSE 0
        END as debit_balance,
        CASE 
          WHEN fa.account_type IN ('liability', 'equity', 'revenue') AND fa.balance >= 0 THEN fa.balance
          WHEN fa.account_type IN ('asset', 'expense') AND fa.balance < 0 THEN ABS(fa.balance)
          ELSE 0
        END as credit_balance
      FROM financial_accounts fa
      WHERE fa.tenant_id = $1 AND fa.is_active = true
      ORDER BY fa.account_code`,
      [tenantId]
    );

    return result.rows;
  }

  static async generateIncomeStatement(tenantId: string, startDate: string, endDate: string): Promise<any> {
    const result = await query(
      `SELECT 
        fa.account_type,
        fa.account_name,
        fa.account_code,
        COALESCE(SUM(
          CASE 
            WHEN jel.credit_amount > 0 THEN jel.credit_amount
            ELSE -jel.debit_amount
          END
        ), 0) as amount
      FROM financial_accounts fa
      LEFT JOIN journal_entry_lines jel ON fa.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE fa.tenant_id = $1 
        AND fa.account_type IN ('revenue', 'expense')
        AND fa.is_active = true
        AND (je.entry_date BETWEEN $2 AND $3 OR je.entry_date IS NULL)
        AND (je.status = 'posted' OR je.status IS NULL)
      GROUP BY fa.account_type, fa.account_name, fa.account_code
      ORDER BY fa.account_type, fa.account_code`,
      [tenantId, startDate, endDate]
    );

    const revenues = result.rows.filter(row => row.account_type === 'revenue');
    const expenses = result.rows.filter(row => row.account_type === 'expense');
    
    const totalRevenue = revenues.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalExpenses = expenses.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      period: { startDate, endDate }
    };
  }

  static async generateBalanceSheet(tenantId: string, asOfDate: string): Promise<any> {
    const result = await query(
      `SELECT 
        fa.account_type,
        fa.account_subtype,
        fa.account_name,
        fa.account_code,
        fa.balance
      FROM financial_accounts fa
      WHERE fa.tenant_id = $1 
        AND fa.account_type IN ('asset', 'liability', 'equity')
        AND fa.is_active = true
      ORDER BY fa.account_type, fa.account_code`,
      [tenantId]
    );

    const assets = result.rows.filter(row => row.account_type === 'asset');
    const liabilities = result.rows.filter(row => row.account_type === 'liability');
    const equity = result.rows.filter(row => row.account_type === 'equity');
    
    const totalAssets = assets.reduce((sum, row) => sum + parseFloat(row.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, row) => sum + parseFloat(row.balance), 0);
    const totalEquity = equity.reduce((sum, row) => sum + parseFloat(row.balance), 0);

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      asOfDate
    };
  }
}
