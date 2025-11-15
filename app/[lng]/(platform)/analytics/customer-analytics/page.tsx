'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, DollarSign, Calendar, 
  Target, Activity, Star, MapPin, Phone, Mail
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  avgValue: number;
  growth: number;
  color: string;
}

interface CustomerInsight {
  id: string;
  customerId: string;
  customerName: string;
  segment: string;
  lifetimeValue: number;
  acquisitionDate: string;
  lastPurchase: string;
  purchaseFrequency: number;
  avgOrderValue: number;
  churnRisk: 'low' | 'medium' | 'high';
  satisfaction: number;
  location: string;
}

export default function CustomerAnalyticsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomerAnalytics();
  }, []);

  const fetchCustomerAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/customer-analytics', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setSegments(data.segments || []);
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      // Mock data
      setSegments([
        { id: 'vip', name: 'VIP Customers', count: 45, percentage: 15, avgValue: 25000, growth: 12, color: 'bg-purple-100 text-purple-800' },
        { id: 'loyal', name: 'Loyal Customers', count: 120, percentage: 40, avgValue: 8500, growth: 8, color: 'bg-green-100 text-green-800' },
        { id: 'new', name: 'New Customers', count: 85, percentage: 28, avgValue: 2500, growth: 25, color: 'bg-blue-100 text-blue-800' },
        { id: 'at-risk', name: 'At Risk', count: 50, percentage: 17, avgValue: 1200, growth: -15, color: 'bg-red-100 text-red-800' }
      ]);
      
      setInsights([
        {
          id: '1', customerId: 'C001', customerName: 'TechCorp Solutions', segment: 'VIP',
          lifetimeValue: 125000, acquisitionDate: '2023-01-15', lastPurchase: '2024-01-10',
          purchaseFrequency: 12, avgOrderValue: 8500, churnRisk: 'low', satisfaction: 95,
          location: 'San Francisco, CA'
        },
        {
          id: '2', customerId: 'C002', customerName: 'Innovate.io', segment: 'Loyal',
          lifetimeValue: 45000, acquisitionDate: '2023-06-20', lastPurchase: '2024-01-08',
          purchaseFrequency: 8, avgOrderValue: 3200, churnRisk: 'low', satisfaction: 88,
          location: 'Austin, TX'
        },
        {
          id: '3', customerId: 'C003', customerName: 'Startup Inc', segment: 'New',
          lifetimeValue: 8500, acquisitionDate: '2024-01-05', lastPurchase: '2024-01-12',
          purchaseFrequency: 2, avgOrderValue: 4250, churnRisk: 'medium', satisfaction: 82,
          location: 'Boston, MA'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight =>
    insight.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insight.segment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (insight: CustomerInsight) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{insight.customerName}</div>
            <div className="text-sm text-gray-500">{insight.customerId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'segment',
      header: 'Segment',
      render: (insight: CustomerInsight) => (
        <Badge variant={
          insight.segment === 'VIP' ? 'default' :
          insight.segment === 'Loyal' ? 'secondary' : 'outline'
        }>
          {insight.segment}
        </Badge>
      )
    },
    {
      key: 'lifetimeValue',
      header: 'Lifetime Value',
      render: (insight: CustomerInsight) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${insight.lifetimeValue.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'frequency',
      header: 'Purchase Frequency',
      render: (insight: CustomerInsight) => (
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-purple-600" />
          <span>{insight.purchaseFrequency} orders</span>
        </div>
      )
    },
    {
      key: 'avgOrderValue',
      header: 'Avg Order Value',
      render: (insight: CustomerInsight) => (
        <span className="font-medium">${insight.avgOrderValue.toLocaleString()}</span>
      )
    },
    {
      key: 'churnRisk',
      header: 'Churn Risk',
      render: (insight: CustomerInsight) => (
        <Badge variant={
          insight.churnRisk === 'low' ? 'default' :
          insight.churnRisk === 'medium' ? 'secondary' : 'destructive'
        }>
          {insight.churnRisk.charAt(0).toUpperCase() + insight.churnRisk.slice(1)}
        </Badge>
      )
    },
    {
      key: 'satisfaction',
      header: 'Satisfaction',
      render: (insight: CustomerInsight) => (
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{insight.satisfaction}%</span>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (insight: CustomerInsight) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{insight.location}</span>
        </div>
      )
    }
  ];

  if (loading) return <LoadingState message="Loading customer analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
          <p className="text-gray-600">Deep insights into customer behavior and segmentation</p>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="grid gap-4 md:grid-cols-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{segment.name}</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segment.count}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{segment.percentage}% of total</span>
                <div className={`flex items-center space-x-1 ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{segment.growth}%</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Avg Value: </span>
                <span className="text-xs font-medium">${segment.avgValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search customers..."
            actions={[]}
          />
          <DataGrid data={filteredInsights} columns={columns} searchable={false} sortable={true} />
        </CardContent>
      </Card>
    </div>
  );
}
