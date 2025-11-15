import { query } from '@/lib/db/connection';
import { Contract, Order, OrderItem } from '@/types/sales';

export class ContractsOrdersService {
  // Contract CRUD aOPERATIONS

  static async getContracts(tenantId: string, filters?: { status?: string; deal_id?: number; limit?: number; offset?: number }): Promise<Contract[]> {
    let sql = 'SELECT * FROM sales_contracts WHERE tenant_id = $1';
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

    const result = await query<Contract>(sql, params);
    return result.rows;
  }

  static async createContract(tenantId: string, contractData: Omit<Contract, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    const result = await query<Contract>(
      `INSERT INTO sales_contracts (tenant_id, deal_id, title, content, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, contractData.deal_id, contractData.title, contractData.content, contractData.status || 'draft', contractData.start_date, contractData.end_date]
    );
    return result.rows[0];
  }

  // Order CRUD aOPERATIONS

  static async getOrders(tenantId: string, filters?: { status?: string; quote_id?: number; limit?: number; offset?: number }): Promise<Order[]> {
    let sql = 'SELECT * FROM sales_orders WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.quote_id) {
      sql += ` AND quote_id = $${paramIndex}`;
      params.push(filters.quote_id);
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

    const result = await query<Order>(sql, params);
    return result.rows;
  }

  static async createOrder(tenantId: string, orderData: Omit<Order, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const result = await query<Order>(
      `INSERT INTO sales_orders (tenant_id, quote_id, contract_id, order_number, status, total_amount, order_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, orderData.quote_id, orderData.contract_id, orderData.order_number, orderData.status || 'pending', orderData.total_amount, orderData.order_date]
    );
    return result.rows[0];
  }
}