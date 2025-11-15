import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (url) {
      pool = new Pool({
        connectionString: url,
        ssl: /prisma-data\.net|db\.prisma\.io/.test(url)
          ? { rejectUnauthorized: false }
          : undefined,
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      const config: DatabaseConfig = {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'doganhubstore',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        ssl: process.env.POSTGRES_SSL === 'true',
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };

      pool = new Pool(config);
    }

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });

    console.log('Database connection pool created');
  }

  return pool;
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a transaction with automatic rollback on error
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the database pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, version() as version');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export types
export type { PoolClient, QueryResult };

// DatabaseService class for compatibility
export class DatabaseService {
  static async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return query<T>(text, params);
  }

  static async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    return transaction(callback);
  }

  static async testConnection(): Promise<boolean> {
    return testConnection();
  }
}
