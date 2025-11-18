/**
 * Performance Monitoring Middleware
 * Tracks API response times, database queries, and system metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackPerformance, trackError } from './analytics';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  country?: string;
}

const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 requests

export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;

      // Record metrics
      const metrics: PerformanceMetrics = {
        requestId,
        method: req.method,
        path: new URL(req.url).pathname,
        duration,
        statusCode: response.status,
        timestamp: new Date(),
        userAgent: req.headers.get('user-agent') || undefined,
        country: (req as any).geo?.country,
      };

      // Store metrics
      performanceMetrics.push(metrics);
      if (performanceMetrics.length > MAX_METRICS) {
        performanceMetrics.shift();
      }

      // Track slow requests (>1s)
      if (duration > 1000) {
        console.warn(`Slow request detected: ${metrics.path} took ${duration.toFixed(2)}ms`);
        trackPerformance('slow_request', duration);
      }

      // Track errors
      if (response.status >= 400) {
        trackError(
          `HTTP ${response.status}`,
          `${req.method} ${metrics.path}`,
          response.status >= 500
        );
      }

      // Add performance headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('Request error:', error);

      trackError(
        'Request Exception',
        error instanceof Error ? error.message : 'Unknown error',
        true
      );

      throw error;
    }
  };
}

// Get performance statistics
export function getPerformanceStats() {
  if (performanceMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null,
      fastestRequest: null,
      errorRate: 0,
      requestsByPath: {},
      requestsByStatus: {},
    };
  }

  const durations = performanceMetrics.map(m => m.duration);
  const errors = performanceMetrics.filter(m => m.statusCode >= 400);

  const requestsByPath = performanceMetrics.reduce((acc, m) => {
    acc[m.path] = (acc[m.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const requestsByStatus = performanceMetrics.reduce((acc, m) => {
    acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalRequests: performanceMetrics.length,
    averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
    slowestRequest: performanceMetrics.reduce((a, b) => a.duration > b.duration ? a : b),
    fastestRequest: performanceMetrics.reduce((a, b) => a.duration < b.duration ? a : b),
    errorRate: (errors.length / performanceMetrics.length) * 100,
    requestsByPath,
    requestsByStatus,
    p95ResponseTime: calculatePercentile(durations, 95),
    p99ResponseTime: calculatePercentile(durations, 99),
  };
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

// Reset metrics (useful for testing)
export function resetPerformanceMetrics() {
  performanceMetrics.length = 0;
}

// Export current metrics for monitoring dashboard
export function exportMetrics() {
  return {
    metrics: [...performanceMetrics],
    stats: getPerformanceStats(),
    timestamp: new Date().toISOString(),
  };
}

// Health check with performance data
export function getHealthStatus() {
  const stats = getPerformanceStats();
  
  return {
    status: stats.errorRate > 10 ? 'degraded' : stats.errorRate > 5 ? 'warning' : 'healthy',
    checks: {
      responseTime: {
        status: stats.averageResponseTime < 500 ? 'pass' : 'warning',
        value: `${stats.averageResponseTime.toFixed(2)}ms`,
        threshold: '500ms',
      },
      errorRate: {
        status: stats.errorRate < 5 ? 'pass' : stats.errorRate < 10 ? 'warning' : 'fail',
        value: `${stats.errorRate.toFixed(2)}%`,
        threshold: '5%',
      },
      requestCount: {
        status: 'pass',
        value: stats.totalRequests,
      },
    },
    performance: {
      averageResponseTime: stats.averageResponseTime,
      p95ResponseTime: stats.p95ResponseTime,
      p99ResponseTime: stats.p99ResponseTime,
    },
  };
}

export default {
  withPerformanceMonitoring,
  getPerformanceStats,
  resetPerformanceMetrics,
  exportMetrics,
  getHealthStatus,
};
