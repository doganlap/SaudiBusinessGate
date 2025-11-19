'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { defaultLanguage } from '@/lib/i18n';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  Package,
  UserCheck,
  CreditCard
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  activeSubscriptions: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'subscription' | 'payment' | 'system';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function DashboardPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || defaultLanguage;
  const { t } = useTranslation(lng, 'dashboard', {});
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Set fallback data for demo
      setStats({
        totalRevenue: 125000,
        totalUsers: 1250,
        activeSubscriptions: 890,
        monthlyGrowth: 12.5
      });
      setRecentActivity([
        {
          id: '1',
          type: 'user',
          message: 'New user registered: john.doe@example.com',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'subscription',
          message: 'Subscription upgraded to Pro plan',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'payment',
          message: 'Payment received: $99.00',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'finance',
      title: 'Finance',
      description: 'Manage accounts, transactions, and reports',
      icon: <DollarSign className="h-6 w-6" />,
      href: `/${lng}/finance`,
      color: 'bg-green-500'
    },
    {
      id: 'sales',
      title: 'Sales',
      description: 'Track leads, deals, and pipeline',
      icon: <TrendingUp className="h-6 w-6" />,
      href: `/${lng}/sales`,
      color: 'bg-blue-500'
    },
    {
      id: 'crm',
      title: 'CRM',
      description: 'Customer relationship management',
      icon: <Users className="h-6 w-6" />,
      href: `/${lng}/crm`,
      color: 'bg-purple-500'
    },
    {
      id: 'hr',
      title: 'HR',
      description: 'Human resources and payroll',
      icon: <UserCheck className="h-6 w-6" />,
      href: `/${lng}/hr`,
      color: 'bg-orange-500'
    },
    {
      id: 'procurement',
      title: 'Procurement',
      description: 'Purchase orders and inventory',
      icon: <Package className="h-6 w-6" />,
      href: `/${lng}/procurement`,
      color: 'bg-indigo-500'
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Subscription and payment management',
      icon: <CreditCard className="h-6 w-6" />,
      href: `/${lng}/billing`,
      color: 'bg-pink-500'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'AI-powered business insights and KPIs',
      icon: <BarChart3 className="h-6 w-6" />,
      href: `/${lng}/analytics`,
      color: 'bg-teal-500'
    },
    {
      id: 'platform',
      title: 'Platform',
      description: 'Users, tenants, and settings',
      icon: <Settings className="h-6 w-6" />,
      href: `/${lng}/platform/users`,
      color: 'bg-gray-500'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('welcomeMessage', { name: user?.name || 'User' })}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('welcomeSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 relative"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Settings"
                aria-label="Open settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('activeSubscriptions')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeSubscriptions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('monthlyGrowth')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    +{stats.monthlyGrowth}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t('quickActions')}</h2>
                <p className="text-sm text-gray-600">{t('quickActionsSubtitle')}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <a
                      key={action.id}
                      href={action.href}
                      className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          {action.icon}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
                <p className="text-sm text-gray-600">{t('recentActivitySubtitle')}</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <a
                    href={`/${lng}/platform/activity`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all activity →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
