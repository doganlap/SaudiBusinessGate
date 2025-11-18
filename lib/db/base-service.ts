import { PoolClient, QueryResult } from 'pg';
import { query, transaction } from './connection';

// Base Database Service Class
export abstract class BaseDatabaseService {
  protected tableName: string;
  protected tenantColumn: string = 'tenant_id';

  constructor(tableName: string, tenantColumn: string = 'tenant_id') {
    this.tableName = tableName;
    this.tenantColumn = tenantColumn;
  }

  // Common CRUD operations
  async findAll(tenantId?: string, client?: PoolClient): Promise<any[]> {
    try {
      let queryText = `SELECT * FROM ${this.tableName}`;
      let params: any[] = [];

      if (tenantId) {
        queryText += ` WHERE ${this.tenantColumn} = $1`;
        params = [tenantId];
      }

      queryText += ' ORDER BY created_at DESC';

      const result = client
        ? await client.query(queryText, params)
        : await query(queryText, params);

      return result.rows;
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      return [];
    }
  }

  async findById(id: string, tenantId?: string, client?: PoolClient): Promise<any | null> {
    try {
      let queryText = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      let params: any[] = [id];

      if (tenantId) {
        queryText += ` AND ${this.tenantColumn} = $2`;
        params.push(tenantId);
      }

      const result = client
        ? await client.query(queryText, params)
        : await query(queryText, params);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
  }

  async create(data: any, tenantId?: string, client?: PoolClient): Promise<any | null> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      // Add tenant_id if provided and not already in data
      if (tenantId && !data[this.tenantColumn]) {
        columns.push(this.tenantColumn);
        values.push(tenantId);
      }

      const queryText = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = client
        ? await client.query(queryText, values)
        : await query(queryText, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return null;
    }
  }

  async update(id: string, data: any, tenantId?: string, client?: PoolClient): Promise<any | null> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');

      let queryText = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
      `;

      let params: any[] = [id, ...values];

      if (tenantId) {
        queryText += ` AND ${this.tenantColumn} = $${params.length + 1}`;
        params.push(tenantId);
      }

      queryText += ' RETURNING *';

      const result = client
        ? await client.query(queryText, params)
        : await query(queryText, params);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }
  }

  async delete(id: string, tenantId?: string, client?: PoolClient): Promise<boolean> {
    try {
      let queryText = `DELETE FROM ${this.tableName} WHERE id = $1`;
      let params: any[] = [id];

      if (tenantId) {
        queryText += ` AND ${this.tenantColumn} = $2`;
        params.push(tenantId);
      }

      const result = client
        ? await client.query(queryText, params)
        : await query(queryText, params);

      return result.rowCount! > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }
  }

  // Advanced operations
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
    tenantId?: string,
    client?: PoolClient
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;
      let whereClause = '';
      let params: any[] = [];
      let paramIndex = 1;

      // Build where clause from filters
      const conditions: string[] = [];
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });

      if (tenantId) {
        conditions.push(`${this.tenantColumn} = $${paramIndex}`);
        params.push(tenantId);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const countResult = client
        ? await client.query(countQuery, params)
        : await query(countQuery, params);

      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);

      const dataResult = client
        ? await client.query(dataQuery, params)
        : await query(dataQuery, params);

      return {
        data: dataResult.rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error(`Error with pagination for ${this.tableName}:`, error);
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    return transaction(callback);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await query(`SELECT 1 FROM ${this.tableName} LIMIT 1`);
      return true;
    } catch (error) {
      console.error(`Health check failed for ${this.tableName}:`, error);
      return false;
    }
  }

  // Get table statistics
  async getStats(tenantId?: string, client?: PoolClient): Promise<any> {
    try {
      let queryText = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
          MAX(created_at) as latest_created,
          MIN(created_at) as oldest_created
        FROM ${this.tableName}
      `;

      let params: any[] = [];
      if (tenantId) {
        queryText += ` WHERE ${this.tenantColumn} = $1`;
        params = [tenantId];
      }

      const result = client
        ? await client.query(queryText, params)
        : await query(queryText, params);

      return result.rows[0];
    } catch (error) {
      console.error(`Error getting stats for ${this.tableName}:`, error);
      return { total: 0, last_30_days: 0, latest_created: null, oldest_created: null };
    }
  }
}
