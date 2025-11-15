/**
 * Mock Redis Caching Service for Next.js API routes
 * Simplified version for production build compatibility
 */

export class RedisCachingServiceMock {
  private cache = new Map<string, any>();

  async get(key: string): Promise<any | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    this.cache.set(key, value);
    // Simple TTL simulation
    setTimeout(() => {
      this.cache.delete(key);
    }, ttlSeconds * 1000);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

export const redisCachingService = new RedisCachingServiceMock();