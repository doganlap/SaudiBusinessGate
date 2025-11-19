import { query, transaction, PoolClient } from '../db/connection';

export interface AccountsReceivable {
  id: string;
  tenant_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  amount: number;
  paid_amount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  category?: string;
  description?: string;
  invoice_id?: string;
  journal_entry_id?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface AccountsReceivableFilters {
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'all';
  customerId?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AccountsReceivableService {
  /**
   * Get all accounts receivable (READ)
   */
  async getAccountsReceivable(
    tenantId: string,
    filters?: AccountsReceivableFilters
  ): Promise<AccountsReceivable[]> {
    let sql = `
      SELECT * FROM accounts_receivable 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status && filters.status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.customerId) {
      sql += ` AND customer_id = $${paramIndex}`;
      params.push(filters.customerId);
      paramIndex++;
    }

    if (filters?.category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.startDate) {
      sql += ` AND invoice_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND invoice_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    sql += ` ORDER BY due_date ASC, created_at DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<AccountsReceivable>(sql, params);
    return result.rows;
  }

  /**
   * Get a single accounts receivable by ID (READ)
   */
  async getAccountsReceivableById(
    tenantId: string,
    id: string
  ): Promise<AccountsReceivable | null> {
    const sql = `
      SELECT * FROM accounts_receivable 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query<AccountsReceivable>(sql, [id, tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new accounts receivable entry (CREATE)
   */
  async createAccountsReceivable(
    tenantId: string,
    data: Omit<AccountsReceivable, 'id' | 'tenant_id' | 'balance' | 'created_at' | 'updated_at'>
  ): Promise<AccountsReceivable> {
    // Check if invoice number already exists
    const checkSql = `SELECT id FROM accounts_receivable WHERE tenant_id = $1 AND invoice_number = $2`;
    const checkResult = await query(checkSql, [tenantId, data.invoice_number]);
    
    if (checkResult.rows.length > 0) {
      throw new Error('Invoice number already exists');
    }

    const sql = `
      INSERT INTO accounts_receivable (
        tenant_id, customer_id, customer_name, customer_email,
        invoice_number, invoice_date, due_date, amount,
        paid_amount, status, category, description, invoice_id, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const params = [
      tenantId,
      data.customer_id || null,
      data.customer_name,
      data.customer_email || null,
      data.invoice_number,
      data.invoice_date,
      data.due_date,
      data.amount,
      data.paid_amount || 0,
      data.status || 'pending',
      data.category || null,
      data.description || null,
      data.invoice_id || null,
      data.created_by || null
    ];

    const result = await query<AccountsReceivable>(sql, params);
    return result.rows[0];
  }

  /**
   * Update an accounts receivable entry (UPDATE)
   */
  async updateAccountsReceivable(
    tenantId: string,
    id: string,
    data: Partial<Omit<AccountsReceivable, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'balance'>>
  ): Promise<AccountsReceivable> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'balance') {
        updateFields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id, tenantId);

    const sql = `
      UPDATE accounts_receivable 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query<AccountsReceivable>(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Accounts receivable entry not found');
    }
    return result.rows[0];
  }

  /**
   * Record a payment against accounts receivable
   */
  async recordPayment(
    tenantId: string,
    id: string,
    paymentAmount: number
  ): Promise<AccountsReceivable> {
    return await transaction(async (client: PoolClient) => {
      // Get current entry
      const getSql = `SELECT * FROM accounts_receivable WHERE id = $1 AND tenant_id = $2 FOR UPDATE`;
      const getResult = await client.query<AccountsReceivable>(getSql, [id, tenantId]);
      
      if (getResult.rows.length === 0) {
        throw new Error('Accounts receivable entry not found');
      }

      const entry = getResult.rows[0];
      const newPaidAmount = parseFloat(entry.paid_amount.toString()) + paymentAmount;
      const newBalance = parseFloat(entry.amount.toString()) - newPaidAmount;
      
      let newStatus = entry.status;
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partial';
      }

      // Update entry
      const updateSql = `
        UPDATE accounts_receivable 
        SET paid_amount = $1, status = $2, updated_at = NOW()
        WHERE id = $3 AND tenant_id = $4
        RETURNING *
      `;
      
      const updateResult = await client.query<AccountsReceivable>(
        updateSql,
        [newPaidAmount, newStatus, id, tenantId]
      );

      return updateResult.rows[0];
    });
  }

  /**
   * Delete an accounts receivable entry (DELETE)
   */
  async deleteAccountsReceivable(
    tenantId: string,
    id: string
  ): Promise<boolean> {
    const sql = `
      DELETE FROM accounts_receivable 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query(sql, [id, tenantId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get accounts receivable summary
   */
  async getSummary(tenantId: string): Promise<{
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    overdueCount: number;
    overdueAmount: number;
  }> {
    const sql = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(balance), 0) as total_balance,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN balance ELSE 0 END), 0) as overdue_amount
      FROM accounts_receivable
      WHERE tenant_id = $1
    `;

    const result = await query<{
      total_amount: number;
      total_paid: number;
      total_balance: number;
      overdue_count: number;
      overdue_amount: number;
    }>(sql, [tenantId]);

    const row = result.rows[0];
    return {
      totalAmount: parseFloat(row.total_amount?.toString() || '0'),
      totalPaid: parseFloat(row.total_paid?.toString() || '0'),
      totalBalance: parseFloat(row.total_balance?.toString() || '0'),
      overdueCount: parseInt(row.overdue_count?.toString() || '0'),
      overdueAmount: parseFloat(row.overdue_amount?.toString() || '0')
    };
  }
}

export const accountsReceivableService = new AccountsReceivableService();

