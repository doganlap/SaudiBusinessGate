"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface FinancialMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartData {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface DepartmentData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // Index signature for recharts compatibility
}

export function FinancialAnalytics() {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load financial metrics
      const metricsRes = await fetch('/api/finance/analytics/metrics', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!metricsRes.ok) throw new Error('Failed to fetch financial metrics');
      
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.data || metricsData.metrics || []);

      // Load chart data
      const chartRes = await fetch('/api/finance/analytics/trends', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!chartRes.ok) throw new Error('Failed to fetch trend data');
      
      const chartDataResult = await chartRes.json();
      setChartData(chartDataResult.data || chartDataResult.trends || []);

      // Load department data
      const deptRes = await fetch('/api/finance/analytics/departments', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!deptRes.ok) throw new Error('Failed to fetch department data');
      
      const deptDataResult = await deptRes.json();
      setDepartmentData(deptDataResult.data || deptDataResult.departments || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      // Fallback demo data
      setMetrics([
        { name: 'Revenue', value: 1250000, change: 12.5, trend: 'up' },
        { name: 'Expenses', value: 875000, change: -3.2, trend: 'down' },
        { name: 'Profit Margin', value: 30, change: 8.7, trend: 'up' },
        { name: 'Cash Flow', value: 185000, change: 15.3, trend: 'up' }
      ]);
      
      setChartData([
        { name: 'Jan', revenue: 185000, expenses: 125000, profit: 60000 },
        { name: 'Feb', revenue: 198000, expenses: 132000, profit: 66000 },
        { name: 'Mar', revenue: 225000, expenses: 145000, profit: 80000 },
        { name: 'Apr', revenue: 210000, expenses: 138000, profit: 72000 },
        { name: 'May', revenue: 235000, expenses: 152000, profit: 83000 },
        { name: 'Jun', revenue: 248000, expenses: 158000, profit: 90000 }
      ]);
      
      setDepartmentData([
        { name: 'Sales', value: 35, color: '#3B82F6' },
        { name: 'Marketing', value: 25, color: '#10B981' },
        { name: 'Operations', value: 20, color: '#F59E0B' },
        { name: 'R&D', value: 15, color: '#EF4444' },
        { name: 'Admin', value: 5, color: '#8B5CF6' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />;
      case 'expenses':
        return <TrendingDown className="h-4 w-4" />;
      case 'profit margin':
        return <DollarSign className="h-4 w-4" />;
      case 'cash flow':
        return <Users className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                {getMetricIcon(metric.name)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.name === 'Profit Margin' ? `${metric.value}%` : `$${metric.value.toLocaleString()}`}
              </div>
              <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(metric.change)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses Trend</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" name="Profit" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Revenue contribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Profit Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Analysis</CardTitle>
            <CardDescription>Profit margins and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="profit" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Monthly revenue composition</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button>
          <LineChartIcon className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Customize Analytics
        </Button>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
}