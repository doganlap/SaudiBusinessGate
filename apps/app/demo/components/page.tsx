'use client';

/**
 * Component Demo Page
 * Module: Demo
 * Purpose: Demonstrate all UI components and their connectivity
 * Connected to: /api/demo/data
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataGrid } from '@/components/ui/data-grid';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EnterpriseToolbar } from '@/components/enterprise/enterprise-toolbar';
import { UserProfileCard } from '@/components/features/user-profile-card';
import { WorkflowBuilder } from '@/components/features/workflow-builder';
import { ThemeSelector } from '@/components/features/theme-selector';
import { NotificationCenter } from '@/components/features/notification-center';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { TabNavigation } from '@/components/navigation/tab-navigation';
import { 
  Settings, Users, BarChart3, Zap, Bell, 
  Download, Share2, Filter, Search, Plus,
  Trash2, Edit3, Eye, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface DemoData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  created: string;
  value: number;
}

interface ComponentSection {
  title: string;
  description: string;
  components: string[];
}

export default function ComponentDemoPage() {
  const [data, setData] = useState<DemoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTheme, setSelectedTheme] = useState('default');

  useEffect(() => {
    fetchDemoData();
  }, []);

  const fetchDemoData = async () => {
    try {
      const response = await fetch('/api/demo/data');
      if (!response.ok) {
        throw new Error('Failed to fetch demo data');
      }
      const result = await response.json();
      setData(result.data || generateMockData());
    } catch (err: any) {
      setError(err.message);
      // Generate mock data on error
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): DemoData[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `demo-${i + 1}`,
      name: `Demo Item ${i + 1}`,
      status: ['active', 'inactive', 'pending'][i % 3] as any,
      created: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      value: Math.floor(Math.random() * 1000) + 100
    }));
  };

  const componentSections: ComponentSection[] = [
    {
      title: 'Core UI Components',
      description: 'Basic building blocks for all interfaces',
      components: ['Card', 'Button', 'Badge', 'DataGrid', 'LoadingState', 'ErrorBoundary', 'Input', 'Select']
    },
    {
      title: 'Enterprise Components',
      description: 'Advanced business functionality components',
      components: ['EnterpriseToolbar', 'AdvancedFilter', 'BulkActions', 'ExportTools']
    },
    {
      title: 'Feature Components',
      description: 'Specialized functionality components',
      components: ['UserProfileCard', 'WorkflowBuilder', 'ThemeSelector', 'NotificationCenter', 'SearchBar', 'DatePicker']
    },
    {
      title: 'Layout Components',
      description: 'Page structure and layout components',
      components: ['Header', 'Sidebar', 'Footer', 'Container', 'Grid']
    },
    {
      title: 'Navigation Components',
      description: 'User navigation and routing components',
      components: ['MobileNav', 'Breadcrumbs', 'TabNavigation', 'Pagination', 'Menu']
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'components', label: 'Components', icon: Settings },
    { id: 'data', label: 'Data Demo', icon: Users },
    { id: 'features', label: 'Features', icon: Zap }
  ];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Demo', href: '/demo' },
    { label: 'Components', href: '/demo/components' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'secondary', 
      pending: 'warning'
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchDemoData();
  };

  const handleExport = () => {
    console.log('Exporting data...', data);
  };

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log(`Bulk ${action} for items:`, selectedIds);
  };

  if (loading) {
    return <LoadingState message="Loading component demonstration..." />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        title="Failed to load component demo"
        retry={handleRefresh}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Component Demo</h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive demonstration of all UI components and their connectivity
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSelector 
                  currentTheme={selectedTheme}
                  onThemeChange={setSelectedTheme}
                />
                <NotificationCenter />
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Enterprise Toolbar */}
          <EnterpriseToolbar
            title="Demo Management"
            actions={[
              {
                label: 'Export Data',
                icon: Download,
                onClick: handleExport,
                variant: 'outline'
              },
              {
                label: 'Share Demo',
                icon: Share2,
                onClick: () => console.log('Sharing demo...'),
                variant: 'outline'
              },
              {
                label: 'Add Item',
                icon: Plus,
                onClick: () => console.log('Adding new item...'),
                variant: 'default'
              }
            ]}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' }
                ]
              }
            ]}
            onBulkAction={handleBulkAction}
          />

          {/* Tab Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {componentSections.map((section, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {section.components.map((component) => (
                        <Badge key={component} variant="outline">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">UI Component Showcase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Buttons</h4>
                      <div className="flex gap-2">
                        <Button size="sm">Small</Button>
                        <Button>Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Badges</h4>
                      <div className="flex gap-2">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Icons</h4>
                      <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <Settings className="h-5 w-5 text-gray-500" />
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">User Profile Demo</h3>
                  <UserProfileCard
                    user={{
                      name: 'John Doe',
                      email: 'john.doe@example.com',
                      role: 'Admin',
                      avatar: '/api/placeholder/40/40',
                      lastLogin: new Date().toISOString()
                    }}
                  />
                </Card>
              </div>
            )}

            {activeTab === 'data' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Data Grid Demo</h3>
                <DataGrid
                  data={data}
                  columns={[
                    {
                      key: 'name',
                      label: 'Name',
                      sortable: true
                    },
                    {
                      key: 'status',
                      label: 'Status',
                      render: (row) => getStatusBadge(row.status)
                    },
                    {
                      key: 'value',
                      label: 'Value',
                      sortable: true,
                      render: (row) => `$${row.value.toLocaleString()}`
                    },
                    {
                      key: 'created',
                      label: 'Created',
                      sortable: true,
                      render: (row) => new Date(row.created).toLocaleDateString()
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (row) => (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  selectable
                  searchable
                  exportable
                />
              </Card>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Workflow Builder Demo</h3>
                  <WorkflowBuilder
                    initialWorkflow={{
                      id: 'demo-workflow',
                      name: 'Demo Workflow',
                      nodes: [],
                      connections: []
                    }}
                    onSave={(workflow) => console.log('Saving workflow:', workflow)}
                  />
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

// Note: metadata moved to layout.tsx due to 'use client' directive