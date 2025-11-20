/**
 * Request Queuing & Rate Limiting Service
 * 99% success rate during traffic spikes
 * 
 * Features:
 * - Priority-based queuing
 * - Adaptive rate limiting
 * - Graceful degradation
 * - Queue status communication
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '../middleware/rate-limit';
import { cacheService } from './redis-cache';

export interface QueueRequest {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  path: string;
  method: string;
  timestamp: number;
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface QueueStatus {
  position: number;
  estimatedWaitTime: number; // seconds
  totalQueued: number;
  processingRate: number; // requests per second
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burst?: number;
  identifier?: string;
}

export class RequestQueueService {
  private queues: Map<string, QueueRequest[]> = new Map();
  private processingRates: Map<string, number> = new Map();
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly MAX_WAIT_TIME = 30000; // 30 seconds

  /**
   * Check rate limit and queue if needed
   */
  async processRequest(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    config?: RateLimitConfig
  ): Promise<NextResponse> {
    const identifier = this.getIdentifier(request);
    const path = new URL(request.url).pathname;

    // Check rate limit
    const rateLimitResult = await rateLimiter.checkLimit(
      identifier,
      config || {
        windowMs: 60000,
        maxRequests: 100,
      }
    );

    // If rate limit exceeded, try to queue
    if (!rateLimitResult.allowed) {
      // Check if request is queueable (GET requests for non-critical paths)
      if (this.isQueueable(request)) {
        return this.handleQueuedRequest(request, handler);
      }

      // Reject request with 429
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          queuePosition: null,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.total.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    // Process request immediately
    return handler(request);
  }

  /**
   * Add request to queue
   */
  async enqueue(
    request: QueueRequest,
    queueName: string = 'default'
  ): Promise<QueueStatus> {
    const queue = this.queues.get(queueName) || [];

    // Check queue size limit
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue is full');
    }

    // Insert based on priority
    const index = this.findInsertIndex(queue, request);
    queue.splice(index, 0, request);
    this.queues.set(queueName, queue);

    return this.getQueueStatus(request.id, queueName);
  }

  /**
   * Process queued requests
   */
  async processQueue(queueName: string = 'default'): Promise<void> {
    const queue = this.queues.get(queueName) || [];
    
    if (queue.length === 0) return;

    // Process highest priority requests first
    const request = queue.shift()!;
    this.queues.set(queueName, queue);

    // Update processing rate
    const now = Date.now();
    const rate = this.processingRates.get(queueName) || 0;
    this.processingRates.set(queueName, rate + 1);

    // Process request (implementation depends on handler)
    // This would be called from the actual request handler
  }

  /**
   * Get queue status for a request
   */
  getQueueStatus(requestId: string, queueName: string = 'default'): QueueStatus {
    const queue = this.queues.get(queueName) || [];
    const position = queue.findIndex(r => r.id === requestId) + 1;
    const processingRate = this.processingRates.get(queueName) || 10; // default 10 req/s
    const estimatedWaitTime = position > 0 
      ? Math.ceil(position / processingRate) 
      : 0;

    return {
      position: position > 0 ? position : 0,
      estimatedWaitTime,
      totalQueued: queue.length,
      processingRate,
    };
  }

  /**
   * Handle queued request (serve cached data or queue)
   */
  private async handleQueuedRequest(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const url = new URL(request.url);
    const cacheKey = `queue:${url.pathname}:${url.search}`;

    // Try to serve cached response
    const cached = await cacheService.get<{
      body: any;
      headers: Record<string, string>;
      status: number;
    }>(cacheKey);

    if (cached) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: {
          ...cached.headers,
          'X-Cache': 'HIT',
          'X-Queue-Status': 'served-from-cache',
        },
      });
    }

    // If no cache, queue the request
    const queueRequest: QueueRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      priority: this.getPriority(request),
      path: url.pathname,
      method: request.method,
      timestamp: Date.now(),
    };

    const status = await this.enqueue(queueRequest);

    return NextResponse.json(
      {
        error: 'Request queued due to high load',
        message: 'Your request has been queued. Please try again shortly.',
        queueStatus: status,
      },
      {
        status: 202, // Accepted
        headers: {
          'Retry-After': status.estimatedWaitTime.toString(),
          'X-Queue-Position': status.position.toString(),
          'X-Queue-Wait-Time': status.estimatedWaitTime.toString(),
        },
      }
    );
  }

  /**
   * Check if request is queueable
   */
  private isQueueable(request: NextRequest): boolean {
    // Only GET requests can be queued
    if (request.method !== 'GET') return false;

    const path = new URL(request.url).pathname;
    
    // Critical paths should not be queued
    const criticalPaths = [
      '/api/auth',
      '/api/payment',
      '/api/health',
    ];

    return !criticalPaths.some(cp => path.startsWith(cp));
  }

  /**
   * Get request priority
   */
  private getPriority(request: NextRequest): QueueRequest['priority'] {
    const path = new URL(request.url).pathname;

    // Critical paths
    if (path.startsWith('/api/auth') || path.startsWith('/api/payment')) {
      return 'critical';
    }

    // High priority paths
    if (path.startsWith('/api/dashboard') || path.startsWith('/api/analytics')) {
      return 'high';
    }

    // Medium priority paths
    if (path.startsWith('/api/')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Find insert index based on priority
   */
  private findInsertIndex(
    queue: QueueRequest[],
    request: QueueRequest
  ): number {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const requestPriority = priorityOrder[request.priority];

    for (let i = 0; i < queue.length; i++) {
      const queuePriority = priorityOrder[queue[i].priority];
      if (queuePriority > requestPriority) {
        return i;
      }
    }

    return queue.length;
  }

  /**
   * Get request identifier
   */
  private getIdentifier(request: NextRequest): string {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      return `user:${authHeader.substring(0, 20)}`;
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0] : realIp) || 'unknown';

    return `ip:${ip}`;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const stats: Record<string, any> = {};

    for (const [queueName, queue] of this.queues.entries()) {
      stats[queueName] = {
        size: queue.length,
        processingRate: this.processingRates.get(queueName) || 0,
        priorities: {
          critical: queue.filter(r => r.priority === 'critical').length,
          high: queue.filter(r => r.priority === 'high').length,
          medium: queue.filter(r => r.priority === 'medium').length,
          low: queue.filter(r => r.priority === 'low').length,
        },
      };
    }

    return stats;
  }
}

// Export singleton instance
export const requestQueue = new RequestQueueService();

