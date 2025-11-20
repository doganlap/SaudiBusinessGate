'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  ClipboardCheck, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function PMAnalyticsPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pm/projects', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const projects = await response.json();
      const projectArray = Array.isArray(projects) ? projects : [];

      // Calculate analytics from projects
      const statusCounts = projectArray.reduce((acc: any, project: any) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});

      const monthlyData = projectArray.reduce((acc: any, project: any) => {
        if (project.created_at) {
          const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
        }
        return acc;
      }, {});

      setAnalytics({
        statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
        })),
        monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({
          month,
          count,
        })),
        totalProjects: projectArray.length,
        activeProjects: projectArray.filter((p: any) => p.status === 'in_progress').length,
        completedProjects: projectArray.filter((p: any) => p.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'not_started': lng === 'ar' ? 'لم يبدأ' : 'Not Started',
      'in_progress': lng === 'ar' ? 'قيد التنفيذ' : 'In Progress',
      'on_hold': lng === 'ar' ? 'متوقف' : 'On Hold',
      'completed': lng === 'ar' ? 'مكتمل' : 'Completed',
      'cancelled': lng === 'ar' ? 'ملغي' : 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">{lng === 'ar' ? 'لا توجد بيانات' : 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lng === 'ar' ? 'تحليلات المشاريع' : 'Project Analytics'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'رؤى وإحصائيات المشاريع' : 'Project insights and statistics'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'إجمالي المشاريع' : 'Total Projects'}</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProjects}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'جميع المشاريع' : 'All projects'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'المشاريع النشطة' : 'Active Projects'}</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.activeProjects}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'قيد التنفيذ' : 'In progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'المشاريع المكتملة' : 'Completed'}</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.completedProjects}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'تم الإنجاز' : 'Finished'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.totalProjects > 0 
                ? ((analytics.completedProjects / analytics.totalProjects) * 100).toFixed(1) 
                : 0}%
            </div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'نسبة الإنجاز' : 'Success rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{lng === 'ar' ? 'توزيع الحالات' : 'Status Distribution'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${getStatusLabel(status)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{lng === 'ar' ? 'الاتجاه الشهري' : 'Monthly Trend'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{lng === 'ar' ? 'توزيع الحالات (عمودي)' : 'Status Distribution (Bar)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tickFormatter={getStatusLabel} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

