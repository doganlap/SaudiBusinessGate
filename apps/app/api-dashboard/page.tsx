'use client';

/**
 * API Dashboard - Visual API to Page Connectivity
 * Module: Developer Tools
 * Purpose: Show API endpoints and their connected pages with visual indicators
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { 
  Activity, 
  Globe, 
  Link, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  Code,
  Monitor,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  Zap,
  FileText,
  TrendingUp,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  module: string;
  status: 'active' | 'inactive' | 'deprecated' | 'testing';
  connectedPages: string[];
  responseTime?: number;
  lastUsed?: string;
  description: string;
}

interface PageConnection {
  page: string;
  apis: string[];
  status: 'connected' | 'partial' | 'disconnected';
  components: string[];
}

const colorScheme = {
  modules: {
    'Dashboard': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', icon: Monitor },
    'Finance': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', icon: DollarSign },
    'Sales': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', icon: TrendingUp },
    'HR': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', icon: Users },
    'Analytics': { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', icon: BarChart3 },
    'Auth': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', icon: Shield },
    'Billing': { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', icon: FileText },
    'System': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', icon: Settings },
    'Workflows': { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', icon: Zap }
  },
  status: {
    'active': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
    'inactive': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' },
    'deprecated': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400' },
    'testing': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' }
  },
  connection: {
    'connected': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
    'partial': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertTriangle },
    'disconnected': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: XCircle }
  }
};

export default function APIDashboard() {
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [pages, setPages] = useState<PageConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'apis' | 'pages' | 'connections'>('apis');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API call with mock data based on our analysis
      const mockAPIs: APIEndpoint[] = [
        // Dashboard APIs
        {
          id: 'api-1',
          path: '/api/dashboard/stats',
          method: 'GET',
          module: 'Dashboard',
          status: 'active',
          connectedPages: ['/dashboard', '/[lng]/(platform)/page'],
          responseTime: 120,
          lastUsed: '2025-11-13T10:30:00Z',
          description: 'Real-time dashboard statistics and metrics'
        },
        {
          id: 'api-2',
          path: '/api/dashboard/activity',
          method: 'GET',
          module: 'Dashboard',
          status: 'active',
          connectedPages: ['/dashboard', '/monitoring/page'],
          responseTime: 95,
          lastUsed: '2025-11-13T10:25:00Z',
          description: 'Recent activity feed and user actions'
        },
        // Finance APIs
        {
          id: 'api-3',
          path: '/api/finance/transactions',
          method: 'GET',
          module: 'Finance',
          status: 'active',
          connectedPages: ['/finance/transactions/page', '/[lng]/(platform)/finance/transactions/page'],
          responseTime: 150,
          lastUsed: '2025-11-13T09:45:00Z',
          description: 'Financial transaction data and history'
        },
        {
          id: 'api-4',
          path: '/api/finance/accounts',
          method: 'GET',
          module: 'Finance',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/finance/accounts/page'],
          responseTime: 89,
          lastUsed: '2025-11-13T09:30:00Z',
          description: 'Account management and balances'
        },
        {
          id: 'api-5',
          path: '/api/finance/stats',
          method: 'GET',
          module: 'Finance',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/finance/dashboard/page'],
          responseTime: 105,
          lastUsed: '2025-11-13T09:15:00Z',
          description: 'Financial KPIs and summary statistics'
        },
        // Sales APIs
        {
          id: 'api-6',
          path: '/api/sales/leads',
          method: 'GET',
          module: 'Sales',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/sales/leads/page'],
          responseTime: 135,
          lastUsed: '2025-11-13T08:45:00Z',
          description: 'Lead management and tracking'
        },
        {
          id: 'api-7',
          path: '/api/sales/deals',
          method: 'GET',
          module: 'Sales',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/sales/deals/page'],
          responseTime: 142,
          lastUsed: '2025-11-13T08:30:00Z',
          description: 'Deal pipeline and management'
        },
        {
          id: 'api-8',
          path: '/api/sales/rfqs',
          method: 'GET',
          module: 'Sales',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/sales/rfqs/page'],
          responseTime: 98,
          lastUsed: '2025-11-13T08:15:00Z',
          description: 'Request for Quote processing'
        },
        // HR APIs
        {
          id: 'api-9',
          path: '/api/hr/employees',
          method: 'GET',
          module: 'HR',
          status: 'active',
          connectedPages: ['/hr/employees/page', '/[lng]/(platform)/hr/employees/page'],
          responseTime: 167,
          lastUsed: '2025-11-13T07:45:00Z',
          description: 'Employee data and management'
        },
        {
          id: 'api-10',
          path: '/api/hr/payroll',
          method: 'GET',
          module: 'HR',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/hr/payroll/page'],
          responseTime: 203,
          lastUsed: '2025-11-13T07:30:00Z',
          description: 'Payroll processing and calculations'
        },
        // Analytics APIs
        {
          id: 'api-11',
          path: '/api/analytics/kpis/business',
          method: 'GET',
          module: 'Analytics',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/analytics/page'],
          responseTime: 178,
          lastUsed: '2025-11-13T07:00:00Z',
          description: 'Business KPIs and performance metrics'
        },
        {
          id: 'api-12',
          path: '/api/analytics/trend-analysis',
          method: 'GET',
          module: 'Analytics',
          status: 'active',
          connectedPages: ['/analytics/trends/page'],
          responseTime: 234,
          lastUsed: '2025-11-13T06:45:00Z',
          description: 'Trend analysis and forecasting'
        },
        // Auth APIs
        {
          id: 'api-13',
          path: '/api/auth/me',
          method: 'GET',
          module: 'Auth',
          status: 'active',
          connectedPages: ['/[lng]/auth/page', '/[lng]/login/page'],
          responseTime: 45,
          lastUsed: '2025-11-13T10:45:00Z',
          description: 'User authentication and profile'
        },
        // Billing APIs
        {
          id: 'api-14',
          path: '/api/billing/plans',
          method: 'GET',
          module: 'Billing',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/billing/page'],
          responseTime: 112,
          lastUsed: '2025-11-13T06:30:00Z',
          description: 'Billing plans and pricing'
        },
        {
          id: 'api-15',
          path: '/api/billing/send-activation',
          method: 'POST',
          module: 'Billing',
          status: 'active',
          connectedPages: ['/admin/licenses/page'],
          responseTime: 189,
          lastUsed: '2025-11-13T06:15:00Z',
          description: 'License activation and billing'
        },
        // System APIs
        {
          id: 'api-16',
          path: '/api/themes/demo-org',
          method: 'GET',
          module: 'System',
          status: 'active',
          connectedPages: ['/[lng]/(platform)/themes/page'],
          responseTime: 67,
          lastUsed: '2025-11-13T06:00:00Z',
          description: 'Theme customization and management'
        },
        // Workflows APIs
        {
          id: 'api-17',
          path: '/api/workflows',
          method: 'GET',
          module: 'Workflows',
          status: 'active',
          connectedPages: ['/workflows/page'],
          responseTime: 156,
          lastUsed: '2025-11-13T05:45:00Z',
          description: 'Workflow management and automation'
        }
      ];

      const mockPages: PageConnection[] = [
        {
          page: '/dashboard',
          apis: ['/api/dashboard/stats', '/api/dashboard/activity'],
          status: 'connected',
          components: ['Card', 'Button', 'DataGrid', 'LoadingState']
        },
        {
          page: '/finance/transactions/page',
          apis: ['/api/finance/transactions'],
          status: 'connected',
          components: ['LoadingState', 'ErrorBoundary', 'DataGrid', 'Card', 'Button', 'Badge']
        },
        {
          page: '/[lng]/(platform)/sales/leads/page',
          apis: ['/api/sales/leads'],
          status: 'connected',
          components: ['DataGrid', 'EnterpriseToolbar', 'LoadingState', 'Card', 'Button', 'Badge']
        },
        {
          page: '/hr/employees/page',
          apis: ['/api/hr/employees'],
          status: 'connected',
          components: ['UserProfileCard', 'DataGrid', 'LoadingState', 'ErrorBoundary', 'Card', 'Button', 'Badge']
        },
        {
          page: '/admin/licenses/page',
          apis: ['/api/billing/send-activation'],
          status: 'connected',
          components: ['EnterpriseToolbar', 'DataGrid', 'LoadingState', 'ErrorBoundary', 'Card', 'Button', 'Badge']
        },
        {
          page: '/[lng]/(platform)/themes/page',
          apis: ['/api/themes/demo-org'],
          status: 'connected',
          components: ['ThemeCustomizer', 'Card', 'Button']
        },
        {
          page: '/workflows/page',
          apis: ['/api/workflows'],
          status: 'connected',
          components: ['WorkflowBuilder', 'DataGrid', 'LoadingState', 'ErrorBoundary', 'Card', 'Button', 'Badge']
        }
      ];

      setApis(mockAPIs);
      setPages(mockPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAPIs = apis.filter(api => {
    const matchesModule = filterModule === 'all' || api.module === filterModule;
    const matchesStatus = filterStatus === 'all' || api.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      api.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesModule && matchesStatus && matchesSearch;
  });

  const modules = Array.from(new Set(apis.map(api => api.module)));
  const statuses = Array.from(new Set(apis.map(api => api.status)));

  const getModuleIcon = (module: string) => {
    const IconComponent = colorScheme.modules[module as keyof typeof colorScheme.modules]?.icon || Code;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = colorScheme.connection[status as keyof typeof colorScheme.connection]?.icon || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getResponseTimeColor = (time?: number) => {
    if (!time) return 'text-gray-500';
    if (time < 100) return 'text-green-600';
    if (time < 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingState message="Loading API dashboard..." />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        title="Failed to load API dashboard"
        retry={() => {
          setError(null);
          setLoading(true);
          fetchDashboardData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">API Dashboard</h1>
            <p className="text-gray-600">Visual overview of API endpoints and page connectivity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => fetchDashboardData()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total APIs</p>
                <p className="text-3xl font-bold">{apis.length}</p>
              </div>
              <Database className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active APIs</p>
                <p className="text-3xl font-bold">{apis.filter(api => api.status === 'active').length}</p>
              </div>
              <Activity className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Connected Pages</p>
                <p className="text-3xl font-bold">{pages.length}</p>
              </div>
              <Link className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Modules</p>
                <p className="text-3xl font-bold">{modules.length}</p>
              </div>
              <Globe className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          {[
            { key: 'apis', label: 'APIs', icon: Database },
            { key: 'pages', label: 'Pages', icon: FileText },
            { key: 'connections', label: 'Connections', icon: Link }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {activeView === 'apis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAPIs.map((api) => {
            const moduleStyle = colorScheme.modules[api.module as keyof typeof colorScheme.modules];
            const statusStyle = colorScheme.status[api.status as keyof typeof colorScheme.status];
            
            return (
              <Card key={api.id} className={`hover:shadow-lg transition-shadow ${statusStyle?.border}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getModuleIcon(api.module)}
                      <Badge className={`${moduleStyle?.bg} ${moduleStyle?.text} border-0`}>
                        {api.module}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusStyle?.dot}`}></div>
                      <Badge variant={api.method === 'GET' ? 'default' : api.method === 'POST' ? 'secondary' : api.method === 'DELETE' ? 'destructive' : 'outline'}>
                        {api.method}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-mono">{api.path}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{api.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response Time:</span>
                      <span className={`font-medium ${getResponseTimeColor(api.responseTime)}`}>
                        {api.responseTime || '--'}ms
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Connected Pages:</span>
                      <span className="font-medium text-blue-600">{api.connectedPages.length}</span>
                    </div>
                    
                    {api.connectedPages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Connected to:</p>
                        <div className="space-y-1">
                          {api.connectedPages.slice(0, 2).map((page, index) => (
                            <div key={index} className="text-xs font-mono bg-gray-100 rounded px-2 py-1">
                              {page}
                            </div>
                          ))}
                          {api.connectedPages.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{api.connectedPages.length - 2} more pages
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeView === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pages.map((page, index) => {
            const connectionStyle = colorScheme.connection[page.status as keyof typeof colorScheme.connection];
            
            return (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${connectionStyle?.border}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(page.status)}
                      <Badge className={`${connectionStyle?.bg} ${connectionStyle?.text} border-0`}>
                        {page.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {page.apis.length} APIs
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-mono break-all">{page.page}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Connected APIs:</p>
                      <div className="space-y-1">
                        {page.apis.map((api, apiIndex) => (
                          <div key={apiIndex} className="text-xs font-mono bg-blue-50 text-blue-800 rounded px-2 py-1">
                            {api}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Components Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {page.components.map((component, compIndex) => (
                          <Badge key={compIndex} variant="secondary" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeView === 'connections' && (
        <Card>
          <CardHeader>
            <CardTitle>API-Page Connection Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-1 gap-4">
                  {modules.map(module => {
                    const moduleAPIs = apis.filter(api => api.module === module);
                    const moduleStyle = colorScheme.modules[module as keyof typeof colorScheme.modules];
                    
                    return (
                      <div key={module} className={`p-4 rounded-lg ${moduleStyle?.bg} ${moduleStyle?.border} border`}>
                        <div className="flex items-center gap-2 mb-3">
                          {getModuleIcon(module)}
                          <h3 className={`font-semibold ${moduleStyle?.text}`}>{module} Module</h3>
                          <Badge variant="outline">{moduleAPIs.length} APIs</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {moduleAPIs.map(api => (
                            <div key={api.id} className="bg-white rounded p-3 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm">{api.path}</span>
                                <Badge variant={api.method === 'GET' ? 'default' : 'secondary'}>
                                  {api.method}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {api.connectedPages.map((page, pageIndex) => (
                                  <div key={pageIndex} className="text-xs bg-gray-100 rounded px-2 py-1 font-mono">
                                    {page.split('/').pop() || page}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Note: metadata moved to layout.tsx due to 'use client' directive