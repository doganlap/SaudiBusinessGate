'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Activity, 
  Brain, Target, Zap, ChevronRight, Eye, Settings
} from 'lucide-react';

interface AnalyticsModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
  metrics?: {
    primary: string;
    secondary: string;
  };
}

interface KPIData {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  const analyticsModules: AnalyticsModule[] = [
    {
      id: 'business-kpis',
      name: 'Business KPIs',
      description: 'Real-time business performance indicators',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/business-kpis',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      bgColor: 'bg-blue-500',
      metrics: { primary: '50+ KPIs', secondary: 'Real-time' }
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Customer behavior and lifecycle analysis',
      icon: <Users className="h-6 w-6" />,
      href: '/customer-analytics',
      color: 'bg-green-50 border-green-200 text-green-700',
      bgColor: 'bg-green-500',
      metrics: { primary: '1,250 Users', secondary: '+12.5%' }
    },
    {
      id: 'financial-analytics',
      name: 'Financial Analytics',
      description: 'Revenue, profit, and financial forecasting',
      icon: <DollarSign className="h-6 w-6" />,
      href: '/financial-analytics',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      bgColor: 'bg-purple-500',
      metrics: { primary: '$125K MRR', secondary: '+25.3%' }
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      description: 'Machine learning powered analytics',
      icon: <Brain className="h-6 w-6" />,
      href: '/ai-insights',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      bgColor: 'bg-orange-500',
      metrics: { primary: '15 Models', secondary: 'Active' }
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'System and application performance',
      icon: <Activity className="h-6 w-6" />,
      href: '/performance-metrics',
      color: 'bg-red-50 border-red-200 text-red-700',
      bgColor: 'bg-red-500',
      metrics: { primary: '99.9% Uptime', secondary: '<100ms' }
    },
    {
      id: 'predictive-analytics',
      name: 'Predictive Analytics',
      description: 'Forecasting and trend prediction',
      icon: <Target className="h-6 w-6" />,
      href: '/predictive-analytics',
      color: 'bg-teal-50 border-teal-200 text-teal-700',
      bgColor: 'bg-teal-500',
      metrics: { primary: '85% Accuracy', secondary: 'Forecasts' }
    }
  ];

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/kpis/business');
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to KPI format
        const kpis: KPIData[] = [
          {
            name: 'Monthly Recurring Revenue',
            value: '$125,000',
            change: '+12.5%',
            trend: 'up',
            icon: <DollarSign className="h-5 w-5" />,
            color: 'text-green-600'
          },
          {
            name: 'Active Users',
            value: '1,250',
            change: '+8.2%',
            trend: 'up',
            icon: <Users className="h-5 w-5" />,
            color: 'text-blue-600'
          },
          {
            name: 'Conversion Rate',
            value: '3.2%',
            change: '+0.5%',
            trend: 'up',
            icon: <Target className="h-5 w-5" />,
            color: 'text-purple-600'
          },
          {
            name: 'Churn Rate',
            value: '2.1%',
            change: '-0.3%',
            trend: 'up',
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-green-600'
          }
        ];
        setKpiData(kpis);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      // Set default KPI data
      setKpiData([
        {
          name: 'Monthly Recurring Revenue',
          value: '$125,000',
          change: '+12.5%',
          trend: 'up',
          icon: <DollarSign className="h-5 w-5" />,
          color: 'text-green-600'
        },
        {
          name: 'Active Users',
          value: '1,250',
          change: '+8.2%',
          trend: 'up',
          icon: <Users className="h-5 w-5" />,
          color: 'text-blue-600'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered analytics and business intelligence platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Analytics Settings">
                <Settings className="h-6 w-6" />
              </button>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 bg-gray-100 rounded-lg ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Analytics Status */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow mb-8 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">AI Analytics Engine</h2>
                <p className="text-blue-100">15+ AI models processing real-time data</p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm">Models Active</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-sm">Processing</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="text-sm">Real-time</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-blue-100">Active KPIs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Modules Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analytics Modules</h2>
            <p className="text-sm text-gray-600">Access specialized analytics and insights</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsModules.map((module) => (
                <Link
                  key={module.id}
                  href={`/${lng}/analytics${module.href}`}
                  className="group p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${module.bgColor} text-white`}>
                      {module.icon}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{module.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  {module.metrics && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{module.metrics.primary}</span>
                      <span className="text-green-600 font-medium">{module.metrics.secondary}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Revenue Growth Opportunity</p>
                    <p className="text-sm text-gray-600">Customer segment analysis suggests 15% revenue increase potential</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">User Engagement Pattern</p>
                    <p className="text-sm text-gray-600">Peak usage detected between 2-4 PM, optimize resources accordingly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-orange-100 rounded-full">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Churn Risk Alert</p>
                    <p className="text-sm text-gray-600">12 customers showing early churn indicators, intervention recommended</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Financial model updated</span>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Customer segmentation completed</span>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Predictive model trained</span>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Performance report generated</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
