import { query, transaction, PoolClient } from '../db/connection';

export interface AccountsPayable {
  id: string;
  tenant_id: string;
  vendor_id?: string;
  vendor_name: string;
  vendor_email?: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  amount: number;
  paid_amount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  category?: string;
  description?: string;
  bill_id?: string;
  journal_entry_id?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface AccountsPayableFilters {
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'all';
  vendorId?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AccountsPayableService {
  /**
   * Get all accounts payable (READ)
   */
  async getAccountsPayable(
    tenantId: string,
    filters?: AccountsPayableFilters
  ): Promise<AccountsPayable[]> {
    let sql = `
      SELECT * FROM accounts_payable 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status && filters.status !== 'all') {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.vendorId) {
      sql += ` AND vendor_id = $${paramIndex}`;
      params.push(filters.vendorId);
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

    const result = await query<AccountsPayable>(sql, params);
    return result.rows;
  }

  /**
   * Get a single accounts payable by ID (READ)
   */
  async getAccountsPayableById(
    tenantId: string,
    id: string
  ): Promise<AccountsPayable | null> {
    const sql = `
      SELECT * FROM accounts_payable 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query<AccountsPayable>(sql, [id, tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new accounts payable entry (CREATE)
   */
  async createAccountsPayable(
    tenantId: string,
    data: Omit<AccountsPayable, 'id' | 'tenant_id' | 'balance' | 'created_at' | 'updated_at'>
  ): Promise<AccountsPayable> {
    // Check if invoice number already exists
    const checkSql = `SELECT id FROM accounts_payable WHERE tenant_id = $1 AND invoice_number = $2`;
    const checkResult = await query(checkSql, [tenantId, data.invoice_number]);
    
    if (checkResult.rows.length > 0) {
      throw new Error('Invoice number already exists');
    }

    const sql = `
      INSERT INTO accounts_payable (
        tenant_id, vendor_id, vendor_name, vendor_email,
        invoice_number, invoice_date, due_date, amount,
        paid_amount, status, category, description, bill_id, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const params = [
      tenantId,
      data.vendor_id || null,
      data.vendor_name,
      data.vendor_email || null,
      data.invoice_number,
      data.invoice_date,
      data.due_date,
      data.amount,
      data.paid_amount || 0,
      data.status || 'pending',
      data.category || null,
      data.description || null,
      data.bill_id || null,
      data.created_by || null
    ];

    const result = await query<AccountsPayable>(sql, params);
    return result.rows[0];
  }

  /**
   * Update an accounts payable entry (UPDATE)
   */
  async updateAccountsPayable(
    tenantId: string,
    id: string,
    data: Partial<Omit<AccountsPayable, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'balance'>>
  ): Promise<AccountsPayable> {
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
      UPDATE accounts_payable 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query<AccountsPayable>(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Accounts payable entry not found');
    }
    return result.rows[0];
  }

  /**
   * Record a payment against accounts payable
   */
  async recordPayment(
    tenantId: string,
    id: string,
    paymentAmount: number
  ): Promise<AccountsPayable> {
    return await transaction(async (client: PoolClient) => {
      // Get current entry
      const getSql = `SELECT * FROM accounts_payable WHERE id = $1 AND tenant_id = $2 FOR UPDATE`;
      const getResult = await client.query<AccountsPayable>(getSql, [id, tenantId]);
      
      if (getResult.rows.length === 0) {
        throw new Error('Accounts payable entry not found');
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
        UPDATE accounts_payable 
        SET paid_amount = $1, status = $2, updated_at = NOW()
        WHERE id = $3 AND tenant_id = $4
        RETURNING *
      `;
      
      const updateResult = await client.query<AccountsPayable>(
        updateSql,
        [newPaidAmount, newStatus, id, tenantId]
      );

      return updateResult.rows[0];
    });
  }

  /**
   * Delete an accounts payable entry (DELETE)
   */
  async deleteAccountsPayable(
    tenantId: string,
    id: string
  ): Promise<boolean> {
    const sql = `
      DELETE FROM accounts_payable 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query(sql, [id, tenantId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get accounts payable summary
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
      FROM accounts_payable
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

export const accountsPayableService = new AccountsPayableService();

