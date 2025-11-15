import { dbManager } from '../db/manager';
import { VectorizeService } from './vectorize.service';
import { LicensingService } from './licensing.service';

// Service Registry - Central registry for all database services
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private initialized = false;

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // Initialize all services
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔧 Initializing Service Registry...');

      // Initialize database manager
      await dbManager.initialize();

      // Register all services
      this.registerServices();

      // Initialize service-specific database tables
      await this.initializeServiceTables();

      this.initialized = true;
      console.log('✅ Service Registry initialized successfully');

    } catch (error) {
      console.error('❌ Service Registry initialization failed:', error);
      throw error;
    }
  }

  // Register all database services
  private registerServices(): void {
    // Vectorize Service
    const vectorizeService = new VectorizeService();
    dbManager.registerService('vectorize', vectorizeService);

    // Licensing Service
    const licensingService = new LicensingService();
    dbManager.registerService('licensing', licensingService);

    console.log('📦 Registered all database services');
  }

  // Initialize service-specific database tables
  private async initializeServiceTables(): Promise<void> {
    try {
      console.log('🗄️ Initializing service-specific database tables...');

      const vectorizeService = dbManager.getService<VectorizeService>('vectorize');
      if (vectorizeService) {
        await vectorizeService.initializeTables();
        console.log('✅ Vectorize tables initialized');
      }

      // Licensing tables should already be created by migrations
      // But we can verify they exist
      const licensingService = dbManager.getService<LicensingService>('licensing');
      if (licensingService) {
        const healthCheck = await licensingService.healthCheck();
        if (healthCheck) {
          console.log('✅ Licensing tables verified');
        } else {
          console.warn('⚠️ Licensing tables may not be properly initialized');
        }
      }

    } catch (error) {
      console.error('❌ Error initializing service tables:', error);
      throw error;
    }
  }

  // Get service instances
  get vectorize(): VectorizeService {
    return dbManager.getService<VectorizeService>('vectorize')!;
  }

  get licensing(): LicensingService {
    return dbManager.getService<LicensingService>('licensing')!;
  }

  // Health check across all services
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    database: boolean;
  }> {
    return await dbManager.healthCheck();
  }

  // Get system statistics
  async getSystemStats(): Promise<{
    database: any;
    services: Record<string, any>;
  }> {
    const dbStats = await dbManager.getStats();

    const serviceStats: Record<string, any> = {};

    // Get stats for each service
    const vectorizeService = this.vectorize;
    if (vectorizeService) {
      serviceStats.vectorize = await vectorizeService.getIndexStats();
    }

    const licensingService = this.licensing;
    if (licensingService) {
      serviceStats.licensing = await licensingService.getLicenseStats();
    }

    return {
      database: dbStats,
      services: serviceStats
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Service Registry...');
    await dbManager.shutdown();
    console.log('✅ Service Registry shut down complete');
  }
}

// Global instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Convenience exports
export const vectorizeService = serviceRegistry.vectorize;
export const licensingService = serviceRegistry.licensing;
