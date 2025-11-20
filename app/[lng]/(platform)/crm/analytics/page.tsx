/**
 * CRM Analytics Page
 * Advanced analytics and insights for CRM module with recharts visualizations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, 
  Users, Building2, Activity, Phone, Mail, Target, ArrowUp, ArrowDown
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
  monthlyTrend: Array<{ month: string; customer_count: number; total_value: number }>;
  statusDistribution: Array<{ status: string; count: number; total_value: number; avg_value: number }>;
  tierDistribution: Array<{ tier: string; count: number; total_value: number; avg_value: number }>;
  activityDistribution: Array<{ type: string; count: number; completed_count: number }>;
  dealStageDistribution: Array<{ stage: string; count: number; total_value: number; avg_probability: number }>;
  topCustomers: Array<{ id: string; name: string; company: string; total_value: number; status: string; tier: string }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function CRMAnalyticsPage() {
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

      const response = await fetch(`/api/crm/analytics?${params}`, {
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

    const totalCustomers = analytics.monthlyTrend.reduce((sum, m) => sum + m.customer_count, 0);
    const totalValue = analytics.monthlyTrend.reduce((sum, m) => sum + m.total_value, 0);
    const avgCustomerValue = totalCustomers > 0 ? totalValue / totalCustomers : 0;
    const activeCustomers = analytics.statusDistribution.find(s => s.status === 'active')?.count || 0;
    const activeRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    const prevMonthValue = analytics.monthlyTrend.length > 1 
      ? analytics.monthlyTrend[1].total_value 
      : analytics.monthlyTrend[0]?.total_value || 0;
    const currentMonthValue = analytics.monthlyTrend[0]?.total_value || 0;
    const valueGrowth = prevMonthValue > 0 
      ? ((currentMonthValue - prevMonthValue) / prevMonthValue) * 100 
      : 0;

    return {
      totalCustomers,
      totalValue,
      avgCustomerValue,
      activeCustomers,
      activeRate,
      valueGrowth
    };
  }, [analytics]);

  if (loading) {
    return <LoadingState message={locale === 'ar' ? 'جاري تحميل تحليلات CRM...' : 'Loading CRM analytics...'} />;
  }

  // Prepare chart data
  const monthlyChartData = analytics?.monthlyTrend.map(m => ({
    month: m.month.substring(5),
    customers: m.customer_count,
    value: m.total_value,
  })) || [];

  const statusChartData = analytics?.statusDistribution.map((s, idx) => ({
    name: s.status,
    count: s.count,
    value: s.total_value,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const tierChartData = analytics?.tierDistribution.map((t, idx) => ({
    name: t.tier,
    count: t.count,
    value: t.total_value,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const activityChartData = analytics?.activityDistribution.map((a, idx) => ({
    type: a.type,
    total: a.count,
    completed: a.completed_count,
    pending: a.count - a.completed_count,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const dealStageChartData = analytics?.dealStageDistribution.map((d, idx) => ({
    stage: d.stage,
    count: d.count,
    value: d.total_value,
    avgProbability: d.avg_probability,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'من تاريخ' : 'From Date'}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'إلى تاريخ' : 'To Date'}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {locale === 'ar' ? 'جميع العملاء المسجلين' : 'All registered customers'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'إجمالي القيمة' : 'Total Value'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.totalValue)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {kpis.valueGrowth >= 0 ? (
                  <ArrowUp className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600" />
                )}
                <span className={kpis.valueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(kpis.valueGrowth).toFixed(1)}%
                </span>
                {locale === 'ar' ? 'من الشهر السابق' : 'from previous month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'متوسط قيمة العميل' : 'Avg Customer Value'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.avgCustomerValue)}</div>
              <p className="text-xs text-muted-foreground">
                {locale === 'ar' ? 'متوسط القيمة لكل عميل' : 'Average value per customer'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'نسبة العملاء النشطين' : 'Active Rate'}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.activeRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {kpis.activeCustomers} {locale === 'ar' ? 'عميل نشط' : 'active customers'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Customer Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {locale === 'ar' ? 'اتجاه العملاء الشهري' : 'Monthly Customer Trend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="customers"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name={locale === 'ar' ? 'عدد العملاء' : 'Customers'}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                name={locale === 'ar' ? 'القيمة' : 'Value'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {locale === 'ar' ? 'توزيع حالة العملاء' : 'Customer Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {locale === 'ar' ? 'توزيع مستويات العملاء' : 'Customer Tier Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {locale === 'ar' ? 'توزيع الأنشطة' : 'Activity Distribution'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name={locale === 'ar' ? 'مكتمل' : 'Completed'} />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name={locale === 'ar' ? 'معلق' : 'Pending'} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deal Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {locale === 'ar' ? 'توزيع مراحل الصفقات' : 'Deal Stage Distribution'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dealStageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name={locale === 'ar' ? 'عدد الصفقات' : 'Deal Count'} />
              <Bar yAxisId="right" dataKey="value" fill="#10b981" name={locale === 'ar' ? 'القيمة' : 'Value'} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Customers */}
      {analytics?.topCustomers && analytics.topCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {locale === 'ar' ? 'أفضل العملاء حسب القيمة' : 'Top Customers by Value'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(customer.total_value)}</div>
                    <div className="text-sm text-gray-500">
                      {customer.tier} • {customer.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

