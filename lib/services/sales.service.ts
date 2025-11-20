import { query, transaction, PoolClient } from '@/lib/db/connection';

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: string;
  score: number;
  estimated_value: number;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  lead_id?: string;
  title: string;
  description?: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  order_index: number;
  probability_default: number;
  is_active: boolean;
  created_at: string;
}

export class SalesService {
  // LEADS CRUD OPERATIONS
  
  static async getLeads(tenantId: string, filters?: {
    status?: string;
    source?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Lead[]> {
    try {
      let sql = 'SELECT * FROM sales_leads WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.source) {
        sql += ` AND source = $${paramIndex}`;
        params.push(filters.source);
        paramIndex++;
      }

      if (filters?.assigned_to) {
        sql += ` AND assigned_to = $${paramIndex}`;
        params.push(filters.assigned_to);
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

      const result = await query<Lead>(sql, params);
      return result.rows;
    } catch (error) {
      // Fallback to mock data if database is not available
      console.warn('Database not available for sales leads, using mock data:', error);
      return this.getMockLeads(filters);
    }
  }

  static async getLeadById(tenantId: string, leadId: string): Promise<Lead | null> {
    const result = await query<Lead>(
      'SELECT * FROM sales_leads WHERE tenant_id = $1 AND id = $2',
      [tenantId, leadId]
    );
    return result.rows[0] || null;
  }

  static async createLead(tenantId: string, leadData: Omit<Lead, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const result = await query<Lead>(
      `INSERT INTO sales_leads (
        tenant_id, name, email, phone, company, position, source, status, 
        score, estimated_value, assigned_to, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        tenantId, leadData.name, leadData.email, leadData.phone, leadData.company,
        leadData.position, leadData.source, leadData.status, leadData.score,
        leadData.estimated_value, leadData.assigned_to, leadData.notes
      ]
    );
    return result.rows[0];
  }

  static async updateLead(tenantId: string, leadId: string, updates: Partial<Lead>): Promise<Lead | null> {
    const setClause = [];
    const params: any[] = [tenantId, leadId];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'tenant_id' && key !== 'created_at' && key !== 'updated_at') {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) return null;

    const sql = `
      UPDATE sales_leads 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await query<Lead>(sql, params);
    return result.rows[0] || null;
  }

  static async deleteLead(tenantId: string, leadId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sales_leads WHERE tenant_id = $1 AND id = $2',
      [tenantId, leadId]
    );
    return (result.rowCount || 0) > 0;
  }

  // DEALS CRUD OPERATIONS

  static async getDeals(tenantId: string, filters?: {
    stage?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Deal[]> {
    let sql = 'SELECT * FROM sales_deals WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.stage) {
      sql += ` AND stage = $${paramIndex}`;
      params.push(filters.stage);
      paramIndex++;
    }

    if (filters?.assigned_to) {
      sql += ` AND assigned_to = $${paramIndex}`;
      params.push(filters.assigned_to);
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

    const result = await query<Deal>(sql, params);
    return result.rows;
  }

  static async createDeal(tenantId: string, dealData: Omit<Deal, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    const result = await query<Deal>(
      `INSERT INTO sales_deals (
        tenant_id, lead_id, title, description, value, probability, stage,
        expected_close_date, assigned_to, customer_name, customer_email, customer_company, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        tenantId, dealData.lead_id, dealData.title, dealData.description, dealData.value,
        dealData.probability, dealData.stage, dealData.expected_close_date, dealData.assigned_to,
        dealData.customer_name, dealData.customer_email, dealData.customer_company, dealData.notes
      ]
    );
    return result.rows[0];
  }

  static async updateDeal(tenantId: string, dealId: string, updates: Partial<Deal>): Promise<Deal | null> {
    const setClause = [];
    const params: any[] = [tenantId, dealId];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'tenant_id' && key !== 'created_at' && key !== 'updated_at') {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) return null;

    const sql = `
      UPDATE sales_deals 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await query<Deal>(sql, params);
    return result.rows[0] || null;
  }

  // PIPELINE OPERATIONS

  static async getPipelineStages(tenantId: string): Promise<PipelineStage[]> {
    const result = await query<PipelineStage>(
      'SELECT * FROM sales_pipeline_stages WHERE tenant_id = $1 AND is_active = true ORDER BY order_index',
      [tenantId]
    );
    return result.rows;
  }

  static async getPipelineData(tenantId: string): Promise<any> {
    const stages = await this.getPipelineStages(tenantId);
    const deals = await this.getDeals(tenantId);

    const pipelineData = stages.map(stage => {
      const stageDeals = deals.filter(deal => deal.stage === stage.name);
      const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
      
      return {
        ...stage,
        deals: stageDeals,
        deal_count: stageDeals.length,
        total_value: totalValue
      };
    });

    return {
      stages: pipelineData,
      summary: {
        total_deals: deals.length,
        total_value: deals.reduce((sum, deal) => sum + deal.value, 0),
        avg_deal_size: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0
      }
    };
  }

  // ANALYTICS AND REPORTING

  static async getLeadsSummary(tenantId: string): Promise<any> {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_leads,
          COUNT(CASE WHEN status IN ('qualified', 'proposal', 'negotiation') THEN 1 END) as qualified_leads,
          SUM(estimated_value) as total_value,
          AVG(score) as avg_score
        FROM sales_leads 
        WHERE tenant_id = $1`,
        [tenantId]
      );

      return result.rows[0];
    } catch (error) {
      // Fallback to mock data
      console.warn('Database not available for leads summary, using mock data:', error);
      const mockLeads = await this.getMockLeads();
      return {
        total_leads: mockLeads.length,
        qualified_leads: mockLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length,
        total_value: mockLeads.reduce((sum, lead) => sum + lead.estimated_value, 0),
        avg_score: mockLeads.reduce((sum, lead) => sum + lead.score, 0) / mockLeads.length
      };
    }
  }

  static async getDealsSummary(tenantId: string): Promise<any> {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_deals,
          COUNT(CASE WHEN stage = 'closed-won' THEN 1 END) as won_deals,
          COUNT(CASE WHEN stage = 'closed-lost' THEN 1 END) as lost_deals,
          SUM(value) as total_value,
          SUM(CASE WHEN stage = 'closed-won' THEN value ELSE 0 END) as won_value,
          AVG(probability) as avg_probability
        FROM sales_deals 
        WHERE tenant_id = $1`,
        [tenantId]
      );

      return result.rows[0];
    } catch (error) {
      console.warn('Database not available for deals summary, using mock data:', error);
      return {
        total_deals: 0,
        won_deals: 0,
        lost_deals: 0,
        total_value: 0,
        won_value: 0,
        avg_probability: 0
      };
    }
  }

  // ADVANCED ANALYTICS METHODS

  static async getSalesAnalytics(tenantId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    try {
      let dealsWhereClause = 'WHERE d.tenant_id = $1';
      let leadsWhereClause = 'WHERE l.tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.dateFrom) {
        dealsWhereClause += ` AND d.created_at >= $${paramIndex}`;
        leadsWhereClause += ` AND l.created_at >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        dealsWhereClause += ` AND d.created_at <= $${paramIndex}`;
        leadsWhereClause += ` AND l.created_at <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      // Monthly revenue trend
      const monthlyTrend = await query(
        `SELECT 
          TO_CHAR(d.created_at, 'YYYY-MM') as month,
          COUNT(*) as deal_count,
          COALESCE(SUM(CASE WHEN d.stage = 'closed-won' THEN d.value ELSE 0 END), 0) as revenue
        FROM sales_deals d
        ${dealsWhereClause}
        GROUP BY TO_CHAR(d.created_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12`,
        params
      );

      // Revenue by source
      const sourceRevenue = await query(
        `SELECT 
          COALESCE(l.source, 'unknown') as source,
          COUNT(DISTINCT d.id) as deal_count,
          COALESCE(SUM(CASE WHEN d.stage = 'closed-won' THEN d.value ELSE 0 END), 0) as revenue,
          AVG(CASE WHEN d.stage = 'closed-won' THEN d.value ELSE NULL END) as avg_deal_value
        FROM sales_deals d
        LEFT JOIN sales_leads l ON d.lead_id = l.id
        ${dealsWhereClause}
        GROUP BY l.source
        ORDER BY revenue DESC`,
        params
      );

      // Stage distribution
      const stageDistribution = await query(
        `SELECT 
          d.stage,
          COUNT(*) as count,
          COALESCE(SUM(d.value), 0) as total_value,
          AVG(d.probability) as avg_probability
        FROM sales_deals d
        ${dealsWhereClause}
        GROUP BY d.stage
        ORDER BY count DESC`,
        params
      );

      // Top performers
      const topPerformers = await query(
        `SELECT 
          d.assigned_to,
          COUNT(*) as deal_count,
          COUNT(CASE WHEN d.stage = 'closed-won' THEN 1 END) as won_count,
          COALESCE(SUM(CASE WHEN d.stage = 'closed-won' THEN d.value ELSE 0 END), 0) as revenue,
          AVG(CASE WHEN d.stage = 'closed-won' THEN d.probability ELSE NULL END) as avg_win_rate
        FROM sales_deals d
        ${dealsWhereClause}
          AND d.assigned_to IS NOT NULL
        GROUP BY d.assigned_to
        ORDER BY revenue DESC
        LIMIT 10`,
        params
      );

      // Lead conversion funnel
      const conversionFunnel = await query(
        `SELECT 
          l.status,
          COUNT(*) as count,
          AVG(l.score) as avg_score,
          SUM(l.estimated_value) as total_value
        FROM sales_leads l
        ${leadsWhereClause}
        GROUP BY l.status
        ORDER BY 
          CASE l.status
            WHEN 'new' THEN 1
            WHEN 'contacted' THEN 2
            WHEN 'qualified' THEN 3
            WHEN 'proposal' THEN 4
            WHEN 'negotiation' THEN 5
            WHEN 'converted' THEN 6
            ELSE 7
          END`,
        params
      );

      return {
        monthlyTrend: monthlyTrend.rows,
        sourceRevenue: sourceRevenue.rows,
        stageDistribution: stageDistribution.rows,
        topPerformers: topPerformers.rows,
        conversionFunnel: conversionFunnel.rows,
      };
    } catch (error) {
      console.warn('Database not available for sales analytics, using mock data:', error);
      // Return mock analytics data
      return {
        monthlyTrend: [],
        sourceRevenue: [],
        stageDistribution: [],
        topPerformers: [],
        conversionFunnel: [],
      };
    }
  }

  // MOCK DATA FALLBACK METHODS

  private static getMockLeads(filters?: any): Lead[] {
    const mockLeads: Lead[] = [
      {
        id: 'lead-1',
        tenant_id: 'default',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        company: 'شركة الأمل',
        position: 'مدير المبيعات',
        source: 'website',
        status: 'qualified',
        score: 85,
        estimated_value: 50000,
        assigned_to: 'sales-rep-1',
        notes: 'عميل مهتم بالمنتج',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'lead-2',
        tenant_id: 'default',
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '+966507654321',
        company: 'شركة النور',
        position: 'مديرة المشتريات',
        source: 'referral',
        status: 'contacted',
        score: 70,
        estimated_value: 75000,
        assigned_to: 'sales-rep-2',
        notes: 'طلب عرض أسعار',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'lead-3',
        tenant_id: 'default',
        name: 'محمد عبدالله',
        email: 'mohammed@example.com',
        phone: '+966509876543',
        company: 'شركة الرياض',
        position: 'رئيس تنفيذي',
        source: 'social_media',
        status: 'new',
        score: 60,
        estimated_value: 100000,
        assigned_to: undefined,
        notes: 'تواصل عبر لينكدإن',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Apply filters
    let filtered = mockLeads;

    if (filters?.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters?.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    if (filters?.assigned_to) {
      filtered = filtered.filter(lead => lead.assigned_to === filters.assigned_to);
    }

    // Apply pagination
    if (filters?.offset) {
      filtered = filtered.slice(filters.offset);
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }
}
