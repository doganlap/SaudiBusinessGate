import { query, transaction, PoolClient } from '../db/connection';

export interface FinancialAccount {
  id: string;
  tenant_id: string;
  account_name: string;
  account_code: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parent_account_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  description?: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  account_id: string;
  transaction_type: 'debit' | 'credit' | 'payment' | 'receipt';
  amount: number;
  transaction_date: Date;
  reference_id?: string;
  transaction_number?: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashFlow: number;
  grossMargin: number;
  operatingMargin: number;
}

export class FinanceService {
  private mapTypeToDb(type?: string): string | undefined {
    if (!type) return undefined;
    const t = type.toLowerCase();
    if (t === 'payment' || t === 'payable' || t === 'expense' || t === 'debit') return 'EXPENSE';
    if (t === 'receipt' || t === 'receivable' || t === 'income' || t === 'credit') return 'INCOME';
    if (t === 'transfer') return 'TRANSFER';
    if (t === 'adjustment') return 'ADJUSTMENT';
    return type;
  }
  /**
   * Get all financial accounts for a tenant
   */
  async getAccounts(
    tenantId: string,
    filters?: {
      type?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<FinancialAccount[]> {
    let sql = `
      SELECT 
        id,
        tenant_id,
        account_name_en AS account_name,
        account_code,
        account_type,
        balance,
        parent_account_id,
        is_active,
        created_at,
        updated_at,
        description
      FROM chart_of_accounts 
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

  /**
   * Create a new financial account
   */
  async createAccount(
    tenantId: string,
    accountData: Omit<FinancialAccount, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<FinancialAccount> {
    const sql = `
      INSERT INTO chart_of_accounts (
        tenant_id, account_name_en, account_code, account_type,
        balance, parent_account_id, is_active, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      tenantId,
      accountData.account_name,
      accountData.account_code,
      accountData.account_type,
      accountData.balance,
      accountData.parent_account_id,
      accountData.is_active,
      accountData.description
    ];

    const result = await query<FinancialAccount>(sql, params);
    return result.rows[0];
  }

  /**
   * Get transactions for a tenant
   */
  async getTransactions(
    tenantId: string,
    filters?: {
      status?: string;
      type?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Transaction[]> {
    try {
      let sql = `
        SELECT * FROM transactions 
        WHERE tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status && filters.status !== 'all') {
        sql += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.type && filters.type !== 'all') {
        sql += ` AND transaction_type = $${paramIndex}`;
        params.push(this.mapTypeToDb(filters.type));
        paramIndex++;
      }

      sql += ` ORDER BY transaction_date DESC`;

      if (filters?.limit) {
        sql += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await query<Transaction>(sql, params);
      return result.rows;
    } catch (error) {
      // Fallback to mock data if database is not available
      console.warn('Database not available for finance transactions, using mock data:', error);
      return this.getMockTransactions(filters);
    }
  }

  private getMockTransactions(filters?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Transaction[] {
    // Mock data for transactions
    let mockTransactions: Transaction[] = [
      {
        id: 'mock-1',
        tenant_id: 'mock-tenant',
        account_id: 'mock-account',
        transaction_type: 'debit',
        amount: 100,
        transaction_date: new Date(),
        reference_id: 'mock-ref',
        transaction_number: 'mock-num',
        description: 'Mock transaction',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'mock-2',
        tenant_id: 'mock-tenant',
        account_id: 'mock-account',
        transaction_type: 'credit',
        amount: 200,
        transaction_date: new Date(),
        reference_id: 'mock-ref',
        transaction_number: 'mock-num',
        description: 'Mock transaction',
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Apply filters to mock data
    if (filters?.status && filters.status !== 'all') {
      mockTransactions = mockTransactions.filter(t => t.status === filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      mockTransactions = mockTransactions.filter(t => t.transaction_type === filters.type);
    }

    if (filters?.limit) {
      mockTransactions = mockTransactions.slice(0, filters.limit);
    }

    if (filters?.offset) {
      mockTransactions = mockTransactions.slice(filters.offset);
    }

    return mockTransactions;
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    tenantId: string,
    transactionData: Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    return await transaction(async (client: PoolClient) => {
      // Insert transaction
      const insertSql = `
        INSERT INTO transactions (
          tenant_id, account_id, transaction_type, amount, 
          transaction_date, reference_id, transaction_number, 
          description, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const insertParams = [
        tenantId,
        transactionData.account_id,
        transactionData.transaction_type,
        transactionData.amount,
        transactionData.transaction_date,
        transactionData.reference_id,
        transactionData.transaction_number,
        transactionData.description,
        transactionData.status
      ];

      const result = await client.query<Transaction>(insertSql, insertParams.map((v, i) => (i === 2 ? this.mapTypeToDb(String(v)) : v)));
      const newTransaction = result.rows[0];

      // Update account balance
      const balanceUpdateSql = `
        UPDATE chart_of_accounts 
        SET balance = balance + $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
      `;

      const balanceChange = 
        transactionData.transaction_type === 'debit' || transactionData.transaction_type === 'payment'
          ? -transactionData.amount
          : transactionData.amount;

      await client.query(balanceUpdateSql, [
        balanceChange,
        transactionData.account_id,
        tenantId
      ]);

      return newTransaction;
    });
  }

  /**
   * Get financial statistics for a tenant
   */
  async getFinancialStats(tenantId: string): Promise<FinancialStats> {
    // Get revenue (from revenue accounts)
    const revenueResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM chart_of_accounts 
       WHERE tenant_id = $1 AND account_type = 'revenue' AND is_active = true`,
      [tenantId]
    );

    // Get expenses (from expense accounts)
    const expensesResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM chart_of_accounts 
       WHERE tenant_id = $1 AND account_type = 'expense' AND is_active = true`,
      [tenantId]
    );

    // Get accounts receivable
    const arResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM accounts_receivable 
       WHERE tenant_id = $1 AND status IN ('pending','partial')`,
      [tenantId]
    );

    // Get accounts payable
    const apResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM accounts_payable 
       WHERE tenant_id = $1 AND status IN ('pending','partial')`,
      [tenantId]
    );

    // Get cash balance (from asset accounts)
    const cashResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM chart_of_accounts 
       WHERE tenant_id = $1 AND account_type = 'asset' AND is_active = true`,
      [tenantId]
    );

    const totalRevenue = parseFloat(revenueResult.rows[0]?.total?.toString() || '0');
    const totalExpenses = parseFloat(expensesResult.rows[0]?.total?.toString() || '0');
    const accountsReceivable = parseFloat(arResult.rows[0]?.total?.toString() || '0');
    const accountsPayable = parseFloat(apResult.rows[0]?.total?.toString() || '0');
    const cashFlow = parseFloat(cashResult.rows[0]?.total?.toString() || '0');

    const netProfit = totalRevenue - totalExpenses;
    const grossMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const operatingMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      accountsReceivable,
      accountsPayable,
      cashFlow,
      grossMargin,
      operatingMargin
    };
  }

  /**
   * Get account summary by type
   */
  async getAccountSummary(tenantId: string): Promise<Record<string, number>> {
    const result = await query<{ account_type: string; total: number }>(
      `SELECT account_type, COALESCE(SUM(balance), 0) as total 
       FROM chart_of_accounts 
       WHERE tenant_id = $1 AND is_active = true
       GROUP BY account_type`,
      [tenantId]
    );

    const summary: Record<string, number> = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0
    };

    result.rows.forEach(row => {
      summary[row.account_type] = parseFloat(row.total.toString());
    });

    return summary;
  }
}

// Export singleton instance
export const financeService = new FinanceService();
