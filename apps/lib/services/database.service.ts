import { PoolClient } from 'pg';
import { DatabaseService as Conn } from '../db/connection';

export class DatabaseService {
  async query(sql: string, params: any[] = []) {
    return Conn.query(sql, params);
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    return Conn.transaction(fn);
  }

  async testConnection(): Promise<boolean> {
    return Conn.testConnection();
  }
}