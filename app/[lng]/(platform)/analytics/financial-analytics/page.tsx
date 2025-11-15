'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, 
  PieChart, Calendar, Target, AlertTriangle
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'expense' | 'profit' | 'cash';
}

interface Forecast {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: number;
}

export default function FinancialAnalyticsPage() {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialAnalytics();
  }, []);

  const fetchFinancialAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/financial-analytics', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setMetrics(data.metrics || []);
      setForecasts(data.forecasts || []);
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      // Mock data
      setMetrics([
        {
          id: 'revenue', name: 'Monthly Revenue', value: 125000, previousValue: 118000,
          change: 7000, changePercent: 5.9, trend: 'up', category: 'revenue'
        },
        {
          id: 'expenses', name: 'Monthly Expenses', value: 85000, previousValue: 92000,
          change: -7000, changePercent: -7.6, trend: 'down', category: 'expense'
        },
        {
          id: 'profit', name: 'Net Profit', value: 40000, previousValue: 26000,
          change: 14000, changePercent: 53.8, trend: 'up', category: 'profit'
        },
        {
          id: 'cash', name: 'Cash Flow', value: 65000, previousValue: 58000,
          change: 7000, changePercent: 12.1, trend: 'up', category: 'cash'
        }
      ]);

      setForecasts([
        { period: 'Feb 2024', revenue: 132000, expenses: 87000, profit: 45000, confidence: 85 },
        { period: 'Mar 2024', revenue: 138000, expenses: 89000, profit: 49000, confidence: 78 },
        { period: 'Apr 2024', revenue: 145000, expenses: 92000, profit: 53000, confidence: 72 },
        { period: 'May 2024', revenue: 152000, expenses: 95000, profit: 57000, confidence: 68 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'revenue': return DollarSign;
      case 'expense': return TrendingDown;
      case 'profit': return TrendingUp;
      case 'cash': return BarChart3;
      default: return DollarSign;
    }
  };

  const getMetricColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-blue-600';
      case 'expense': return 'text-red-600';
      case 'profit': return 'text-green-600';
      case 'cash': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <LoadingState message="Loading financial analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-gray-600">Advanced financial forecasting and trend analysis</p>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const IconComponent = getMetricIcon(metric.category);
          const colorClass = getMetricColor(metric.category);
          
          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <IconComponent className={`h-4 w-4 ${colorClass}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colorClass}`}>
                  ${metric.value.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className={`flex items-center space-x-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                     metric.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : 
                     <BarChart3 className="h-3 w-3" />}
                    <span className="text-xs font-medium">
                      {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500">
                    {metric.change > 0 ? '+' : ''}${metric.change.toLocaleString()} change
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Forecasting */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Revenue Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{forecast.period}</div>
                    <div className="text-sm text-gray-500">
                      Confidence: {forecast.confidence}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      ${forecast.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Profit: ${forecast.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium">Operating Expenses</div>
                  <div className="text-sm text-gray-500">45% of total</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">$38,250</div>
                  <Badge variant="outline">-5% vs last month</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium">Marketing & Sales</div>
                  <div className="text-sm text-gray-500">25% of total</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">$21,250</div>
                  <Badge variant="secondary">+8% vs last month</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium">Technology & Infrastructure</div>
                  <div className="text-sm text-gray-500">20% of total</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">$17,000</div>
                  <Badge variant="outline">+2% vs last month</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Other Expenses</div>
                  <div className="text-sm text-gray-500">10% of total</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-600">$8,500</div>
                  <Badge variant="outline">-12% vs last month</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>AI-Powered Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Revenue Growth Opportunity</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Based on current trends, increasing marketing spend by 15% could boost revenue by $18,000 next month.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Cash Flow Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Adjusting payment terms could improve cash flow by $12,000 and reduce working capital needs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Cost Control Alert</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Technology expenses have increased 15% over 3 months. Review subscriptions and optimize costs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Profit Margin Improvement</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Current profit margin of 32% is above industry average. Maintain focus on high-value services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
