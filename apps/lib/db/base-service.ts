import { PoolClient } from 'pg';
import { DatabaseService } from './connection';

export class BaseDatabaseService {
  protected tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async query(text: string, params?: any[]) {
    return DatabaseService.query(text, params);
  }

  async findAll(tenantId?: string): Promise<any[]> {
    const sql = tenantId
      ? `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND is_active IS DISTINCT FROM false`
      : `SELECT * FROM ${this.tableName} WHERE is_active IS DISTINCT FROM false`;
    const res = tenantId ? await this.query(sql, [tenantId]) : await this.query(sql);
    return res.rows;
  }

  async findById(id: string, tenantId?: string, client?: PoolClient): Promise<any | null> {
    const sql = tenantId
      ? `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`
      : `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const params = tenantId ? [id, tenantId] : [id];
    const res = client ? await client.query(sql, params) : await this.query(sql, params);
    return res.rows[0] || null;
  }

  async create(data: Record<string, any>, tenantId: string, client?: PoolClient): Promise<any | null> {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = client ? await client.query(sql, vals) : await this.query(sql, vals);
    return res.rows[0] || null;
  }

  async update(id: string, updates: Record<string, any>, tenantId: string, client?: PoolClient): Promise<any | null> {
    const keys = Object.keys(updates);
    if (!keys.length) return await this.findById(id, tenantId, client);
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = [...Object.values(updates), id, tenantId];
    const sql = `UPDATE ${this.tableName} SET ${set} WHERE id = $${keys.length + 1} AND tenant_id = $${keys.length + 2} RETURNING *`;
    const res = client ? await client.query(sql, params) : await this.query(sql, params);
    return res.rows[0] || null;
  }

  async delete(id: string, tenantId: string, client?: PoolClient): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`;
    const params = [id, tenantId];
    const res = client ? await client.query(sql, params) : await this.query(sql, params);
    return (res.rowCount || 0) > 0;
  }

  async executeTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    return DatabaseService.transaction(fn);
  }
}