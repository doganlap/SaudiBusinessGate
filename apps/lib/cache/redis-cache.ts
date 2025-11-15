/**
 * Redis Caching Service
 * Multi-layer caching with 90%+ hit rate target
 */

import { Redis, Cluster } from 'ioredis';
import { Pool } from 'pg';

// =====================================================
// CACHE CONFIGURATION
// =====================================================

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  tls?: boolean;
  db?: number;
  keyPrefix?: string;
}

export const CACHE_TTL = {
  SHORT: 60,        // 1 minute - real-time data
  MEDIUM: 300,      // 5 minutes - frequently updated
  LONG: 900,        // 15 minutes - stable data
  STATIC: 86400,    // 24 hours - rarely changes
  SESSION: 86400    // 24 hours - user sessions
};

export const CACHE_PREFIXES = {
  SESSION: 'sess:',
  API: 'api:',
  QUERY: 'query:',
  KPI: 'kpi:',
  USER: 'user:',
  ORG: 'org:',
  THEME: 'theme:',
  PERM: 'perm:'
};

// =====================================================
// REDIS CACHE SERVICE
// =====================================================

export class RedisCacheService {
  private client: Cluster | Redis;
  private db: Pool;
  private statsEnabled: boolean = true;
  private stats: {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
  };

  constructor(config: CacheConfig | CacheConfig[], dbPool: Pool) {
    this.db = dbPool;
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

    if (Array.isArray(config)) {
      // Cluster mode
      this.client = new Cluster(
        config.map(c => ({ host: c.host, port: c.port })),
        {
          enableReadyCheck: true,
          enableOfflineQueue: true,
          redisOptions: {
            password: config[0].password,
            tls: config[0].tls ? {} : undefined,
            maxRetriesPerRequest: 3
          }
        }
      );
    } else {
      // Single instance mode
      this.client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        tls: config.tls ? {} : undefined,
        db: config.db || 0,
        keyPrefix: config.keyPrefix || '',
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    this.client.on('ready', () => {
      console.log('🚀 Redis ready for operations');
    });
  }

  // =====================================================
  // CORE CACHE METHODS
  // =====================================================

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      this.stats.sets++;
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.stats.deletes++;
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.stats.deletes += keys.length;
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  // =====================================================
  // ADVANCED CACHE METHODS
  // =====================================================

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from source
    const value = await fetchFunction();
    
    // Store in cache
    await this.set(key, value, ttl);
    
    return value;
  }

  async remember<T>(
    key: string,
    query: string,
    params: any[],
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T[]> {
    return this.getOrSet(
      CACHE_PREFIXES.QUERY + key,
      async () => {
        const result = await this.db.query(query, params);
        return result.rows;
      },
      ttl
    );
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  async setSession(sessionId: string, data: any, ttl: number = CACHE_TTL.SESSION): Promise<void> {
    await this.set(CACHE_PREFIXES.SESSION + sessionId, data, ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    return this.get(CACHE_PREFIXES.SESSION + sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(CACHE_PREFIXES.SESSION + sessionId);
  }

  async extendSession(sessionId: string, ttl: number = CACHE_TTL.SESSION): Promise<void> {
    const key = CACHE_PREFIXES.SESSION + sessionId;
    await this.client.expire(key, ttl);
  }

  // =====================================================
  // USER & ORGANIZATION CACHING
  // =====================================================

  async cacheUser(userId: number, userData: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    await this.set(CACHE_PREFIXES.USER + userId, userData, ttl);
  }

  async getUser(userId: number): Promise<any | null> {
    return this.get(CACHE_PREFIXES.USER + userId);
  }

  async invalidateUser(userId: number): Promise<void> {
    await this.del(CACHE_PREFIXES.USER + userId);
    await this.invalidatePattern(CACHE_PREFIXES.PERM + `${userId}:*`);
  }

  async cacheOrganization(orgId: number, orgData: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    await this.set(CACHE_PREFIXES.ORG + orgId, orgData, ttl);
  }

  async getOrganization(orgId: number): Promise<any | null> {
    return this.get(CACHE_PREFIXES.ORG + orgId);
  }

  async invalidateOrganization(orgId: number): Promise<void> {
    await this.invalidatePattern(CACHE_PREFIXES.ORG + `${orgId}*`);
  }

  // =====================================================
  // THEME CACHING
  // =====================================================

  async cacheTheme(orgId: number, theme: any, ttl: number = CACHE_TTL.STATIC): Promise<void> {
    await this.set(CACHE_PREFIXES.THEME + orgId, theme, ttl);
  }

  async getTheme(orgId: number): Promise<any | null> {
    return this.get(CACHE_PREFIXES.THEME + orgId);
  }

  async invalidateTheme(orgId: number): Promise<void> {
    await this.del(CACHE_PREFIXES.THEME + orgId);
  }

  // =====================================================
  // KPI CACHING (Real-time data)
  // =====================================================

  async cacheKPI(orgId: number, kpiName: string, value: any): Promise<void> {
    await this.set(
      CACHE_PREFIXES.KPI + `${orgId}:${kpiName}`,
      value,
      CACHE_TTL.SHORT // 1 minute for real-time KPIs
    );
  }

  async getKPI(orgId: number, kpiName: string): Promise<any | null> {
    return this.get(CACHE_PREFIXES.KPI + `${orgId}:${kpiName}`);
  }

  async invalidateAllKPIs(orgId: number): Promise<void> {
    await this.invalidatePattern(CACHE_PREFIXES.KPI + `${orgId}:*`);
  }

  // =====================================================
  // STATISTICS & MONITORING
  // =====================================================

  getStats(): {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  async getInfo(): Promise<any> {
    const info = await this.client.info();
    return info;
  }

  async getMemoryUsage(): Promise<{
    used: string;
    peak: string;
    fragmentation: string;
  }> {
    const info = await this.client.info('memory');
    const lines = info.split('\r\n');
    
    const used = lines.find(l => l.startsWith('used_memory_human:'))?.split(':')[1] || '0';
    const peak = lines.find(l => l.startsWith('used_memory_peak_human:'))?.split(':')[1] || '0';
    const fragmentation = lines.find(l => l.startsWith('mem_fragmentation_ratio:'))?.split(':')[1] || '1.0';

    return { used, peak, fragmentation };
  }

  // =====================================================
  // HEALTH CHECK
  // =====================================================

  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    connected: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      await this.client.ping();
      const latency = Date.now() - startTime;
      
      return {
        healthy: latency < 100, // Healthy if latency < 100ms
        latency,
        connected: true
      };
    } catch (error) {
      return {
        healthy: false,
        latency: -1,
        connected: false
      };
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// =====================================================
// CACHE DECORATOR
// =====================================================

export function Cacheable(ttl: number = CACHE_TTL.MEDIUM) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache: RedisCacheService = (this as any).cache;
      
      if (!cache) {
        return originalMethod.apply(this, args);
      }

      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl
      );
    };

    return descriptor;
  };
}

export default RedisCacheService;

