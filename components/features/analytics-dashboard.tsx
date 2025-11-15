'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3,
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'degraded' | 'down';
  checks: {
    responseTime: { status: string; value: string; threshold: string };
    errorRate: { status: string; value: string; threshold: string };
    requestCount: { status: string; value: number };
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}

export function AnalyticsDashboard({ lng = 'en' }: { lng?: string }) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const isArabic = lng === 'ar';

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health/performance');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'degraded':
      case 'fail':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'degraded':
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!healthStatus) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {isArabic ? 'حالة النظام' : 'System Status'}
            </CardTitle>
            <Badge className={getStatusColor(healthStatus.status)}>
              {healthStatus.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Response Time */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              {getStatusIcon(healthStatus.checks.responseTime.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isArabic ? 'وقت الاستجابة' : 'Response Time'}
                </p>
                <p className="text-2xl font-bold">
                  {healthStatus.checks.responseTime.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'الحد الأقصى' : 'Threshold'}: {healthStatus.checks.responseTime.threshold}
                </p>
              </div>
            </div>

            {/* Error Rate */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              {getStatusIcon(healthStatus.checks.errorRate.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isArabic ? 'معدل الأخطاء' : 'Error Rate'}
                </p>
                <p className="text-2xl font-bold">
                  {healthStatus.checks.errorRate.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'الحد الأقصى' : 'Threshold'}: {healthStatus.checks.errorRate.threshold}
                </p>
              </div>
            </div>

            {/* Request Count */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              {getStatusIcon(healthStatus.checks.requestCount.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isArabic ? 'عدد الطلبات' : 'Request Count'}
                </p>
                <p className="text-2xl font-bold">
                  {healthStatus.checks.requestCount.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'آخر 1000 طلب' : 'Last 1000 requests'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {isArabic ? 'مقاييس الأداء' : 'Performance Metrics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  {isArabic ? 'متوسط الاستجابة' : 'Average Response'}
                </p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {healthStatus.performance.averageResponseTime.toFixed(2)}ms
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {healthStatus.performance.averageResponseTime < 500 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {isArabic ? 'ممتاز' : 'Excellent'}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-500">
                      {isArabic ? 'يحتاج تحسين' : 'Needs improvement'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">P95 {isArabic ? 'الاستجابة' : 'Response'}</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {healthStatus.performance.p95ResponseTime.toFixed(2)}ms
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? '95٪ من الطلبات' : '95% of requests'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">P99 {isArabic ? 'الاستجابة' : 'Response'}</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {healthStatus.performance.p99ResponseTime.toFixed(2)}ms
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? '99٪ من الطلبات' : '99% of requests'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>{isArabic ? 'يتم التحديث كل 30 ثانية' : 'Updates every 30 seconds'}</span>
        </div>
        <span>{new Date().toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US')}</span>
      </div>
    </div>
  );
}
