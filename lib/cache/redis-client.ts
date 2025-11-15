/**
 * Redis Cache Client
 * Handles Redis connection and caching operations
 */

import Redis from 'ioredis';
import { getRedisConfig, cacheConfig } from '@/config/redis.config';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const config = getRedisConfig();
    redis = new Redis(config);
    
    redis.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redis.on('error', (err) => {
      console.error('Redis client error:', err);
    });
    
    redis.on('ready', () => {
      console.log('Redis client ready');
    });
  }
  
  return redis;
}

export async function get<T = any>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function set(
  key: string,
  value: any,
  ttl: number = cacheConfig.defaultTTL
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl > 0) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function del(key: string | string[]): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = Array.isArray(key) ? key : [key];
    return await client.del(...keys);
  } catch (error) {
    console.error('Redis del error:', error);
    return 0;
  }
}

export async function exists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis exists error:', error);
    return false;
  }
}

export async function expire(key: string, ttl: number): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error('Redis expire error:', error);
    return false;
  }
}

export async function clearPattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length === 0) return 0;
    
    return await client.del(...keys);
  } catch (error) {
    console.error('Redis clearPattern error:', error);
    return 0;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    console.log('Redis connection successful:', result);
    return result === 'PONG';
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export default {
  get,
  set,
  del,
  exists,
  expire,
  clearPattern,
  testConnection,
  closeConnection,
};
