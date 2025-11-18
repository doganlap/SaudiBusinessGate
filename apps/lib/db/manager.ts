import { Pool, PoolClient } from 'pg';
import { DatabaseService } from '../services/database.service';

// Database Manager - Central coordinator for all database operations
export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private services: Map<string, Record<string, any>> = new Map();

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Initialize database connection
  async initialize(): Promise<void> {
    try {
      this.pool = DatabaseService.getPool();
      console.log('🗄️ Database Manager initialized successfully');

      // Test connection
      const isConnected = await DatabaseService.testConnection();
      if (!isConnected) {
        console.warn('⚠️ Database connection test failed - using mock data fallback');
      }
    } catch (error) {
      console.error('❌ Database Manager initialization failed:', error);
      throw error;
    }
  }

  // Register a database service
  registerService(name: string, service: any): void {
    this.services.set(name, service);
    console.log(`📦 Registered database service: ${name}`);
  }

  // Get a registered service
  getService<T = Record<string, any>>(name: string): T | null {
    return (this.services.get(name) as T) || null;
  }

  // Execute transaction across multiple services
  async executeTransaction<T>(
    operations: Array<{
      service: string;
      method: string;
      params: any[];
    }>,
    options?: {
      isolationLevel?: 'read_committed' | 'repeatable_read' | 'serializable';
      timeout?: number;
    }
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database Manager not initialized');
    }

    const client = await this.pool.connect();
    const results: T[] = [];

    try {
      await client.query('BEGIN');

      for (const operation of operations) {
        const service = this.getService(operation.service);
        if (!service) {
          throw new Error(`Service not found: ${operation.service}`);
        }

        const method = service[operation.method];
        if (typeof method !== 'function') {
          throw new Error(`Method not found: ${operation.method} on service ${operation.service}`);
        }

        const result = await method.apply(service, operation.params);
        results.push(result);
      }

      await client.query('COMMIT');
      return results;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get database pool
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database Manager not initialized');
    }
    return this.pool;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    database: boolean;
  }> {
    try {
      const services: Record<string, boolean> = {};
      
      // Check all registered services
      for (const [serviceName, service] of this.services) {
        try {
          if (service.healthCheck && typeof service.healthCheck === 'function') {
            services[serviceName] = await service.healthCheck();
          } else {
            services[serviceName] = true; // Assume healthy if no healthCheck method
          }
        } catch (error) {
          console.error(`Health check failed for service ${serviceName}:`, error);
          services[serviceName] = false;
        }
      }

      // Check database connection
      let database = false;
      if (this.pool) {
        try {
          const result = await this.pool.query('SELECT 1');
          database = result.rows.length > 0;
        } catch (error) {
          console.error('Database health check failed:', error);
          database = false;
        }
      }

      // Determine overall status
      const allServicesHealthy = Object.values(services).every(healthy => healthy);
      const status = database && allServicesHealthy ? 'healthy' : 
                    database || Object.values(services).some(healthy => healthy) ? 'degraded' : 'unhealthy';

      return {
        status,
        services,
        database
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: {},
        database: false
      };
    }
  }

  // Get database statistics
  async getStats(): Promise<any> {
    try {
      if (!this.pool) {
        return {
          totalConnections: 0,
          activeConnections: 0,
          idleConnections: 0,
          services: this.services.size
        };
      }

      // Get PostgreSQL statistics
      const result = await this.pool.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return {
        ...result.rows[0],
        services: this.services.size
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        services: this.services.size,
        error: error.message
      };
    }
  }

  // Shutdown
  async shutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🗄️ Database Manager shutdown complete');
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
