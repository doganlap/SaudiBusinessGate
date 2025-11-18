// =================================================================
// REDIS CACHING SERVICE - IMPLEMENTATION
// =================================================================
// This service provides a simple interface for interacting with Redis,
// allowing the application to cache frequently accessed data and
// improve performance.
// =================================================================

import { createClient, RedisClientType } from 'redis';

// --- Caching Service ---
export class RedisCachingService {
    private client: RedisClientType;
    private isConnected = false;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.connect();
    }

    private async connect() {
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log('? Successfully connected to Redis.');
        } catch (err) {
            console.error('? Could not connect to Redis:', err);
        }
    }

    // Set a value in the cache with an expiration time (in seconds)
    async set(key: string, value: any, expirationInSeconds: number): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.client.set(key, JSON.stringify(value), {
                EX: expirationInSeconds,
            });
        } catch (err) {
            console.error(`Error setting Redis key ${key}:`, err);
        }
    }

    // Get a value from the cache
    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) as T : null;
        } catch (err) {
            console.error(`Error getting Redis key ${key}:`, err);
            return null;
        }
    }

    // Delete a value from the cache
    async del(key: string): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.client.del(key);
        } catch (err) {
            console.error(`Error deleting Redis key ${key}:`, err);
        }
    }

    // Increment a counter value
    async increment(key: string): Promise<number> {
        if (!this.isConnected) return 0;
        try {
            return await this.client.incr(key);
        } catch (err) {
            console.error(`Error incrementing Redis key ${key}:`, err);
            return 0;
        }
    }

    // Set expiration time for a key
    async expire(key: string, seconds: number): Promise<boolean> {
        if (!this.isConnected) return false;
        try {
            const result = await this.client.expire(key, seconds);
            return result === 1;
        } catch (err) {
            console.error(`Error setting expiry for Redis key ${key}:`, err);
            return false;
        }
    }
}

export const redisCachingService = new RedisCachingService();
