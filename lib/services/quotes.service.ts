import { query } from '@/lib/db/connection';
import { Quote, QuoteItem, RFQ } from '@/types/sales';

export class QuotesService {
  // RFQ CRUD OPERATIONS

  static async getRfqs(tenantId: string, filters?: { status?: string; customer_id?: string; limit?: number; offset?: number }): Promise<RFQ[]> {
    let sql = 'SELECT * FROM sales_rfqs WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.customer_id) {
      sql += ` AND customer_id = $${paramIndex}`;
      params.push(filters.customer_id);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<RFQ>(sql, params);
    return result.rows;
  }

  static async createRfq(tenantId: string, rfqData: Omit<RFQ, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<RFQ> {
    const result = await query<RFQ>(
      `INSERT INTO sales_rfqs (tenant_id, customer_id, rfq_number, title, description, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, rfqData.customer_id, rfqData.rfq_number, rfqData.title, rfqData.description, rfqData.due_date, rfqData.status || 'new']
    );
    return result.rows[0];
  }

  static async getRfqById(tenantId: string, rfqId: string): Promise<RFQ | null> {
    const result = await query<RFQ>(
      'SELECT * FROM sales_rfqs WHERE tenant_id = $1 AND id = $2',
      [tenantId, rfqId]
    );
    return result.rows[0] || null;
  }

  static async updateRfq(tenantId: string, rfqId: string, rfqData: Partial<Omit<RFQ, 'id' | 'tenant_id' | 'created_at'>>): Promise<RFQ | null> {
    const fields = Object.keys(rfqData);
    const values = Object.values(rfqData);
    
    if (fields.length === 0) {
      return null;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const result = await query<RFQ>(
      `UPDATE sales_rfqs SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, rfqId, ...values]
    );
    return result.rows[0] || null;
  }

  static async deleteRfq(tenantId: string, rfqId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sales_rfqs WHERE tenant_id = $1 AND id = $2',
      [tenantId, rfqId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // QUOTE CRUD OPERATIONS

  static async getQuotes(tenantId: string, filters?: { status?: string; customer_id?: string; limit?: number; offset?: number }): Promise<Quote[]> {
    let sql = 'SELECT * FROM sales_quotes WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.customer_id) {
      sql += ` AND customer_id = $${paramIndex}`;
      params.push(filters.customer_id);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Quote>(sql, params);
    return result.rows;
  }

  static async createQuote(tenantId: string, quoteData: Omit<Quote, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Quote> {
    const result = await query<Quote>(
      `INSERT INTO sales_quotes (tenant_id, deal_id, customer_id, quote_number, status, total_amount, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, quoteData.deal_id, quoteData.customer_id, quoteData.quote_number, quoteData.status || 'draft', quoteData.total_amount, quoteData.valid_until]
    );
    return result.rows[0];
  }

  static async getQuoteById(tenantId: string, quoteId: string): Promise<Quote | null> {
    const result = await query<Quote>(
      'SELECT * FROM sales_quotes WHERE tenant_id = $1 AND id = $2',
      [tenantId, quoteId]
    );
    return result.rows[0] || null;
  }

  static async updateQuote(tenantId: string, quoteId: string, quoteData: Partial<Omit<Quote, 'id' | 'tenant_id' | 'created_at'>>): Promise<Quote | null> {
    const fields = Object.keys(quoteData);
    const values = Object.values(quoteData);
    
    if (fields.length === 0) {
      return null;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const result = await query<Quote>(
      `UPDATE sales_quotes SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, quoteId, ...values]
    );
    return result.rows[0] || null;
  }

  static async deleteQuote(tenantId: string, quoteId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sales_quotes WHERE tenant_id = $1 AND id = $2',
      [tenantId, quoteId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}