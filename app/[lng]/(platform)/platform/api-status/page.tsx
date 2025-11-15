'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, CheckCircle, Clock, AlertCircle, 
  Activity, BarChart3, Users, DollarSign,
  Package, CreditCard, Settings, RefreshCw
} from 'lucide-react';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: string[];
  status: 'active' | 'development' | 'planned';
  module: string;
  description: string;
  lastTested?: string;
}

interface APIStatus {
  summary: {
    totalAPIs: number;
    activeAPIs: number;
    developmentAPIs: number;
    plannedAPIs: number;
    modules: number;
    coverage: number;
  };
  modules: Record<string, APIEndpoint[]>;
  endpoints: APIEndpoint[];
  lastUpdated: string;
}

export default function APIStatusPage() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    fetchAPIStatus();
  }, []);

  const fetchAPIStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/status', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setApiStatus(data);
        setLastRefresh(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Finance': return DollarSign;
      case 'Sales': return BarChart3;
      case 'CRM': return Users;
      case 'HR': return Users;
      case 'Procurement': return Package;
      case 'Analytics': return BarChart3;
      case 'Billing': return CreditCard;
      case 'Authentication': return Settings;
      case 'Dashboard': return Activity;
      case 'Platform': return Database;
      default: return Database;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'development': return 'text-yellow-600 bg-yellow-100';
      case 'planned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'development': return Clock;
      case 'planned': return AlertCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return <LoadingState message="Loading API status..." />;
  }

  if (!apiStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load API Status</h3>
          <p className="text-gray-500 mb-4">Unable to fetch API endpoint information</p>
          <button
            onClick={fetchAPIStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Integration Status</h1>
          <p className="text-gray-600">
            Monitor all platform APIs and their integration status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh}
          </span>
          <button
            onClick={fetchAPIStatus}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStatus.summary.totalAPIs}</div>
            <p className="text-xs text-gray-500">
              Across {apiStatus.summary.modules} modules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiStatus.summary.activeAPIs}
            </div>
            <p className="text-xs text-gray-500">
              Production ready
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {apiStatus.summary.developmentAPIs}
            </div>
            <p className="text-xs text-gray-500">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {apiStatus.summary.plannedAPIs}
            </div>
            <p className="text-xs text-gray-500">
              Future releases
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {apiStatus.summary.coverage}%
            </div>
            <p className="text-xs text-gray-500">
              API completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(apiStatus.modules).map(([moduleName, endpoints]) => {
          const IconComponent = getModuleIcon(moduleName);
          const activeCount = endpoints.filter(e => e.status === 'active').length;
          const totalCount = endpoints.length;
          
          return (
            <Card key={moduleName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{moduleName}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {activeCount}/{totalCount} APIs active
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                    <div className="text-xs text-gray-500">endpoints</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => {
                    const StatusIcon = getStatusIcon(endpoint.status);
                    return (
                      <div key={endpoint.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(endpoint.status).split(' ')[0]}`} />
                          <div>
                            <div className="text-sm font-medium">{endpoint.name}</div>
                            <div className="text-xs text-gray-500">{endpoint.path}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(endpoint.status)}>
                          {endpoint.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed API List */}
      <Card>
        <CardHeader>
          <CardTitle>All API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Module</th>
                  <th className="text-left py-2">Endpoint</th>
                  <th className="text-left py-2">Path</th>
                  <th className="text-left py-2">Methods</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {apiStatus.endpoints.map((endpoint) => {
                  const StatusIcon = getStatusIcon(endpoint.status);
                  return (
                    <tr key={endpoint.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(endpoint.status).split(' ')[0]}`} />
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-2 font-medium">{endpoint.module}</td>
                      <td className="py-2">{endpoint.name}</td>
                      <td className="py-2 font-mono text-sm">{endpoint.path}</td>
                      <td className="py-2">
                        <div className="flex space-x-1">
                          {endpoint.method.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-600">{endpoint.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
