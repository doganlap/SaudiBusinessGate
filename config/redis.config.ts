/**
 * Redis Configuration
 * Centralized Redis connection settings for caching
 */

export const redisConfig = {
  development: {
    host: /your-redis-host/i.test(process.env.REDIS_HOST || '') ? 'localhost' : (process.env.REDIS_HOST || 'localhost'),
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    lazyConnect: true,
  },
  
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 5,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    lazyConnect: true,
  },
  
  test: {
    host: 'localhost',
    port: 6380,
    db: 1,
  },
};

export const getRedisConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return redisConfig[env as keyof typeof redisConfig] || redisConfig.development;
};

export const cacheConfig = {
  defaultTTL: 3600, // 1 hour
  shortTTL: 300, // 5 minutes
  longTTL: 86400, // 24 hours
  prefixes: {
    session: 'session:',
    user: 'user:',
    api: 'api:',
    cache: 'cache:',
  },
};

export default getRedisConfig;
