'use client';

/**
 * Usage Dashboard Page - Tenant Usage View
 * Saudi Store Platform Tenant Usage Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  HardDrive, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download
} from 'lucide-react';

const UsageDashboardPage = () => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30_days');

  // Sample usage data
  const sampleUsageData = {
    tenant: {
      id: 'tenant_saudi_oil',
      name: 'Saudi Oil Company',
      licenseCode: 'enterprise',
      validUntil: '2025-12-31'
    },
    currentUsage: {
      users: { current: 87, limit: 100, percentage: 87 },
      storage: { current: 64, limit: 100, percentage: 64, unit: 'GB' },
      apiCalls: { current: 45000, limit: 100000, percentage: 45 },
      kpis: { current: 156, limit: 500, percentage: 31 },
      dashboards: { current: 8, limit: 20, percentage: 40 }
    },
    trends: {
      users: { change: 12, direction: 'up', period: '30d' },
      storage: { change: 8, direction: 'up', period: '30d' },
      apiCalls: { change: -5, direction: 'down', period: '30d' },
      kpis: { change: 23, direction: 'up', period: '30d' }
    },
    features: [
      { name: 'Advanced Analytics', used: true, lastUsed: '2025-11-12' },
      { name: 'Custom Reports', used: true, lastUsed: '2025-11-10' },
      { name: 'API Access', used: true, lastUsed: '2025-11-12' },
      { name: 'Multi-Tenant Admin', used: false, lastUsed: null },
      { name: 'Advanced Security', used: true, lastUsed: '2025-11-11' },
      { name: 'Priority Support', used: true, lastUsed: '2025-11-08' }
    ],
    monthlyUsage: [
      { month: 'Jan 2025', users: 75, storage: 45, apiCalls: 38000 },
      { month: 'Feb 2025', users: 78, storage: 48, apiCalls: 42000 },
      { month: 'Mar 2025', users: 82, storage: 52, apiCalls: 46000 },
      { month: 'Apr 2025', users: 85, storage: 55, apiCalls: 48000 },
      { month: 'May 2025', users: 87, storage: 58, apiCalls: 47000 },
      { month: 'Jun 2025', users: 89, storage: 61, apiCalls: 49000 },
      { month: 'Jul 2025', users: 91, storage: 63, apiCalls: 51000 },
      { month: 'Aug 2025', users: 88, storage: 62, apiCalls: 47000 },
      { month: 'Sep 2025', users: 86, storage: 60, apiCalls: 44000 },
      { month: 'Oct 2025', users: 87, storage: 64, apiCalls: 45000 },
      { month: 'Nov 2025', users: 87, storage: 64, apiCalls: 45000 }
    ],
    upgradeSuggestions: [
      {
        reason: 'High user utilization',
        suggestion: 'Consider upgrading user limit',
        impact: 'Prevent user access issues',
        urgency: 'medium'
      },
      {
        reason: 'Storage approaching limit',
        suggestion: 'Upgrade storage allocation',
        impact: 'Avoid data storage restrictions',
        urgency: 'low'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsageData(sampleUsageData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (direction) => {
    return direction === 'up' ? ArrowUp : ArrowDown;
  };

  const getTrendColor = (direction) => {
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      high: { color: 'bg-red-100 text-red-800', text: 'High Priority' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Medium Priority' },
      low: { color: 'bg-blue-100 text-blue-800', text: 'Low Priority' }
    };

    const config = urgencyConfig[urgency] || urgencyConfig.low;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {usageData.tenant.name} • {usageData.tenant.licenseCode.charAt(0).toUpperCase() + usageData.tenant.licenseCode.slice(1)} License
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7_days">Last 7 Days</option>
            <option value="30_days">Last 30 Days</option>
            <option value="90_days">Last 90 Days</option>
            <option value="12_months">Last 12 Months</option>
          </select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {React.createElement(getTrendIcon(usageData.trends.users.direction), {
                  size: 12,
                  className: getTrendColor(usageData.trends.users.direction)
                })}
                <span className={getTrendColor(usageData.trends.users.direction)}>
                  {Math.abs(usageData.trends.users.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className={`text-2xl font-bold ${getUsageColor(usageData.currentUsage.users.percentage)}`}>
                {usageData.currentUsage.users.current}/{usageData.currentUsage.users.limit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usageData.currentUsage.users.percentage)}`}
                  style={{ width: `${usageData.currentUsage.users.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {React.createElement(getTrendIcon(usageData.trends.storage.direction), {
                  size: 12,
                  className: getTrendColor(usageData.trends.storage.direction)
                })}
                <span className={getTrendColor(usageData.trends.storage.direction)}>
                  {Math.abs(usageData.trends.storage.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className={`text-2xl font-bold ${getUsageColor(usageData.currentUsage.storage.percentage)}`}>
                {usageData.currentUsage.storage.current}{usageData.currentUsage.storage.unit}/
                {usageData.currentUsage.storage.limit}{usageData.currentUsage.storage.unit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usageData.currentUsage.storage.percentage)}`}
                  style={{ width: `${usageData.currentUsage.storage.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {React.createElement(getTrendIcon(usageData.trends.apiCalls.direction), {
                  size: 12,
                  className: getTrendColor(usageData.trends.apiCalls.direction)
                })}
                <span className={getTrendColor(usageData.trends.apiCalls.direction)}>
                  {Math.abs(usageData.trends.apiCalls.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <p className={`text-2xl font-bold ${getUsageColor(usageData.currentUsage.apiCalls.percentage)}`}>
                {usageData.currentUsage.apiCalls.current.toLocaleString()}/
                {usageData.currentUsage.apiCalls.limit.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usageData.currentUsage.apiCalls.percentage)}`}
                  style={{ width: `${usageData.currentUsage.apiCalls.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {React.createElement(getTrendIcon(usageData.trends.kpis.direction), {
                  size: 12,
                  className: getTrendColor(usageData.trends.kpis.direction)
                })}
                <span className={getTrendColor(usageData.trends.kpis.direction)}>
                  {Math.abs(usageData.trends.kpis.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">KPIs Created</p>
              <p className={`text-2xl font-bold ${getUsageColor(usageData.currentUsage.kpis.percentage)}`}>
                {usageData.currentUsage.kpis.current}/{usageData.currentUsage.kpis.limit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usageData.currentUsage.kpis.percentage)}`}
                  style={{ width: `${usageData.currentUsage.kpis.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboards */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Dashboards</p>
              <p className={`text-2xl font-bold ${getUsageColor(usageData.currentUsage.dashboards.percentage)}`}>
                {usageData.currentUsage.dashboards.current}/{usageData.currentUsage.dashboards.limit}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usageData.currentUsage.dashboards.percentage)}`}
                  style={{ width: `${usageData.currentUsage.dashboards.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {feature.used ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${feature.used ? 'text-gray-900' : 'text-gray-500'}`}>
                      {feature.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {feature.used ? `Last used: ${feature.lastUsed}` : 'Not used'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageData.upgradeSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-sm">{suggestion.reason}</span>
                    </div>
                    {getUrgencyBadge(suggestion.urgency)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{suggestion.suggestion}</p>
                  <p className="text-xs text-gray-500">{suggestion.impact}</p>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              View Upgrade Options
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Usage trends chart would be rendered here</p>
              <p className="text-xs mt-1">Integration with Chart.js or Recharts recommended</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboardPage;