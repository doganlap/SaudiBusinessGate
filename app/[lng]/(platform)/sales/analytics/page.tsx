/**
 * Sales Analytics Page
 * Advanced analytics and insights for sales module with recharts visualizations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, 
  Users, Target, Calendar, Activity, TrendingDown, ArrowUp, ArrowDown
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
  monthlyTrend: Array<{ month: string; deal_count: number; revenue: number }>;
  sourceRevenue: Array<{ source: string; deal_count: number; revenue: number; avg_deal_value: number }>;
  stageDistribution: Array<{ stage: string; count: number; total_value: number; avg_probability: number }>;
  topPerformers: Array<{ assigned_to: string; deal_count: number; won_count: number; revenue: number; avg_win_rate: number }>;
  conversionFunnel: Array<{ status: string; count: number; avg_score: number; total_value: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function SalesAnalyticsPage() {
  const params = useParams();
  const locale = (params?.lng as string) || 'en';
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

      const response = await fetch(`/api/sales/analytics?${params}`, {
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

    const totalRevenue = analytics.monthlyTrend.reduce((sum, m) => sum + m.revenue, 0);
    const totalDeals = analytics.monthlyTrend.reduce((sum, m) => sum + m.deal_count, 0);
    const avgDealValue = totalDeals > 0 ? totalRevenue / totalDeals : 0;
    const conversionRate = analytics.conversionFunnel.length > 0 
      ? analytics.conversionFunnel[analytics.conversionFunnel.length - 1].count / analytics.conversionFunnel[0].count * 100
      : 0;
    
    const prevMonthRevenue = analytics.monthlyTrend.length > 1 
      ? analytics.monthlyTrend[1].revenue 
      : analytics.monthlyTrend[0]?.revenue || 0;
    const currentMonthRevenue = analytics.monthlyTrend[0]?.revenue || 0;
    const revenueGrowth = prevMonthRevenue > 0 
      ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalDeals,
      avgDealValue,
      conversionRate,
      revenueGrowth
    };
  }, [analytics]);

  if (loading) {
    return <LoadingState message="Loading sales analytics..." />;
  }

  // Prepare chart data
  const monthlyChartData = analytics?.monthlyTrend.map(m => ({
    month: m.month.substring(5), // Show only MM
    revenue: m.revenue,
    deals: m.deal_count,
    avgValue: m.deal_count > 0 ? m.revenue / m.deal_count : 0
  })) || [];

  const sourceChartData = analytics?.sourceRevenue.map((s, idx) => ({
    name: s.source || 'Unknown',
    value: s.revenue,
    deals: s.deal_count,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const stageChartData = analytics?.stageDistribution.map((s, idx) => ({
    name: s.stage.replace('-', ' '),
    deals: s.count,
    value: s.total_value,
    probability: s.avg_probability,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const performersChartData = analytics?.topPerformers.slice(0, 5).map((p, idx) => ({
    name: p.assigned_to,
    revenue: p.revenue,
    winRate: p.deal_count > 0 ? (p.won_count / p.deal_count) * 100 : 0,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-gray-600">Advanced insights and analytics for sales performance</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {kpis.revenueGrowth !== 0 && (
                <div className="mt-2 flex items-center text-sm">
                  {kpis.revenueGrowth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={kpis.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(kpis.revenueGrowth).toFixed(1)}%
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
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold">{kpis.totalDeals}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deal Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.avgDealValue)}</p>
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
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{kpis.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Performers</p>
                  <p className="text-2xl font-bold">{analytics?.topPerformers.length || 0}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Revenue Trend - Area Chart */}
      {monthlyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="deals" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Deals"
                  yAxisId={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source - Pie Chart */}
        {sourceChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Revenue by Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceChartData.map((entry, index) => (
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

        {/* Stage Distribution - Bar Chart */}
        {stageChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Pipeline Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Total Value" />
                  <Bar dataKey="deals" fill="#3b82f6" name="Deals Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Performers - Bar Chart */}
      {performersChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performersChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    name === 'revenue' ? formatCurrency(value) : `${value.toFixed(1)}%`
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#f59e0b" name="Revenue" />
                <Bar yAxisId="right" dataKey="winRate" fill="#8b5cf6" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Conversion Funnel - Bar Chart */}
      {analytics?.conversionFunnel && analytics.conversionFunnel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lead Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.conversionFunnel.map((s, idx) => ({
                name: s.status,
                leads: s.count,
                value: s.total_value,
                score: s.avg_score
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" name="Leads" />
                <Bar yAxisId="right" dataKey="score" fill="#10b981" name="Avg Score" />
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
            <p className="text-gray-500">Analytics will appear here once you have sales data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
