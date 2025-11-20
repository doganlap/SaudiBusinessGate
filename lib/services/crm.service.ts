import { query, transaction, PoolClient } from '@/lib/db/connection';

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'prospect';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_value: number;
  last_order?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  customer_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  customer_id?: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  assigned_to?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  tenant_id: string;
  customer_id?: string;
  deal_id?: string;
  type: 'meeting' | 'call' | 'email' | 'note' | 'task';
  title: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export class CRMService {
  // CUSTOMERS CRUD OPERATIONS

  static async getCustomers(tenantId: string, filters?: {
    status?: string;
    tier?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Customer[]> {
    try {
      let sql = 'SELECT * FROM customers WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.tier) {
        sql += ` AND tier = $${paramIndex}`;
        params.push(filters.tier);
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

      const result = await query<Customer>(sql, params);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  }

  static async getCustomerById(tenantId: string, customerId: string): Promise<Customer | null> {
    try {
      const result = await query<Customer>(
        'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
        [customerId, tenantId]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }
  }

  static async createCustomer(tenantId: string, customerData: Partial<Customer>): Promise<Customer> {
    try {
      const result = await query<Customer>(
        `INSERT INTO customers (
          tenant_id, name, company, email, phone, address, city, country,
          industry, status, tier, total_value, assigned_to, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          tenantId,
          customerData.name,
          customerData.company || null,
          customerData.email,
          customerData.phone || null,
          customerData.address || null,
          customerData.city || null,
          customerData.country || 'SA',
          customerData.industry || null,
          customerData.status || 'prospect',
          customerData.tier || 'bronze',
          customerData.total_value || 0,
          customerData.assigned_to || null,
          customerData.notes || null,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  static async updateCustomer(tenantId: string, customerId: string, customerData: Partial<Customer>): Promise<Customer> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(customerData).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'tenant_id' && key !== 'created_at' && value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(customerId, tenantId);
      const sql = `UPDATE customers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`;

      const result = await query<Customer>(sql, values);
      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }
      return result.rows[0];
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // CONTACTS CRUD OPERATIONS

  static async getContacts(tenantId: string, filters?: {
    customer_id?: string;
    is_primary?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Contact[]> {
    try {
      let sql = 'SELECT * FROM contacts WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.customer_id) {
        sql += ` AND customer_id = $${paramIndex}`;
        params.push(filters.customer_id);
        paramIndex++;
      }

      if (filters?.is_primary !== undefined) {
        sql += ` AND is_primary = $${paramIndex}`;
        params.push(filters.is_primary);
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

      const result = await query<Contact>(sql, params);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  }

  static async createContact(tenantId: string, contactData: Partial<Contact>): Promise<Contact> {
    try {
      const result = await query<Contact>(
        `INSERT INTO contacts (
          tenant_id, customer_id, first_name, last_name, email, phone,
          position, department, is_primary, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          tenantId,
          contactData.customer_id || null,
          contactData.first_name,
          contactData.last_name,
          contactData.email || null,
          contactData.phone || null,
          contactData.position || null,
          contactData.department || null,
          contactData.is_primary || false,
          contactData.notes || null,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      console.error('Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  // DEALS CRUD OPERATIONS

  static async getDeals(tenantId: string, filters?: {
    customer_id?: string;
    stage?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Deal[]> {
    try {
      let sql = 'SELECT * FROM deals WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.customer_id) {
        sql += ` AND customer_id = $${paramIndex}`;
        params.push(filters.customer_id);
        paramIndex++;
      }

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
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }
  }

  static async createDeal(tenantId: string, dealData: Partial<Deal>): Promise<Deal> {
    try {
      const result = await query<Deal>(
        `INSERT INTO deals (
          tenant_id, customer_id, name, value, stage, probability,
          expected_close_date, assigned_to, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          tenantId,
          dealData.customer_id || null,
          dealData.name,
          dealData.value || 0,
          dealData.stage || 'prospect',
          dealData.probability || 0,
          dealData.expected_close_date || null,
          dealData.assigned_to || null,
          dealData.description || null,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      console.error('Error creating deal:', error);
      throw new Error(`Failed to create deal: ${error.message}`);
    }
  }

  // ACTIVITIES CRUD OPERATIONS

  static async getActivities(tenantId: string, filters?: {
    customer_id?: string;
    deal_id?: string;
    type?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<Activity[]> {
    try {
      let sql = 'SELECT * FROM activities WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.customer_id) {
        sql += ` AND customer_id = $${paramIndex}`;
        params.push(filters.customer_id);
        paramIndex++;
      }

      if (filters?.deal_id) {
        sql += ` AND deal_id = $${paramIndex}`;
        params.push(filters.deal_id);
        paramIndex++;
      }

      if (filters?.type) {
        sql += ` AND type = $${paramIndex}`;
        params.push(filters.type);
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

      const result = await query<Activity>(sql, params);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }
  }

  static async createActivity(tenantId: string, activityData: Partial<Activity>): Promise<Activity> {
    try {
      const result = await query<Activity>(
        `INSERT INTO activities (
          tenant_id, customer_id, deal_id, type, title, description,
          due_date, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          tenantId,
          activityData.customer_id || null,
          activityData.deal_id || null,
          activityData.type,
          activityData.title,
          activityData.description || null,
          activityData.due_date || null,
          activityData.assigned_to || null,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      console.error('Error creating activity:', error);
      throw new Error(`Failed to create activity: ${error.message}`);
    }
  }

  // ANALYTICS

  static async getCRMAnalytics(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<any> {
    try {
      const dateFilter = filters?.dateFrom || filters?.dateTo
        ? `AND created_at >= '${filters.dateFrom || '2020-01-01'}' AND created_at <= '${filters.dateTo || new Date().toISOString()}'`
        : '';

      // Monthly customer trend
      const monthlyTrend = await query(`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          COUNT(*) as customer_count,
          SUM(total_value) as total_value
        FROM customers
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      `, [tenantId]);

      // Customer status distribution
      const statusDistribution = await query(`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(total_value) as total_value,
          AVG(total_value) as avg_value
        FROM customers
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY status
      `, [tenantId]);

      // Customer tier distribution
      const tierDistribution = await query(`
        SELECT 
          tier,
          COUNT(*) as count,
          SUM(total_value) as total_value,
          AVG(total_value) as avg_value
        FROM customers
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY tier
        ORDER BY 
          CASE tier
            WHEN 'platinum' THEN 1
            WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3
            WHEN 'bronze' THEN 4
          END
      `, [tenantId]);

      // Activity type distribution
      const activityDistribution = await query(`
        SELECT 
          type,
          COUNT(*) as count,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_count
        FROM activities
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY type
      `, [tenantId]);

      // Deal stage distribution
      const dealStageDistribution = await query(`
        SELECT 
          stage,
          COUNT(*) as count,
          SUM(value) as total_value,
          AVG(probability) as avg_probability
        FROM deals
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY stage
      `, [tenantId]);

      // Top customers by value
      const topCustomers = await query(`
        SELECT 
          id,
          name,
          company,
          total_value,
          status,
          tier
        FROM customers
        WHERE tenant_id = $1 ${dateFilter}
        ORDER BY total_value DESC
        LIMIT 10
      `, [tenantId]);

      return {
        monthlyTrend: monthlyTrend.rows,
        statusDistribution: statusDistribution.rows,
        tierDistribution: tierDistribution.rows,
        activityDistribution: activityDistribution.rows,
        dealStageDistribution: dealStageDistribution.rows,
        topCustomers: topCustomers.rows,
      };
    } catch (error: any) {
      console.error('Error fetching CRM analytics:', error);
      throw new Error(`Failed to fetch CRM analytics: ${error.message}`);
    }
  }
}

