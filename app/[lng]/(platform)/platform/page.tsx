/**
 * Platform Dashboard Page
 * Main control panel for platform administration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Building2,
  Settings,
  Database,
  Activity,
  Shield,
  ScrollText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface PlatformStats {
  totalUsers: number;
  totalTenants: number;
  activeTenants: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  apiStatus: 'operational' | 'degraded' | 'down';
  recentActivity: number;
}

export default function PlatformDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.lng as string) || 'en';
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      // Fetch platform statistics
      const response = await fetch('/api/platform/stats', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'platform',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          totalUsers: 0,
          totalTenants: 0,
          activeTenants: 0,
          systemHealth: 'healthy',
          apiStatus: 'operational',
          recentActivity: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const controlPanels = [
    {
      id: 'users',
      title: locale === 'ar' ? 'المستخدمون' : 'Users',
      description: locale === 'ar' ? 'إدارة المستخدمين' : 'Manage platform users',
      icon: Users,
      href: `/${locale}/platform/users`,
      color: 'bg-blue-500',
      stat: stats?.totalUsers || 0
    },
    {
      id: 'tenants',
      title: locale === 'ar' ? 'العملاء' : 'Tenants',
      description: locale === 'ar' ? 'إدارة المؤسسات' : 'Manage tenant organizations',
      icon: Building2,
      href: `/${locale}/platform/tenants`,
      color: 'bg-green-500',
      stat: `${stats?.activeTenants || 0}/${stats?.totalTenants || 0}`
    },
    {
      id: 'settings',
      title: locale === 'ar' ? 'الإعدادات' : 'Settings',
      description: locale === 'ar' ? 'إعدادات المنصة' : 'Platform configuration',
      icon: Settings,
      href: `/${locale}/platform/settings`,
      color: 'bg-purple-500',
      stat: null
    },
    {
      id: 'api-status',
      title: locale === 'ar' ? 'حالة API' : 'API Status',
      description: locale === 'ar' ? 'مراقبة حالة APIs' : 'Monitor API status',
      icon: Database,
      href: `/${locale}/platform/api-status`,
      color: 'bg-yellow-500',
      stat: stats?.apiStatus === 'operational' ? 'OK' : 'Check'
    },
    {
      id: 'audit',
      title: locale === 'ar' ? 'التدقيق' : 'Audit Logs',
      description: locale === 'ar' ? 'سجلات التدقيق' : 'View audit logs',
      icon: ScrollText,
      href: `/${locale}/platform/audit`,
      color: 'bg-red-500',
      stat: stats?.recentActivity || 0
    }
  ];

  if (loading) {
    return <LoadingState message={locale === 'ar' ? 'جاري تحميل لوحة التحكم...' : 'Loading platform dashboard...'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'لوحة تحكم المنصة' : 'Platform Control Panel'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar' ? 'إدارة المنصة والإشراف عليها' : 'Platform administration and oversight'}
          </p>
        </div>
      </div>

      {/* System Health Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'إجمالي المؤسسات' : 'Total Tenants'}
                  </p>
                  <p className="text-2xl font-bold">{stats.totalTenants}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'حالة النظام' : 'System Health'}
                  </p>
                  <p className="text-2xl font-bold capitalize">{stats.systemHealth}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'حالة API' : 'API Status'}
                  </p>
                  <p className="text-2xl font-bold capitalize">{stats.apiStatus}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Database className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Panels Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {locale === 'ar' ? 'لوحات التحكم' : 'Control Panels'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {controlPanels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Card
                key={panel.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(panel.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 ${panel.color} rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {panel.stat !== null && (
                      <div className="text-2xl font-bold text-gray-900">
                        {panel.stat}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-1">{panel.title}</h3>
                  <p className="text-sm text-gray-600">{panel.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push(`/${locale}/platform/users`)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mb-2" />
              <div className="font-medium">
                {locale === 'ar' ? 'إضافة مستخدم' : 'Add User'}
              </div>
            </button>
            <button
              onClick={() => router.push(`/${locale}/platform/tenants`)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <Building2 className="h-5 w-5 text-green-600 mb-2" />
              <div className="font-medium">
                {locale === 'ar' ? 'إضافة مؤسسة' : 'Add Tenant'}
              </div>
            </button>
            <button
              onClick={() => router.push(`/${locale}/platform/settings`)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <Settings className="h-5 w-5 text-purple-600 mb-2" />
              <div className="font-medium">
                {locale === 'ar' ? 'تعديل الإعدادات' : 'Edit Settings'}
              </div>
            </button>
            <button
              onClick={() => router.push(`/${locale}/platform/audit`)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <ScrollText className="h-5 w-5 text-red-600 mb-2" />
              <div className="font-medium">
                {locale === 'ar' ? 'عرض السجلات' : 'View Logs'}
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

