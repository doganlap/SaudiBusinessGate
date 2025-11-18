import { query } from '@/lib/db/connection';
import { Proposal, ProposalSection, ProposalTemplate } from '@/types/sales';

export class ProposalsService {
  static async getProposals(tenantId: string, filters?: { status?: string; deal_id?: number; limit?: number; offset?: number }): Promise<Proposal[]> {
    let sql = 'SELECT * FROM sales_proposals WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.deal_id) {
      sql += ` AND deal_id = $${paramIndex}`;
      params.push(filters.deal_id);
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

    const result = await query<Proposal>(sql, params);
    return result.rows;
  }

  static async createProposal(tenantId: string, proposalData: Omit<Proposal, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Proposal> {
    const result = await query<Proposal>(
      `INSERT INTO sales_proposals (tenant_id, quote_id, deal_id, lead_id, title, content, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, proposalData.quote_id, proposalData.deal_id, proposalData.lead_id, proposalData.title, proposalData.content, proposalData.status || 'draft']
    );
    return result.rows[0];
  }

  static async getProposalById(tenantId: string, proposalId: string): Promise<Proposal | null> {
    const result = await query<Proposal>(
      'SELECT * FROM sales_proposals WHERE tenant_id = $1 AND id = $2',
      [tenantId, proposalId]
    );
    return result.rows[0] || null;
  }

  static async updateProposal(tenantId: string, proposalId: string, proposalData: Partial<Omit<Proposal, 'id' | 'tenant_id' | 'created_at'>>): Promise<Proposal | null> {
    const fields = Object.keys(proposalData);
    const values = Object.values(proposalData);
    
    if (fields.length === 0) {
      return null;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const result = await query<Proposal>(
      `UPDATE sales_proposals SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, proposalId, ...values]
    );
    return result.rows[0] || null;
  }

  static async deleteProposal(tenantId: string, proposalId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sales_proposals WHERE tenant_id = $1 AND id = $2',
      [tenantId, proposalId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}