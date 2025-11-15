/**
 * Real-Time Analytics Dashboard Component
 * Provides live updates for financial metrics using WebSocket connections
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Users, Building2 } from 'lucide-react';
import { useWebSocket } from '@/lib/websocket/useWebSocket';

interface RealTimeMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  format: 'currency' | 'number' | 'percentage';
  icon: React.ReactNode;
  color: string;
}

interface RealTimeDashboardProps {
  metrics: RealTimeMetric[];
  channel?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function RealTimeDashboard({
  metrics: initialMetrics,
  channel = 'financial-metrics',
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className = ''
}: RealTimeDashboardProps) {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(initialMetrics);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket connection for real-time updates
  const { isConnected, data: realTimeData, send } = useWebSocket({
    channel,
    onMessage: (update) => {
      if (update.type === 'metrics-update') {
        setMetrics(prev => prev.map(metric => {
          const updatedMetric = update.data.find((m: any) => m.id === metric.id);
          return updatedMetric ? { ...metric, ...updatedMetric } : metric;
        }));
        setLastUpdated(new Date());
      }
    }
  });

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API call to fetch latest metrics
      // In a real application, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just update the timestamp
      setLastUpdated(new Date());
      
      // In a real app, you would fetch actual data:
      // const response = await fetch('/api/finance/metrics');
      // const data = await response.json();
      // setMetrics(data);
      
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Metrics</h3>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                metric.changeType === 'increase' ? 'text-success' : 'text-danger'
              }`}>
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(metric.value, metric.format)}
              </p>
            </div>

            {/* Real-time indicator */}
            {isConnected && (
              <div className="mt-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live updates</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection status banner */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-sm text-yellow-800">
              Connection lost. Showing last known values.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-configured financial metrics
export const financialMetrics: RealTimeMetric[] = [
  {
    id: 'total-revenue',
    title: 'Total Revenue',
    value: 1254300,
    change: 8.2,
    changeType: 'increase',
    format: 'currency',
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    color: 'bg-green-100',
  },
  {
    id: 'total-expenses',
    title: 'Total Expenses',
    value: 784500,
    change: -3.5,
    changeType: 'decrease',
    format: 'currency',
    icon: <TrendingDown className="h-5 w-5 text-red-600" />,
    color: 'bg-red-100',
  },
  {
    id: 'net-income',
    title: 'Net Income',
    value: 469800,
    change: 12.8,
    changeType: 'increase',
    format: 'currency',
    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-100',
  },
  {
    id: 'active-accounts',
    title: 'Active Accounts',
    value: 156,
    change: 5.2,
    changeType: 'increase',
    format: 'number',
    icon: <Users className="h-5 w-5 text-purple-600" />,
    color: 'bg-purple-100',
  },
  {
    id: 'pending-transactions',
    title: 'Pending Transactions',
    value: 23,
    change: -15.4,
    changeType: 'decrease',
    format: 'number',
    icon: <RefreshCw className="h-5 w-5 text-orange-600" />,
    color: 'bg-orange-100',
  },
  {
    id: 'account-balance',
    title: 'Account Balance',
    value: 2456700,
    change: 2.1,
    changeType: 'increase',
    format: 'currency',
    icon: <Building2 className="h-5 w-5 text-indigo-600" />,
    color: 'bg-indigo-100',
  },
];

// Hook for using real-time metrics
export const useRealTimeMetrics = (channel = 'financial-metrics') => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(financialMetrics);

  useWebSocket({
    channel,
    onMessage: (update) => {
      if (update.type === 'metrics-update') {
        setMetrics(prev => prev.map(metric => {
          const updatedMetric = update.data.find((m: any) => m.id === metric.id);
          return updatedMetric ? { ...metric, ...updatedMetric } : metric;
        }));
      }
    }
  });

  return metrics;
};