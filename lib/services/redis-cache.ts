/**
 * Redis Cache Service - Production-Ready Implementation
 * High-performance caching layer with fallback to in-memory
 * 
 * Features:
 * - Redis-backed caching (Upstash compatible)
 * - In-memory fallback for development
 * - TTL support
 * - JSON serialization
 * - Batch operations
 * - Cache invalidation patterns
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for batch invalidation
}

interface CacheItem<T> {
  value: T;
  expiresAt: number;
  tags?: string[];
}

class CacheService {
  private redis: any = null;
  private inMemoryCache: Map<string, CacheItem<any>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private useRedis: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Try to initialize Redis/Upstash
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { Redis } = await import('@upstash/redis');
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        this.useRedis = true;
        console.log('✅ Cache Service: Using Upstash Redis');
      } else if (process.env.REDIS_URL) {
        const { Redis } = await import('@upstash/redis');
        this.redis = Redis.fromEnv();
        this.useRedis = true;
        console.log('✅ Cache Service: Using Redis');
      } else {
        console.warn('⚠️ Cache Service: Using in-memory cache (not recommended for production)');
        this.startCleanup();
      }
    } catch (error) {
      console.error('❌ Redis initialization failed, using in-memory cache:', error);
      this.startCleanup();
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redis) {
        const value = await this.redis.get(key);
        return value as T | null;
      } else {
        return this.getFromMemory<T>(key);
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (this.useRedis && this.redis) {
        return await this.setInRedis(key, value, options);
      } else {
        return this.setInMemory(key, value, options);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
        return true;
      } else {
        return this.delFromMemory(key);
      }
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      } else {
        return this.delPatternFromMemory(pattern);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Delete all keys with a specific tag
   */
  async delByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys || keys.size === 0) return 0;

    let deleted = 0;
    for (const key of keys) {
      const success = await this.del(key);
      if (success) deleted++;
    }

    this.tagIndex.delete(tag);
    return deleted;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redis) {
        const result = await this.redis.exists(key);
        return result === 1;
      } else {
        return this.existsInMemory(key);
      }
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      if (this.useRedis && this.redis) {
        return await this.redis.ttl(key);
      } else {
        return this.ttlFromMemory(key);
      }
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      if (this.useRedis && this.redis) {
        return await this.redis.incrby(key, increment);
      } else {
        return this.incrInMemory(key, increment);
      }
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.useRedis && this.redis) {
        return await this.redis.mget(...keys) as (T | null)[];
      } else {
        return keys.map(key => this.getFromMemory<T>(key));
      }
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset(entries: Array<{ key: string; value: any; options?: CacheOptions }>): Promise<boolean> {
    try {
      const promises = entries.map(({ key, value, options }) => this.set(key, value, options));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.flushdb();
      } else {
        this.inMemoryCache.clear();
        this.tagIndex.clear();
      }
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // ========== Private Methods - Redis ==========

  private async setInRedis<T>(key: string, value: T, options: CacheOptions): Promise<boolean> {
    if (options.ttl) {
      await this.redis.setex(key, options.ttl, JSON.stringify(value));
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }

    // Store tags (simplified - in production use Redis sets)
    if (options.tags) {
      for (const tag of options.tags) {
        await this.redis.sadd(`tag:${tag}`, key);
      }
    }

    return true;
  }

  // ========== Private Methods - In-Memory ==========

  private getFromMemory<T>(key: string): T | null {
    const item = this.inMemoryCache.get(key);
    if (!item) return null;

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  private setInMemory<T>(key: string, value: T, options: CacheOptions): boolean {
    const ttl = options.ttl || 3600; // Default 1 hour
    const expiresAt = Date.now() + (ttl * 1000);

    const item: CacheItem<T> = {
      value,
      expiresAt,
      tags: options.tags,
    };

    this.inMemoryCache.set(key, item);

    // Index by tags
    if (options.tags) {
      for (const tag of options.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }

    return true;
  }

  private delFromMemory(key: string): boolean {
    const item = this.inMemoryCache.get(key);
    if (!item) return false;

    // Remove from tag index
    if (item.tags) {
      for (const tag of item.tags) {
        this.tagIndex.get(tag)?.delete(key);
      }
    }

    this.inMemoryCache.delete(key);
    return true;
  }

  private delPatternFromMemory(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;

    for (const key of this.inMemoryCache.keys()) {
      if (regex.test(key)) {
        this.delFromMemory(key);
        deleted++;
      }
    }

    return deleted;
  }

  private existsInMemory(key: string): boolean {
    const item = this.inMemoryCache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiresAt) {
      this.inMemoryCache.delete(key);
      return false;
    }

    return true;
  }

  private ttlFromMemory(key: string): number {
    const item = this.inMemoryCache.get(key);
    if (!item) return -2; // Key doesn't exist

    const remaining = item.expiresAt - Date.now();
    if (remaining <= 0) {
      this.inMemoryCache.delete(key);
      return -2;
    }

    return Math.ceil(remaining / 1000); // Convert to seconds
  }

  private incrInMemory(key: string, increment: number): number {
    const current = this.getFromMemory<number>(key) || 0;
    const newValue = current + increment;
    this.setInMemory(key, newValue, {});
    return newValue;
  }

  /**
   * Cleanup expired items in memory
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.inMemoryCache.entries()) {
      if (now > item.expiresAt) {
        this.delFromMemory(key);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.inMemoryCache.clear();
    this.tagIndex.clear();
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Helper function for cache-or-fetch pattern
export async function cacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache
  const cached = await cacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache
  await cacheService.set(key, fresh, options);

  return fresh;
}
