/**
 * Procurement Analytics Page
 * Advanced analytics and insights for procurement module with recharts visualizations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, 
  Package, Building2, Calendar, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  categorySpending: Array<{ category: string; order_count: number; total_spend: number; average_order: number }>;
  vendorSpending: Array<{ vendor_name: string; order_count: number; total_spend: number; average_order: number }>;
  monthlyTrend: Array<{ month: string; order_count: number; total_spend: number }>;
  statusDistribution: Array<{ status: string; count: number; total_value: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ProcurementAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateFrom, dateTo]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      });

      const response = await fetch(`/api/procurement/analytics?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();

      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!analytics) return null;

    const totalSpend = analytics.monthlyTrend.reduce((sum, m) => sum + m.total_spend, 0);
    const totalOrders = analytics.monthlyTrend.reduce((sum, m) => sum + m.order_count, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
    const activeVendors = analytics.vendorSpending.length;
    
    const prevMonthSpend = analytics.monthlyTrend.length > 1 
      ? analytics.monthlyTrend[1].total_spend 
      : analytics.monthlyTrend[0]?.total_spend || 0;
    const currentMonthSpend = analytics.monthlyTrend[0]?.total_spend || 0;
    const spendGrowth = prevMonthSpend > 0 
      ? ((currentMonthSpend - prevMonthSpend) / prevMonthSpend) * 100 
      : 0;

    return {
      totalSpend,
      totalOrders,
      avgOrderValue,
      activeVendors,
      spendGrowth
    };
  }, [analytics]);

  if (loading) {
    return <LoadingState message="Loading analytics..." />;
  }

  // Prepare chart data
  const monthlyChartData = analytics?.monthlyTrend.map(m => ({
    month: m.month.substring(5),
    spend: m.total_spend,
    orders: m.order_count
  })) || [];

  const categoryChartData = analytics?.categorySpending.map((c, idx) => ({
    name: c.category || 'Uncategorized',
    value: c.total_spend,
    orders: c.order_count,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const vendorChartData = analytics?.vendorSpending.slice(0, 10).map((v, idx) => ({
    name: v.vendor_name,
    spend: v.total_spend,
    orders: v.order_count,
    avg: v.average_order,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const statusChartData = analytics?.statusDistribution.map((s, idx) => ({
    name: s.status.replace('-', ' '),
    count: s.count,
    value: s.total_value,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Analytics</h1>
          <p className="text-gray-600">Advanced insights and analytics for procurement</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <span>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.totalSpend)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {kpis.spendGrowth !== 0 && (
                <div className="mt-2 flex items-center text-sm">
                  {kpis.spendGrowth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={kpis.spendGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(kpis.spendGrowth).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{kpis.totalOrders}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.avgOrderValue)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold">{kpis.activeVendors}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Building2 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Spending Trend - Line Chart */}
      {monthlyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#3b82f6" 
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                  name="Spending"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        {categoryChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Vendors - Bar Chart */}
        {vendorChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Top Vendors by Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="spend" fill="#10b981" name="Spending" />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Status Distribution - Bar Chart */}
      {statusChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    name === 'value' ? formatCurrency(value) : value
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#f59e0b" name="Count" />
                <Bar yAxisId="right" dataKey="value" fill="#8b5cf6" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!analytics && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-500">Analytics will appear here once you have procurement data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
