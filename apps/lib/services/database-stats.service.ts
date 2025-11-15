/**
 * Database Statistics Service
 * Provides comprehensive database monitoring and statistics
 */

import { query, getPool, testConnection } from '../db/connection';
import { Pool } from 'pg';

export interface DatabaseStats {
  connectionStats: ConnectionStats;
  tableStats: TableStats[];
  performanceStats: PerformanceStats;
  systemStats: SystemStats;
  timestamp: Date;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  poolSize: number;
  waitingClients: number;
}

export interface TableStats {
  tableName: string;
  schemaName: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  lastVacuum?: Date;
  lastAnalyze?: Date;
}

export interface PerformanceStats {
  avgQueryTime: number;
  slowQueries: SlowQuery[];
  cacheHitRatio: number;
  indexUsage: number;
  deadlocks: number;
  blockedQueries: number;
}

export interface SlowQuery {
  query: string;
  avgTime: number;
  calls: number;
  totalTime: number;
}

export interface SystemStats {
  databaseSize: string;
  uptime: string;
  version: string;
  currentTimestamp: Date;
  timezone: string;
  encoding: string;
}

export class DatabaseStatsService {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  /**
   * Get comprehensive database statistics
   */
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const [connectionStats, tableStats, performanceStats, systemStats] = await Promise.all([
        this.getConnectionStats(),
        this.getTableStats(),
        this.getPerformanceStats(),
        this.getSystemStats()
      ]);

      return {
        connectionStats,
        tableStats,
        performanceStats,
        systemStats,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Get connection statistics
   */
  private async getConnectionStats(): Promise<ConnectionStats> {
    try {
      const connectionQuery = `
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      const maxConnectionsQuery = `SELECT setting::int as max_connections FROM pg_settings WHERE name = 'max_connections'`;

      const [connectionResult, maxConnectionsResult] = await Promise.all([
        query(connectionQuery),
        query(maxConnectionsQuery)
      ]);

      const poolStats = {
        totalConnections: this.pool.totalCount || 0,
        idleConnections: this.pool.idleCount || 0,
        waitingClients: this.pool.waitingCount || 0
      };

      return {
        totalConnections: parseInt(connectionResult.rows[0]?.total_connections || '0'),
        activeConnections: parseInt(connectionResult.rows[0]?.active_connections || '0'),
        idleConnections: parseInt(connectionResult.rows[0]?.idle_connections || '0'),
        maxConnections: parseInt(maxConnectionsResult.rows[0]?.max_connections || '100'),
        poolSize: poolStats.totalConnections,
        waitingClients: poolStats.waitingClients
      };
    } catch (error) {
      console.error('Error getting connection stats:', error);
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        maxConnections: 100,
        poolSize: 0,
        waitingClients: 0
      };
    }
  }

  /**
   * Get table statistics
   */
  private async getTableStats(): Promise<TableStats[]> {
    try {
      const tableStatsQuery = `
        SELECT 
          schemaname as schema_name,
          tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
          last_vacuum,
          last_analyze
        FROM pg_stat_user_tables 
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 50
      `;

      const result = await query(tableStatsQuery);
      
      return result.rows.map(row => ({
        tableName: row.table_name,
        schemaName: row.schema_name,
        rowCount: parseInt(row.row_count || '0'),
        tableSize: row.table_size || '0 bytes',
        indexSize: row.index_size || '0 bytes',
        totalSize: row.total_size || '0 bytes',
        lastVacuum: row.last_vacuum ? new Date(row.last_vacuum) : undefined,
        lastAnalyze: row.last_analyze ? new Date(row.last_analyze) : undefined
      }));
    } catch (error) {
      console.error('Error getting table stats:', error);
      return [];
    }
  }

  /**
   * Get performance statistics
   */
  private async getPerformanceStats(): Promise<PerformanceStats> {
    try {
      const performanceQueries = {
        cacheHitRatio: `
          SELECT 
            round(
              (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
            ) as cache_hit_ratio
          FROM pg_statio_user_tables
        `,
        indexUsage: `
          SELECT 
            round(
              (sum(idx_scan) / (sum(seq_scan) + sum(idx_scan))) * 100, 2
            ) as index_usage_ratio
          FROM pg_stat_user_tables
        `,
        slowQueries: `
          SELECT 
            query,
            mean_time as avg_time,
            calls,
            total_time
          FROM pg_stat_statements 
          WHERE calls > 10
          ORDER BY mean_time DESC 
          LIMIT 10
        `
      };

      const [cacheResult, indexResult] = await Promise.all([
        query(performanceQueries.cacheHitRatio),
        query(performanceQueries.indexUsage)
      ]);

      let slowQueries: SlowQuery[] = [];
      try {
        const slowQueriesResult = await query(performanceQueries.slowQueries);
        slowQueries = slowQueriesResult.rows.map(row => ({
          query: row.query.substring(0, 100) + '...',
          avgTime: parseFloat(row.avg_time || '0'),
          calls: parseInt(row.calls || '0'),
          totalTime: parseFloat(row.total_time || '0')
        }));
      } catch (error) {
        console.log('pg_stat_statements extension not available');
      }

      return {
        avgQueryTime: 0,
        slowQueries,
        cacheHitRatio: parseFloat(cacheResult.rows[0]?.cache_hit_ratio || '0'),
        indexUsage: parseFloat(indexResult.rows[0]?.index_usage_ratio || '0'),
        deadlocks: 0,
        blockedQueries: 0
      };
    } catch (error) {
      console.error('Error getting performance stats:', error);
      return {
        avgQueryTime: 0,
        slowQueries: [],
        cacheHitRatio: 0,
        indexUsage: 0,
        deadlocks: 0,
        blockedQueries: 0
      };
    }
  }

  /**
   * Get system statistics
   */
  private async getSystemStats(): Promise<SystemStats> {
    try {
      const systemQuery = `
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          date_trunc('second', current_timestamp - pg_postmaster_start_time()) as uptime,
          version() as version,
          current_timestamp,
          current_setting('timezone') as timezone,
          pg_encoding_to_char(encoding) as encoding
        FROM pg_database 
        WHERE datname = current_database()
      `;

      const result = await query(systemQuery);
      const row = result.rows[0];

      return {
        databaseSize: row?.database_size || '0 bytes',
        uptime: row?.uptime || '0',
        version: row?.version || 'Unknown',
        currentTimestamp: new Date(row?.current_timestamp || Date.now()),
        timezone: row?.timezone || 'UTC',
        encoding: row?.encoding || 'UTF8'
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        databaseSize: '0 bytes',
        uptime: '0',
        version: 'Unknown',
        currentTimestamp: new Date(),
        timezone: 'UTC',
        encoding: 'UTF8'
      };
    }
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnection(): Promise<{
    isConnected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const isConnected = await testConnection();
      const responseTime = Date.now() - startTime;
      
      return {
        isConnected,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        isConnected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get real-time connection activity
   */
  async getConnectionActivity(): Promise<any[]> {
    try {
      const activityQuery = `
        SELECT 
          pid,
          usename as username,
          application_name,
          client_addr,
          client_port,
          backend_start,
          state,
          state_change,
          query_start,
          query,
          wait_event_type,
          wait_event
        FROM pg_stat_activity 
        WHERE datname = current_database()
        AND pid != pg_backend_pid()
        ORDER BY backend_start DESC
      `;

      const result = await query(activityQuery);
      return result.rows;
    } catch (error) {
      console.error('Error getting connection activity:', error);
      return [];
    }
  }

  /**
   * Get database locks information
   */
  async getDatabaseLocks(): Promise<any[]> {
    try {
      const locksQuery = `
        SELECT 
          l.locktype,
          l.database,
          l.relation,
          l.page,
          l.tuple,
          l.virtualxid,
          l.transactionid,
          l.classid,
          l.objid,
          l.objsubid,
          l.virtualtransaction,
          l.pid,
          l.mode,
          l.granted,
          a.usename,
          a.query,
          a.query_start,
          age(now(), a.query_start) AS duration
        FROM pg_locks l
        LEFT JOIN pg_stat_activity a ON l.pid = a.pid
        WHERE a.datname = current_database()
        ORDER BY a.query_start
      `;

      const result = await query(locksQuery);
      return result.rows;
    } catch (error) {
      console.error('Error getting database locks:', error);
      return [];
    }
  }
}

export const databaseStatsService = new DatabaseStatsService();