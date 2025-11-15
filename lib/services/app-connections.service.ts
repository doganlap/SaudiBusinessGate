/**
 * Application Connections Service
 * Monitors and reports on various application connections and integrations
 */

import { databaseStatsService } from './database-stats.service';

export interface AppConnectionsReport {
  database: DatabaseConnectionStatus;
  redis: RedisConnectionStatus;
  external: ExternalConnectionStatus[];
  websocket: WebSocketConnectionStatus;
  api: ApiConnectionStatus;
  services: ServiceConnectionStatus[];
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  responseTime: number;
  poolStats: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
  error?: string;
}

export interface RedisConnectionStatus {
  isConnected: boolean;
  responseTime: number;
  memoryUsage?: string;
  connectedClients?: number;
  error?: string;
}

export interface ExternalConnectionStatus {
  name: string;
  url: string;
  isConnected: boolean;
  responseTime: number;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  error?: string;
}

export interface WebSocketConnectionStatus {
  isRunning: boolean;
  activeConnections: number;
  totalConnections: number;
  port: number;
  error?: string;
}

export interface ApiConnectionStatus {
  isHealthy: boolean;
  responseTime: number;
  endpoints: EndpointStatus[];
  rateLimits: RateLimitStatus[];
}

export interface EndpointStatus {
  path: string;
  method: string;
  isHealthy: boolean;
  responseTime: number;
  errorRate: number;
  lastChecked: Date;
}

export interface RateLimitStatus {
  endpoint: string;
  limit: number;
  remaining: number;
  resetTime: Date;
}

export interface ServiceConnectionStatus {
  name: string;
  type: 'internal' | 'external';
  isHealthy: boolean;
  responseTime: number;
  dependencies: string[];
  error?: string;
}

export class AppConnectionsService {
  private healthCheckCache = new Map<string, any>();
  private cacheTimeout = 30000; // 30 seconds

  /**
   * Get comprehensive application connections report
   */
  async getConnectionsReport(): Promise<AppConnectionsReport> {
    try {
      const [database, redis, external, websocket, api, services] = await Promise.all([
        this.checkDatabaseConnection(),
        this.checkRedisConnection(),
        this.checkExternalConnections(),
        this.checkWebSocketConnection(),
        this.checkApiHealth(),
        this.checkServiceConnections()
      ]);

      const overallHealth = this.calculateOverallHealth([
        database.isConnected,
        redis.isConnected,
        websocket.isRunning,
        api.isHealthy,
        ...services.map(s => s.isHealthy)
      ]);

      return {
        database,
        redis,
        external,
        websocket,
        api,
        services,
        timestamp: new Date(),
        overallHealth
      };
    } catch (error) {
      console.error('Error getting connections report:', error);
      throw error;
    }
  }

  /**
   * Check database connection status
   */
  private async checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
    try {
      const connectionTest = await databaseStatsService.testDatabaseConnection();
      const stats = await databaseStatsService.getDatabaseStats();

      return {
        isConnected: connectionTest.isConnected,
        responseTime: connectionTest.responseTime,
        poolStats: {
          total: stats.connectionStats.totalConnections,
          active: stats.connectionStats.activeConnections,
          idle: stats.connectionStats.idleConnections,
          waiting: stats.connectionStats.waitingClients
        },
        error: connectionTest.error
      };
    } catch (error) {
      return {
        isConnected: false,
        responseTime: 0,
        poolStats: { total: 0, active: 0, idle: 0, waiting: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check Redis connection status
   */
  private async checkRedisConnection(): Promise<RedisConnectionStatus> {
    try {
      // Check if Redis client is available
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 5000,
        lazyConnect: true
      });

      const startTime = Date.now();
      await redis.ping();
      const responseTime = Date.now() - startTime;

      const info = await redis.info('memory');
      const clients = await redis.info('clients');
      
      await redis.disconnect();

      return {
        isConnected: true,
        responseTime,
        memoryUsage: this.parseRedisInfo(info, 'used_memory_human'),
        connectedClients: parseInt(this.parseRedisInfo(clients, 'connected_clients') || '0')
      };
    } catch (error) {
      return {
        isConnected: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Redis connection failed'
      };
    }
  }

  /**
   * Check external service connections
   */
  private async checkExternalConnections(): Promise<ExternalConnectionStatus[]> {
    const externalServices = [
      { name: 'Stripe API', url: 'https://api.stripe.com/v1' },
      { name: 'OpenAI API', url: 'https://api.openai.com/v1' },
      { name: 'Auth Provider', url: process.env.NEXTAUTH_URL || 'http://localhost:3050' }
    ];

    const results = await Promise.allSettled(
      externalServices.map(service => this.checkExternalService(service))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: externalServices[index].name,
          url: externalServices[index].url,
          isConnected: false,
          responseTime: 0,
          status: 'down' as const,
          lastChecked: new Date(),
          error: result.reason?.message || 'Connection failed'
        };
      }
    });
  }

  /**
   * Check individual external service
   */
  private async checkExternalService(service: { name: string; url: string }): Promise<ExternalConnectionStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      
      const responseTime = Date.now() - startTime;
      const isConnected = response.ok || response.status < 500;
      
      return {
        name: service.name,
        url: service.url,
        isConnected,
        responseTime,
        status: isConnected ? 'healthy' : 'degraded',
        lastChecked: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: service.name,
        url: service.url,
        isConnected: false,
        responseTime,
        status: 'down',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  /**
   * Check WebSocket connection status
   */
  private async checkWebSocketConnection(): Promise<WebSocketConnectionStatus> {
    try {
      // Check if WebSocket server is running
      const wsPort = parseInt(process.env.WS_PORT || '3001');
      
      // Try to connect to WebSocket server
      const WebSocket = require('ws');
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            isRunning: false,
            activeConnections: 0,
            totalConnections: 0,
            port: wsPort,
            error: 'WebSocket server not responding'
          });
        }, 5000);

        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            isRunning: true,
            activeConnections: 0, // Would need server-side tracking
            totalConnections: 0,  // Would need server-side tracking
            port: wsPort
          });
        });

        ws.on('error', (error: Error) => {
          clearTimeout(timeout);
          resolve({
            isRunning: false,
            activeConnections: 0,
            totalConnections: 0,
            port: wsPort,
            error: error.message
          });
        });
      });
    } catch (error) {
      return {
        isRunning: false,
        activeConnections: 0,
        totalConnections: 0,
        port: 3001,
        error: error instanceof Error ? error.message : 'WebSocket check failed'
      };
    }
  }

  /**
   * Check API health
   */
  private async checkApiHealth(): Promise<ApiConnectionStatus> {
    const criticalEndpoints = [
      { path: '/api/health', method: 'GET' },
      { path: '/api/auth/session', method: 'GET' },
      { path: '/api/dashboard', method: 'GET' }
    ];

    const endpointResults = await Promise.allSettled(
      criticalEndpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    const endpoints = endpointResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          path: criticalEndpoints[index].path,
          method: criticalEndpoints[index].method,
          isHealthy: false,
          responseTime: 0,
          errorRate: 100,
          lastChecked: new Date()
        };
      }
    });

    const healthyEndpoints = endpoints.filter(e => e.isHealthy).length;
    const isHealthy = healthyEndpoints / endpoints.length >= 0.8; // 80% threshold
    const avgResponseTime = endpoints.reduce((sum, e) => sum + e.responseTime, 0) / endpoints.length;

    return {
      isHealthy,
      responseTime: avgResponseTime,
      endpoints,
      rateLimits: [] // Would need implementation based on your rate limiting
    };
  }

  /**
   * Check individual API endpoint
   */
  private async checkEndpoint(endpoint: { path: string; method: string }): Promise<EndpointStatus> {
    const startTime = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';
    
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        signal: AbortSignal.timeout(10000)
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      return {
        path: endpoint.path,
        method: endpoint.method,
        isHealthy,
        responseTime,
        errorRate: isHealthy ? 0 : 100,
        lastChecked: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        path: endpoint.path,
        method: endpoint.method,
        isHealthy: false,
        responseTime,
        errorRate: 100,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check service connections
   */
  private async checkServiceConnections(): Promise<ServiceConnectionStatus[]> {
    const services = [
      {
        name: 'License Service',
        type: 'internal' as const,
        dependencies: ['database']
      },
      {
        name: 'Billing Service',
        type: 'internal' as const,
        dependencies: ['database', 'stripe']
      },
      {
        name: 'Analytics Service',
        type: 'internal' as const,
        dependencies: ['database', 'redis']
      }
    ];

    return Promise.all(
      services.map(async (service) => {
        const startTime = Date.now();
        
        try {
          // Mock service health check - implement actual checks based on your services
          const isHealthy = Math.random() > 0.1; // 90% healthy for demo
          const responseTime = Date.now() - startTime;
          
          return {
            name: service.name,
            type: service.type,
            isHealthy,
            responseTime,
            dependencies: service.dependencies
          };
        } catch (error) {
          return {
            name: service.name,
            type: service.type,
            isHealthy: false,
            responseTime: Date.now() - startTime,
            dependencies: service.dependencies,
            error: error instanceof Error ? error.message : 'Service check failed'
          };
        }
      })
    );
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(healthStatuses: boolean[]): 'healthy' | 'degraded' | 'critical' {
    const healthyCount = healthStatuses.filter(Boolean).length;
    const totalCount = healthStatuses.length;
    const healthPercentage = healthyCount / totalCount;

    if (healthPercentage >= 0.9) return 'healthy';
    if (healthPercentage >= 0.7) return 'degraded';
    return 'critical';
  }

  /**
   * Parse Redis info response
   */
  private parseRedisInfo(info: string, key: string): string | undefined {
    const lines = info.split('\r\n');
    const line = lines.find(l => l.startsWith(`${key}:`));
    return line?.split(':')[1];
  }

  /**
   * Get cached health check result
   */
  private getCachedResult<T>(key: string): T | null {
    const cached = this.healthCheckCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache health check result
   */
  private setCachedResult<T>(key: string, data: T): void {
    this.healthCheckCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const appConnectionsService = new AppConnectionsService();