/**
 * Critical Data Store - Postgres-backed Persistence Layer
 * P0 BLOCKER FIX
 *
 * Replaces in-memory caches with durable Postgres storage
 * Ensures no data loss on restarts/deployments
 */

import { query, transaction, getPool } from '@/lib/db/connection';
import { PoolClient } from 'pg';

/**
 * Session storage - replaces Redis for critical sessions
 */
export class SessionStore {
  /**
   * Initialize session table
   */
  async initialize(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

      -- Auto-cleanup expired sessions
      CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
      RETURNS void AS $$
      BEGIN
        DELETE FROM sessions WHERE expire < NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  /**
   * Store session
   */
  async set(sid: string, session: any, ttl: number): Promise<void> {
    const expire = new Date(Date.now() + ttl * 1000);

    await query(
      `INSERT INTO sessions (sid, sess, expire, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (sid)
       DO UPDATE SET sess = $2, expire = $3, updated_at = NOW()`,
      [sid, JSON.stringify(session), expire]
    );
  }

  /**
   * Get session
   */
  async get(sid: string): Promise<any | null> {
    const result = await query(
      `SELECT sess FROM sessions
       WHERE sid = $1 AND expire > NOW()`,
      [sid]
    );

    return result.rows[0]?.sess || null;
  }

  /**
   * Delete session
   */
  async destroy(sid: string): Promise<void> {
    await query(`DELETE FROM sessions WHERE sid = $1`, [sid]);
  }

  /**
   * Cleanup expired sessions
   */
  async cleanup(): Promise<number> {
    const result = await query(
      `DELETE FROM sessions WHERE expire < NOW()`
    );
    return result.rowCount || 0;
  }
}

/**
 * Cache store - replaces Redis cache
 */
export class CacheStore {
  /**
   * Initialize cache table
   */
  async initialize(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS cache_entries (
        cache_key VARCHAR(500) PRIMARY KEY,
        cache_value JSONB NOT NULL,
        tags TEXT[] DEFAULT '{}',
        expire_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        accessed_at TIMESTAMP DEFAULT NOW(),
        access_count INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_cache_expire ON cache_entries(expire_at);
      CREATE INDEX IF NOT EXISTS idx_cache_tags ON cache_entries USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_cache_accessed ON cache_entries(accessed_at);
    `);
  }

  /**
   * Set cache value
   */
  async set(
    key: string,
    value: any,
    ttlSeconds?: number,
    tags: string[] = []
  ): Promise<void> {
    const expireAt = ttlSeconds
      ? new Date(Date.now() + ttlSeconds * 1000)
      : null;

    await query(
      `INSERT INTO cache_entries (cache_key, cache_value, expire_at, tags)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cache_key)
       DO UPDATE SET
         cache_value = $2,
         expire_at = $3,
         tags = $4,
         created_at = NOW()`,
      [key, JSON.stringify(value), expireAt, tags]
    );
  }

  /**
   * Get cache value
   */
  async get(key: string): Promise<any | null> {
    const result = await query(
      `UPDATE cache_entries
       SET accessed_at = NOW(),
           access_count = access_count + 1
       WHERE cache_key = $1
         AND (expire_at IS NULL OR expire_at > NOW())
       RETURNING cache_value`,
      [key]
    );

    return result.rows[0]?.cache_value || null;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    await query(`DELETE FROM cache_entries WHERE cache_key = $1`, [key]);
  }

  /**
   * Delete by tag
   */
  async deleteByTag(tag: string): Promise<number> {
    const result = await query(
      `DELETE FROM cache_entries WHERE $1 = ANY(tags)`,
      [tag]
    );
    return result.rowCount || 0;
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<number> {
    const result = await query(`DELETE FROM cache_entries`);
    return result.rowCount || 0;
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    const result = await query(
      `DELETE FROM cache_entries WHERE expire_at < NOW()`
    );
    return result.rowCount || 0;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    total: number;
    expired: number;
    mostAccessed: Array<{ key: string; count: number }>;
  }> {
    const stats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE expire_at < NOW()) as expired
      FROM cache_entries
    `);

    const topAccessed = await query(`
      SELECT cache_key as key, access_count as count
      FROM cache_entries
      ORDER BY access_count DESC
      LIMIT 10
    `);

    return {
      total: parseInt(stats.rows[0].total),
      expired: parseInt(stats.rows[0].expired),
      mostAccessed: topAccessed.rows,
    };
  }
}

/**
 * Rate limiter - replaces Redis-based rate limiting
 */
export class RateLimitStore {
  /**
   * Initialize rate limit table
   */
  async initialize(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        identifier VARCHAR(500) PRIMARY KEY, -- IP or user ID
        request_count INTEGER DEFAULT 1,
        window_start TIMESTAMP DEFAULT NOW(),
        window_duration_ms INTEGER NOT NULL,
        max_requests INTEGER NOT NULL,
        blocked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limits(window_start);
      CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked ON rate_limits(blocked_until);
    `);
  }

  /**
   * Check and increment rate limit
   * Returns true if allowed, false if rate limited
   */
  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const result = await query<{
      allowed: boolean;
      remaining: number;
      reset_at: Date;
    }>(
      `WITH current_limit AS (
        SELECT
          identifier,
          request_count,
          window_start,
          blocked_until,
          window_start + (window_duration_ms * INTERVAL '1 millisecond') as window_end
        FROM rate_limits
        WHERE identifier = $1
      ),
      updated_limit AS (
        INSERT INTO rate_limits (identifier, request_count, window_start, window_duration_ms, max_requests)
        VALUES ($1, 1, NOW(), $3, $2)
        ON CONFLICT (identifier) DO UPDATE SET
          request_count = CASE
            WHEN NOW() > rate_limits.window_start + (rate_limits.window_duration_ms * INTERVAL '1 millisecond')
            THEN 1  -- New window
            ELSE rate_limits.request_count + 1
          END,
          window_start = CASE
            WHEN NOW() > rate_limits.window_start + (rate_limits.window_duration_ms * INTERVAL '1 millisecond')
            THEN NOW()
            ELSE rate_limits.window_start
          END,
          blocked_until = CASE
            WHEN rate_limits.request_count + 1 > $2
            THEN NOW() + (rate_limits.window_duration_ms * INTERVAL '1 millisecond')
            ELSE NULL
          END
        RETURNING *
      )
      SELECT
        (request_count <= max_requests AND (blocked_until IS NULL OR blocked_until < NOW())) as allowed,
        GREATEST(0, max_requests - request_count) as remaining,
        window_start + (window_duration_ms * INTERVAL '1 millisecond') as reset_at
      FROM updated_limit`,
      [identifier, maxRequests, windowMs]
    );

    return {
      allowed: result.rows[0].allowed,
      remaining: result.rows[0].remaining,
      resetAt: result.rows[0].reset_at,
    };
  }

  /**
   * Reset limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    await query(
      `DELETE FROM rate_limits WHERE identifier = $1`,
      [identifier]
    );
  }

  /**
   * Cleanup old entries
   */
  async cleanup(): Promise<number> {
    const result = await query(
      `DELETE FROM rate_limits
       WHERE window_start < NOW() - INTERVAL '1 day'`
    );
    return result.rowCount || 0;
  }
}

/**
 * Job queue - replaces in-memory job queues
 */
export class JobQueue {
  /**
   * Initialize job queue table
   */
  async initialize(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS job_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_type VARCHAR(100) NOT NULL,
        job_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        priority INTEGER DEFAULT 5,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        scheduled_for TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        failed_at TIMESTAMP,
        error_message TEXT,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_queue(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON job_queue(scheduled_for);
      CREATE INDEX IF NOT EXISTS idx_jobs_priority ON job_queue(priority DESC, scheduled_for ASC);
      CREATE INDEX IF NOT EXISTS idx_jobs_type ON job_queue(job_type);
    `);
  }

  /**
   * Add job to queue
   */
  async addJob(
    jobType: string,
    jobData: any,
    options: {
      priority?: number;
      scheduledFor?: Date;
      maxAttempts?: number;
    } = {}
  ): Promise<string> {
    const result = await query<{ id: string }>(
      `INSERT INTO job_queue (job_type, job_data, priority, scheduled_for, max_attempts)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        jobType,
        JSON.stringify(jobData),
        options.priority || 5,
        options.scheduledFor || new Date(),
        options.maxAttempts || 3,
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Get next job to process
   */
  async getNextJob(): Promise<any | null> {
    const result = await query(
      `UPDATE job_queue
       SET status = 'processing',
           started_at = NOW(),
           updated_at = NOW()
       WHERE id = (
         SELECT id FROM job_queue
         WHERE status = 'pending'
           AND scheduled_for <= NOW()
           AND attempts < max_attempts
         ORDER BY priority DESC, scheduled_for ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       RETURNING *`
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      job_data: result.rows[0].job_data,
    };
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, result?: any): Promise<void> {
    await query(
      `UPDATE job_queue
       SET status = 'completed',
           completed_at = NOW(),
           updated_at = NOW(),
           result = $2
       WHERE id = $1`,
      [jobId, result ? JSON.stringify(result) : null]
    );
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: string): Promise<void> {
    await query(
      `UPDATE job_queue
       SET status = CASE
           WHEN attempts + 1 >= max_attempts THEN 'failed'
           ELSE 'pending'
         END,
         attempts = attempts + 1,
         failed_at = CASE
           WHEN attempts + 1 >= max_attempts THEN NOW()
           ELSE NULL
         END,
         error_message = $2,
         updated_at = NOW(),
         scheduled_for = CASE
           WHEN attempts + 1 < max_attempts
           THEN NOW() + (POWER(2, attempts) * INTERVAL '1 minute')
           ELSE scheduled_for
         END
       WHERE id = $1`,
      [jobId, error]
    );
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<any | null> {
    const result = await query(
      `SELECT * FROM job_queue WHERE id = $1`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  /**
   * Cleanup completed jobs older than N days
   */
  async cleanup(daysOld = 7): Promise<number> {
    const result = await query(
      `DELETE FROM job_queue
       WHERE status IN ('completed', 'failed')
         AND updated_at < NOW() - INTERVAL '${daysOld} days'`
    );
    return result.rowCount || 0;
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM job_queue
    `);

    return result.rows[0];
  }
}

/**
 * Feature flags - Postgres-backed feature toggles
 */
export class FeatureFlagStore {
  /**
   * Initialize feature flags table
   */
  async initialize(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        flag_name VARCHAR(255) PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT false,
        description TEXT,
        rollout_percentage INTEGER DEFAULT 0, -- 0-100
        enabled_for_users TEXT[] DEFAULT '{}',
        enabled_for_tenants TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_flags_enabled ON feature_flags(is_enabled);
    `);
  }

  /**
   * Check if feature is enabled
   */
  async isEnabled(
    flagName: string,
    context?: { userId?: string; tenantId?: string }
  ): Promise<boolean> {
    const result = await query(
      `SELECT
         is_enabled,
         rollout_percentage,
         enabled_for_users,
         enabled_for_tenants
       FROM feature_flags
       WHERE flag_name = $1`,
      [flagName]
    );

    if (result.rows.length === 0) {
      return false; // Default to disabled if flag doesn't exist
    }

    const flag = result.rows[0];

    // Check if globally enabled
    if (flag.is_enabled) {
      return true;
    }

    // Check user-specific enable
    if (context?.userId && flag.enabled_for_users.includes(context.userId)) {
      return true;
    }

    // Check tenant-specific enable
    if (context?.tenantId && flag.enabled_for_tenants.includes(context.tenantId)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rollout_percentage > 0 && context?.userId) {
      const hash = this.hashString(context.userId + flagName);
      const bucket = hash % 100;
      return bucket < flag.rollout_percentage;
    }

    return false;
  }

  /**
   * Set feature flag
   */
  async setFlag(
    flagName: string,
    isEnabled: boolean,
    options?: {
      description?: string;
      rolloutPercentage?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await query(
      `INSERT INTO feature_flags (flag_name, is_enabled, description, rollout_percentage, metadata, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (flag_name)
       DO UPDATE SET
         is_enabled = $2,
         description = COALESCE($3, feature_flags.description),
         rollout_percentage = COALESCE($4, feature_flags.rollout_percentage),
         metadata = COALESCE($5, feature_flags.metadata),
         updated_at = NOW()`,
      [
        flagName,
        isEnabled,
        options?.description || null,
        options?.rolloutPercentage ?? null,
        options?.metadata ? JSON.stringify(options.metadata) : null,
      ]
    );
  }

  /**
   * Simple hash function for rollout bucketing
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Initialize all stores
 */
export async function initializePersistenceLayer(): Promise<void> {
  console.log('🔄 Initializing Postgres-backed persistence layer...');

  const stores = [
    new SessionStore(),
    new CacheStore(),
    new RateLimitStore(),
    new JobQueue(),
    new FeatureFlagStore(),
  ];

  for (const store of stores) {
    await store.initialize();
  }

  console.log('✅ Persistence layer initialized');
}

// Export singleton instances
export const sessionStore = new SessionStore();
export const cacheStore = new CacheStore();
export const rateLimitStore = new RateLimitStore();
export const jobQueue = new JobQueue();
export const featureFlagStore = new FeatureFlagStore();
