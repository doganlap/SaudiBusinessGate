import { query, transaction, PoolClient } from '../db/connection';

export interface CashFlowStatement {
  id: string;
  tenant_id: string;
  statement_period: 'month' | 'quarter' | 'year';
  period_start: Date;
  period_end: Date;
  operating_income: number;
  operating_expenses: number;
  operating_net: number;
  investing_purchases: number;
  investing_sales: number;
  investing_net: number;
  financing_borrowings: number;
  financing_repayments: number;
  financing_dividends: number;
  financing_net: number;
  net_cash_flow: number;
  beginning_balance: number;
  ending_balance: number;
  status: 'draft' | 'final' | 'archived';
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface CashFlowFilters {
  period?: 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
  status?: 'draft' | 'final' | 'archived';
  limit?: number;
  offset?: number;
}

export class CashFlowService {
  /**
   * Get all cash flow statements (READ)
   */
  async getCashFlowStatements(
    tenantId: string,
    filters?: CashFlowFilters
  ): Promise<CashFlowStatement[]> {
    let sql = `
      SELECT * FROM cash_flow_statements 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.period) {
      sql += ` AND statement_period = $${paramIndex}`;
      params.push(filters.period);
      paramIndex++;
    }

    if (filters?.startDate) {
      sql += ` AND period_start >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      sql += ` AND period_end <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ` ORDER BY period_start DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<CashFlowStatement>(sql, params);
    return result.rows;
  }

  /**
   * Get a single cash flow statement by ID (READ)
   */
  async getCashFlowStatementById(
    tenantId: string,
    id: string
  ): Promise<CashFlowStatement | null> {
    const sql = `
      SELECT * FROM cash_flow_statements 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query<CashFlowStatement>(sql, [id, tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new cash flow statement (CREATE)
   */
  async createCashFlowStatement(
    tenantId: string,
    data: Omit<CashFlowStatement, 'id' | 'tenant_id' | 'operating_net' | 'investing_net' | 'financing_net' | 'net_cash_flow' | 'ending_balance' | 'created_at' | 'updated_at'>
  ): Promise<CashFlowStatement> {
    const sql = `
      INSERT INTO cash_flow_statements (
        tenant_id, statement_period, period_start, period_end,
        operating_income, operating_expenses,
        investing_purchases, investing_sales,
        financing_borrowings, financing_repayments, financing_dividends,
        beginning_balance, status, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const params = [
      tenantId,
      data.statement_period,
      data.period_start,
      data.period_end,
      data.operating_income || 0,
      data.operating_expenses || 0,
      data.investing_purchases || 0,
      data.investing_sales || 0,
      data.financing_borrowings || 0,
      data.financing_repayments || 0,
      data.financing_dividends || 0,
      data.beginning_balance || 0,
      data.status || 'draft',
      data.notes || null,
      data.created_by || null
    ];

    const result = await query<CashFlowStatement>(sql, params);
    return result.rows[0];
  }

  /**
   * Update a cash flow statement (UPDATE)
   */
  async updateCashFlowStatement(
    tenantId: string,
    id: string,
    data: Partial<Omit<CashFlowStatement, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'operating_net' | 'investing_net' | 'financing_net' | 'net_cash_flow' | 'ending_balance'>>
  ): Promise<CashFlowStatement> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && !['operating_net', 'investing_net', 'financing_net', 'net_cash_flow', 'ending_balance'].includes(key)) {
        updateFields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id, tenantId);

    const sql = `
      UPDATE cash_flow_statements 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query<CashFlowStatement>(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Cash flow statement not found');
    }
    return result.rows[0];
  }

  /**
   * Delete a cash flow statement (DELETE)
   */
  async deleteCashFlowStatement(
    tenantId: string,
    id: string
  ): Promise<boolean> {
    const sql = `
      DELETE FROM cash_flow_statements 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query(sql, [id, tenantId]);
    return result.rowCount > 0;
  }

  /**
   * Get cash flow summary for a period
   */
  async getCashFlowSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalOperating: number;
    totalInvesting: number;
    totalFinancing: number;
    netCashFlow: number;
  }> {
    const sql = `
      SELECT 
        COALESCE(SUM(operating_net), 0) as total_operating,
        COALESCE(SUM(investing_net), 0) as total_investing,
        COALESCE(SUM(financing_net), 0) as total_financing,
        COALESCE(SUM(net_cash_flow), 0) as net_cash_flow
      FROM cash_flow_statements
      WHERE tenant_id = $1 
        AND period_start >= $2 
        AND period_end <= $3
        AND status = 'final'
    `;

    const result = await query<{
      total_operating: number;
      total_investing: number;
      total_financing: number;
      net_cash_flow: number;
    }>(sql, [tenantId, startDate, endDate]);

    const row = result.rows[0];
    return {
      totalOperating: parseFloat(row.total_operating?.toString() || '0'),
      totalInvesting: parseFloat(row.total_investing?.toString() || '0'),
      totalFinancing: parseFloat(row.total_financing?.toString() || '0'),
      netCashFlow: parseFloat(row.net_cash_flow?.toString() || '0')
    };
  }
}

export const cashFlowService = new CashFlowService();

