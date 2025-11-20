/**
 * HR Analytics Page
 * Advanced analytics and insights for HR module with recharts visualizations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, 
  Users, Clock, Building2, Calendar, Activity, UserCheck, ArrowUp, ArrowDown
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
  departmentDistribution: Array<{ department: string; employee_count: number; avg_salary: number; total_salary: number }>;
  monthlyAttendanceTrend: Array<{ month: string; employees_count: number; present_count: number; absent_count: number; late_count: number; avg_hours: number }>;
  attendanceStatusDistribution: Array<{ status: string; count: number; avg_hours: number; employees_count: number }>;
  departmentAttendance: Array<{ department: string; employees_count: number; present_count: number; absent_count: number; avg_hours: number; attendance_rate: number }>;
  monthlyPayrollTrend: Array<{ month: string; employees_count: number; total_gross: number; total_net: number; avg_net_salary: number; total_overtime: number; total_bonuses: number; total_deductions: number }>;
  employeeStatusDistribution: Array<{ status: string; count: number; avg_salary: number; total_salary: number }>;
  topDepartmentsByPayroll: Array<{ department: string; employees_count: number; total_gross: number; total_net: number; avg_net_salary: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function HRAnalyticsPage() {
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

      const response = await fetch(`/api/hr/analytics?${params}`, {
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

    const totalEmployees = analytics.departmentDistribution.reduce((sum, d) => sum + d.employee_count, 0);
    const totalPayroll = analytics.monthlyPayrollTrend.reduce((sum, m) => sum + m.total_net, 0);
    const avgAttendanceRate = analytics.departmentAttendance.length > 0
      ? analytics.departmentAttendance.reduce((sum, d) => sum + d.attendance_rate, 0) / analytics.departmentAttendance.length
      : 0;
    const totalDepartments = analytics.departmentDistribution.length;

    const prevMonthPayroll = analytics.monthlyPayrollTrend.length > 1 
      ? analytics.monthlyPayrollTrend[1].total_net 
      : analytics.monthlyPayrollTrend[0]?.total_net || 0;
    const currentMonthPayroll = analytics.monthlyPayrollTrend[0]?.total_net || 0;
    const payrollGrowth = prevMonthPayroll > 0 
      ? ((currentMonthPayroll - prevMonthPayroll) / prevMonthPayroll) * 100 
      : 0;

    return {
      totalEmployees,
      totalPayroll,
      avgAttendanceRate,
      totalDepartments,
      payrollGrowth
    };
  }, [analytics]);

  if (loading) {
    return <LoadingState message="Loading HR analytics..." />;
  }

  // Prepare chart data
  const attendanceChartData = analytics?.monthlyAttendanceTrend.map(m => ({
    month: m.month.substring(5),
    present: m.present_count,
    absent: m.absent_count,
    late: m.late_count,
    attendanceRate: m.present_count + m.absent_count > 0 
      ? (m.present_count / (m.present_count + m.absent_count)) * 100 
      : 0,
    avgHours: m.avg_hours
  })) || [];

  const departmentChartData = analytics?.departmentDistribution.map((d, idx) => ({
    name: d.department,
    employees: d.employee_count,
    avgSalary: d.avg_salary,
    totalSalary: d.total_salary,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const payrollChartData = analytics?.monthlyPayrollTrend.map(m => ({
    month: m.month.substring(5),
    gross: m.total_gross,
    net: m.total_net,
    overtime: m.total_overtime,
    bonuses: m.total_bonuses,
    deductions: m.total_deductions
  })) || [];

  const attendanceStatusChartData = analytics?.attendanceStatusDistribution.map((s, idx) => ({
    name: s.status.replace('_', ' '),
    count: s.count,
    avgHours: s.avg_hours,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  const departmentAttendanceChartData = analytics?.departmentAttendance.map((d, idx) => ({
    name: d.department,
    rate: d.attendance_rate,
    employees: d.employees_count,
    present: d.present_count,
    absent: d.absent_count,
    fill: COLORS[idx % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Analytics</h1>
          <p className="text-gray-600">Advanced insights and analytics for human resources</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{kpis.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.totalPayroll)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {kpis.payrollGrowth !== 0 && (
                <div className="mt-2 flex items-center text-sm">
                  {kpis.payrollGrowth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={kpis.payrollGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(kpis.payrollGrowth).toFixed(1)}%
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
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold">{kpis.avgAttendanceRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold">{kpis.totalDepartments}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Building2 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Status</p>
                  <p className="text-2xl font-bold">
                    {analytics?.employeeStatusDistribution.find(s => s.status === 'active')?.count || 0}
                  </p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Attendance Trend - Area Chart */}
      {attendanceChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={attendanceChartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="present" 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                  name="Present"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#ef4444" 
                  fillOpacity={1}
                  fill="url(#colorAbsent)"
                  name="Absent"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="attendanceRate" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Attendance Rate %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution - Pie Chart */}
        {departmentChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Employee Distribution by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="employees"
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Attendance Status Distribution - Bar Chart */}
        {attendanceStatusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Attendance Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceStatusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Count" />
                  <Bar dataKey="avgHours" fill="#3b82f6" name="Avg Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Payroll Trend - Line Chart */}
      {payrollChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Payroll Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={payrollChartData}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#colorNet)"
                  name="Net Payroll"
                />
                <Line 
                  type="monotone" 
                  dataKey="overtime" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Overtime"
                />
                <Line 
                  type="monotone" 
                  dataKey="bonuses" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Bonuses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Department Attendance Rates - Bar Chart */}
      {departmentAttendanceChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Department Attendance Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentAttendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    name === 'rate' ? `${value.toFixed(1)}%` : value
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="rate" fill="#3b82f6" name="Attendance Rate %" />
                <Bar yAxisId="right" dataKey="present" fill="#10b981" name="Present" />
                <Bar yAxisId="right" dataKey="absent" fill="#ef4444" name="Absent" />
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
            <p className="text-gray-500">Analytics will appear here once you have HR data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
