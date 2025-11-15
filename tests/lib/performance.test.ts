/**
 * Performance Monitoring Tests
 * Testing performance tracking and health checks
 */

import {
  withPerformanceMonitoring,
  getPerformanceStats,
  resetPerformanceMetrics,
  getHealthStatus,
} from '@/lib/monitoring/performance';
import { NextRequest, NextResponse } from 'next/server';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    resetPerformanceMetrics();
  });

  describe('withPerformanceMonitoring', () => {
    it('should track request duration', async () => {
      const mockHandler = async (req: NextRequest) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);
      const request = new NextRequest('http://localhost:3050/api/test');

      const response = await monitoredHandler(request);
      const stats = getPerformanceStats();

      expect(stats.totalRequests).toBe(1);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(100);
      expect(response.headers.has('X-Request-ID')).toBe(true);
      expect(response.headers.has('X-Response-Time')).toBe(true);
    });

    it('should track multiple requests', async () => {
      const mockHandler = async (req: NextRequest) => {
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);

      for (let i = 0; i < 5; i++) {
        const request = new NextRequest(`http://localhost:3050/api/test${i}`);
        await monitoredHandler(request);
      }

      const stats = getPerformanceStats();
      expect(stats.totalRequests).toBe(5);
    });

    it('should track error responses', async () => {
      const mockHandler = async (req: NextRequest) => {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);
      const request = new NextRequest('http://localhost:3050/api/notfound');

      await monitoredHandler(request);
      const stats = getPerformanceStats();

      expect(stats.requestsByStatus[404]).toBe(1);
    });
  });

  describe('getPerformanceStats', () => {
    it('should return empty stats when no metrics', () => {
      const stats = getPerformanceStats();

      expect(stats.totalRequests).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.errorRate).toBe(0);
    });

    it('should calculate error rate correctly', async () => {
      const successHandler = async (req: NextRequest) => {
        return NextResponse.json({ success: true });
      };

      const errorHandler = async (req: NextRequest) => {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
      };

      const monitoredSuccess = withPerformanceMonitoring(successHandler);
      const monitoredError = withPerformanceMonitoring(errorHandler);

      // 8 successful, 2 errors = 20% error rate
      for (let i = 0; i < 8; i++) {
        await monitoredSuccess(new NextRequest('http://localhost:3050/api/test'));
      }
      for (let i = 0; i < 2; i++) {
        await monitoredError(new NextRequest('http://localhost:3050/api/test'));
      }

      const stats = getPerformanceStats();
      expect(stats.errorRate).toBe(20);
    });

    it('should track requests by path', async () => {
      const mockHandler = async (req: NextRequest) => {
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);

      await monitoredHandler(new NextRequest('http://localhost:3050/api/test1'));
      await monitoredHandler(new NextRequest('http://localhost:3050/api/test1'));
      await monitoredHandler(new NextRequest('http://localhost:3050/api/test2'));

      const stats = getPerformanceStats();
      expect(stats.requestsByPath['/api/test1']).toBe(2);
      expect(stats.requestsByPath['/api/test2']).toBe(1);
    });

    it('should calculate percentiles correctly', async () => {
      const mockHandler = async (req: NextRequest) => {
        const delay = Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);

      for (let i = 0; i < 100; i++) {
        await monitoredHandler(new NextRequest('http://localhost:3050/api/test'));
      }

      const stats = getPerformanceStats();
      expect(stats.p95ResponseTime).toBeGreaterThan(0);
      expect(stats.p99ResponseTime).toBeGreaterThan(0);
      expect(stats.p99ResponseTime).toBeGreaterThanOrEqual(stats.p95ResponseTime);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status with good metrics', async () => {
      const mockHandler = async (req: NextRequest) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);

      for (let i = 0; i < 10; i++) {
        await monitoredHandler(new NextRequest('http://localhost:3050/api/test'));
      }

      const health = getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.checks.responseTime.status).toBe('pass');
      expect(health.checks.errorRate.status).toBe('pass');
    });

    it('should return degraded status with high error rate', async () => {
      const errorHandler = async (req: NextRequest) => {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
      };

      const monitoredHandler = withPerformanceMonitoring(errorHandler);

      for (let i = 0; i < 10; i++) {
        await monitoredHandler(new NextRequest('http://localhost:3050/api/test'));
      }

      const health = getHealthStatus();
      expect(health.status).toBe('degraded');
      expect(health.checks.errorRate.status).toBe('fail');
    });

    it('should include performance metrics in health status', async () => {
      const mockHandler = async (req: NextRequest) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return NextResponse.json({ success: true });
      };

      const monitoredHandler = withPerformanceMonitoring(mockHandler);
      await monitoredHandler(new NextRequest('http://localhost:3050/api/test'));

      const health = getHealthStatus();
      expect(health.performance).toHaveProperty('averageResponseTime');
      expect(health.performance).toHaveProperty('p95ResponseTime');
      expect(health.performance).toHaveProperty('p99ResponseTime');
    });
  });
});
