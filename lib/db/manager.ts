import { Pool, PoolClient } from 'pg';
import { DatabaseService, getPool, closePool } from './connection';

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
      this.pool = getPool();
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
      operation: string;
      params: any[];
    }>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    return await DatabaseService.transaction(async (client: PoolClient) => {
      const results: any[] = [];

      for (const op of operations) {
        const service = this.getService(op.service);
        if (!service) {
          throw new Error(`Service ${op.service} not found`);
        }

        if (typeof (service as Record<string, any>)[op.operation] !== 'function') {
          throw new Error(`Operation ${op.operation} not found in service ${op.service}`);
        }

        // Inject client for transaction support
        const result = await (service as Record<string, any>)[op.operation](...op.params, client);
        results.push(result);
      }

      return results as T;
    });
  }

  // Health check across all services
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    database: boolean;
  }> {
    const results: Record<string, boolean> = {};
    let allHealthy = true;

    // Check database connection
    const dbHealthy = await DatabaseService.testConnection().catch(() => false);

    // Check each service
    for (const [name, service] of this.services) {
      try {
        if (typeof service.healthCheck === 'function') {
          results[name] = await service.healthCheck();
        } else {
          results[name] = true; // Assume healthy if no health check
        }
      } catch (error) {
        results[name] = false;
        allHealthy = false;
      }
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!dbHealthy) {
      status = 'unhealthy';
    } else if (!allHealthy) {
      status = 'degraded';
    }

    return {
      status,
      services: results,
      database: dbHealthy
    };
  }

  // Get database statistics
  async getStats(): Promise<{
    connections: {
      total: number;
      active: number;
      idle: number;
    };
    services: string[];
    uptime: number;
  }> {
    const pool = getPool();
    const stats = {
      connections: {
        total: pool.totalCount,
        active: pool.totalCount - pool.idleCount,
        idle: pool.idleCount
      },
      services: Array.from(this.services.keys()),
      uptime: process.uptime()
    };

    return stats;
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Database Manager...');

    // Shutdown all services
    for (const [name, service] of this.services) {
      if (typeof service.shutdown === 'function') {
        try {
          await service.shutdown();
          console.log(`✅ Service ${name} shut down`);
        } catch (error) {
          console.error(`❌ Error shutting down service ${name}:`, error);
        }
      }
    }

    // Close database connection
    await closePool();
    console.log('🗄️ Database Manager shut down complete');
  }
}

// Global instance
export const dbManager = DatabaseManager.getInstance();
