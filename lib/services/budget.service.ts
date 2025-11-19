import { query, transaction, PoolClient } from '../db/connection';

export interface Budget {
  id: string;
  tenant_id: string;
  budget_name: string;
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  fiscal_year: number;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_budgeted: number;
  total_actual: number;
  variance: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
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
}

export interface BudgetFilters {
  period?: 'monthly' | 'quarterly' | 'yearly';
  fiscalYear?: number;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  category?: string;
  limit?: number;
  offset?: number;
}

export class BudgetService {
  /**
   * Get all budgets (READ)
   */
  async getBudgets(
    tenantId: string,
    filters?: BudgetFilters
  ): Promise<Budget[]> {
    let sql = `
      SELECT * FROM budgets 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.period) {
      sql += ` AND budget_period = $${paramIndex}`;
      params.push(filters.period);
      paramIndex++;
    }

    if (filters?.fiscalYear) {
      sql += ` AND fiscal_year = $${paramIndex}`;
      params.push(filters.fiscalYear);
      paramIndex++;
    }

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ` ORDER BY fiscal_year DESC, start_date DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Budget>(sql, params);
    return result.rows;
  }

  /**
   * Get a single budget by ID (READ)
   */
  async getBudgetById(
    tenantId: string,
    id: string
  ): Promise<Budget | null> {
    const sql = `
      SELECT * FROM budgets 
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await query<Budget>(sql, [id, tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Get budget lines for a budget (READ)
   */
  async getBudgetLines(
    tenantId: string,
    budgetId: string
  ): Promise<BudgetLine[]> {
    const sql = `
      SELECT bl.*, fa.account_name, fa.account_code, fa.account_type
      FROM budget_lines bl
      JOIN financial_accounts fa ON bl.account_id = fa.id
      WHERE bl.tenant_id = $1 AND bl.budget_id = $2
      ORDER BY fa.account_code
    `;
    const result = await query<BudgetLine>(sql, [tenantId, budgetId]);
    return result.rows;
  }

  /**
   * Create a new budget (CREATE)
   */
  async createBudget(
    tenantId: string,
    data: Omit<Budget, 'id' | 'tenant_id' | 'total_actual' | 'variance' | 'created_at' | 'updated_at'>
  ): Promise<Budget> {
    const sql = `
      INSERT INTO budgets (
        tenant_id, budget_name, budget_period, fiscal_year,
        start_date, end_date, status, total_budgeted, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      tenantId,
      data.budget_name,
      data.budget_period,
      data.fiscal_year,
      data.start_date,
      data.end_date,
      data.status || 'draft',
      data.total_budgeted || 0,
      data.notes || null,
      data.created_by || null
    ];

    const result = await query<Budget>(sql, params);
    return result.rows[0];
  }

  /**
   * Create a budget line (CREATE)
   */
  async createBudgetLine(
    tenantId: string,
    budgetId: string,
    data: Omit<BudgetLine, 'id' | 'tenant_id' | 'budget_id' | 'actual_amount' | 'variance'>
  ): Promise<BudgetLine> {
    return await transaction(async (client: PoolClient) => {
      // Insert budget line
      const insertSql = `
        INSERT INTO budget_lines (
          tenant_id, budget_id, account_id, budgeted_amount, notes
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const insertResult = await client.query<BudgetLine>(
        insertSql,
        [tenantId, budgetId, data.account_id, data.budgeted_amount, data.notes || null]
      );

      // Update budget total
      const updateBudgetSql = `
        UPDATE budgets 
        SET total_budgeted = (
          SELECT COALESCE(SUM(budgeted_amount), 0) 
          FROM budget_lines 
          WHERE budget_id = $1 AND tenant_id = $2
        ),
        updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `;

      await client.query(updateBudgetSql, [budgetId, tenantId]);

      return insertResult.rows[0];
    });
  }

  /**
   * Update a budget (UPDATE)
   */
  async updateBudget(
    tenantId: string,
    id: string,
    data: Partial<Omit<Budget, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'variance'>>
  ): Promise<Budget> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'variance') {
        updateFields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id, tenantId);

    const sql = `
      UPDATE budgets 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query<Budget>(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Budget not found');
    }
    return result.rows[0];
  }

  /**
   * Update a budget line (UPDATE)
   */
  async updateBudgetLine(
    tenantId: string,
    budgetId: string,
    lineId: string,
    data: Partial<Omit<BudgetLine, 'id' | 'tenant_id' | 'budget_id' | 'variance'>>
  ): Promise<BudgetLine> {
    return await transaction(async (client: PoolClient) => {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'variance') {
          updateFields.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(lineId, budgetId, tenantId);

      const sql = `
        UPDATE budget_lines 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND budget_id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await client.query<BudgetLine>(sql, params);
      if (result.rows.length === 0) {
        throw new Error('Budget line not found');
      }

      // Update budget totals
      const updateBudgetSql = `
        UPDATE budgets 
        SET 
          total_budgeted = (
            SELECT COALESCE(SUM(budgeted_amount), 0) 
            FROM budget_lines 
            WHERE budget_id = $1 AND tenant_id = $2
          ),
          total_actual = (
            SELECT COALESCE(SUM(actual_amount), 0) 
            FROM budget_lines 
            WHERE budget_id = $1 AND tenant_id = $2
          ),
          updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `;

      await client.query(updateBudgetSql, [budgetId, tenantId]);

      return result.rows[0];
    });
  }

  /**
   * Delete a budget (DELETE)
   */
  async deleteBudget(
    tenantId: string,
    id: string
  ): Promise<boolean> {
    return await transaction(async (client: PoolClient) => {
      // Delete budget lines first (cascade should handle this, but being explicit)
      await client.query(
        `DELETE FROM budget_lines WHERE budget_id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      // Delete budget
      const result = await client.query(
        `DELETE FROM budgets WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      return (result.rowCount || 0) > 0;
    });
  }

  /**
   * Delete a budget line (DELETE)
   */
  async deleteBudgetLine(
    tenantId: string,
    budgetId: string,
    lineId: string
  ): Promise<boolean> {
    return await transaction(async (client: PoolClient) => {
      const result = await client.query(
        `DELETE FROM budget_lines WHERE id = $1 AND budget_id = $2 AND tenant_id = $3`,
        [lineId, budgetId, tenantId]
      );

      if ((result.rowCount || 0) > 0) {
        // Update budget totals
        await client.query(
          `UPDATE budgets 
           SET 
             total_budgeted = (SELECT COALESCE(SUM(budgeted_amount), 0) FROM budget_lines WHERE budget_id = $1 AND tenant_id = $2),
             total_actual = (SELECT COALESCE(SUM(actual_amount), 0) FROM budget_lines WHERE budget_id = $1 AND tenant_id = $2),
             updated_at = NOW()
           WHERE id = $1 AND tenant_id = $2`,
          [budgetId, tenantId]
        );
      }

      return (result.rowCount || 0) > 0;
    });
  }

  /**
   * Get budget summary
   */
  async getSummary(tenantId: string): Promise<{
    totalBudgeted: number;
    totalActual: number;
    totalVariance: number;
    activeBudgets: number;
  }> {
    const sql = `
      SELECT 
        COALESCE(SUM(total_budgeted), 0) as total_budgeted,
        COALESCE(SUM(total_actual), 0) as total_actual,
        COALESCE(SUM(variance), 0) as total_variance,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_budgets
      FROM budgets
      WHERE tenant_id = $1
    `;

    const result = await query<{
      total_budgeted: number;
      total_actual: number;
      total_variance: number;
      active_budgets: number;
    }>(sql, [tenantId]);

    const row = result.rows[0];
    return {
      totalBudgeted: parseFloat(row.total_budgeted?.toString() || '0'),
      totalActual: parseFloat(row.total_actual?.toString() || '0'),
      totalVariance: parseFloat(row.total_variance?.toString() || '0'),
      activeBudgets: parseInt(row.active_budgets?.toString() || '0')
    };
  }
}

export const budgetService = new BudgetService();

