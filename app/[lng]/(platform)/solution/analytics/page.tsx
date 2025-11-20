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
  FileText, 
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function SolutionAnalyticsPage() {
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
      const response = await fetch('/api/solution/analytics', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data.success ? data.data : null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'intake': lng === 'ar' ? 'قيد الاستلام' : 'Intake',
      'qualified': lng === 'ar' ? 'مؤهل' : 'Qualified',
      'solution_design': lng === 'ar' ? 'تصميم الحل' : 'Solution Design',
      'proposal': lng === 'ar' ? 'اقتراح' : 'Proposal',
      'review': lng === 'ar' ? 'مراجعة' : 'Review',
      'approved': lng === 'ar' ? 'موافق عليه' : 'Approved',
      'submitted': lng === 'ar' ? 'تم الإرسال' : 'Submitted',
      'won': lng === 'ar' ? 'فاز' : 'Won',
      'lost': lng === 'ar' ? 'خسر' : 'Lost',
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
            {lng === 'ar' ? 'تحليلات الحلول و RFPs' : 'Solution & RFP Analytics'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'رؤى وإحصائيات RFPs والاقتراحات' : 'RFP and proposal insights and statistics'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'إجمالي RFPs' : 'Total RFPs'}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_rfps || 0}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'جميع RFPs' : 'All RFPs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'RFPs النشطة' : 'Active RFPs'}</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.active_rfps || 0}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'قيد المعالجة' : 'In progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'معدل الفوز' : 'Win Rate'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.win_rate ? analytics.win_rate.toFixed(1) : 0}%
            </div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'نسبة النجاح' : 'Success rate'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'متوسط النقاط' : 'Avg Score'}</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.avg_qualification_score ? analytics.avg_qualification_score.toFixed(0) : 0}
            </div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'نقاط التأهيل' : 'Qualification score'}
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
                  data={analytics.by_status || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${getStatusLabel(status)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.by_status || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{lng === 'ar' ? 'التوزيع حسب القطاع' : 'Distribution by Sector'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.by_sector || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win Rate by Sector */}
        <Card>
          <CardHeader>
            <CardTitle>{lng === 'ar' ? 'معدل الفوز حسب القطاع' : 'Win Rate by Sector'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.by_sector || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="win_rate" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

