'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Briefcase, DollarSign, Calendar, 
  TrendingUp, Clock, Target, Users 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Deal {
  id: string;
  name: string;
  company: string;
  contact: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  lastActivity: string;
  assignedTo: string;
  source: string;
  notes: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/sales/deals', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStage === 'all' || deal.stage === filterStage;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'name',
      header: 'Deal',
      render: (deal: Deal) => (
        <div>
          <div className="font-medium">{deal.name}</div>
          <div className="text-sm text-gray-500">{deal.company}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{deal.contact}</span>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Value',
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${deal.value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (deal: Deal) => (
        <Badge variant={
          deal.stage === 'closed-won' ? 'default' :
          deal.stage === 'closed-lost' ? 'destructive' :
          deal.stage === 'negotiation' ? 'secondary' : 'outline'
        }>
          {deal.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )
    },
    {
      key: 'probability',
      header: 'Probability',
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                deal.probability >= 75 ? 'bg-green-500' :
                deal.probability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-sm font-medium">{deal.probability}%</span>
        </div>
      )
    },
    {
      key: 'expectedCloseDate',
      header: 'Expected Close',
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'assignedTo',
      header: 'Owner',
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {deal.assignedTo.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-sm">{deal.assignedTo}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Deal',
      icon: Plus,
      onClick: () => console.log('Create new deal'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  // Calculate summary stats
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = deals.filter(deal => !deal.stage.includes('closed')).length;
  const wonDeals = deals.filter(deal => deal.stage === 'closed-won').length;
  const avgDealSize = totalValue / deals.length || 0;
  const weightedPipeline = deals
    .filter(deal => !deal.stage.includes('closed'))
    .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  if (loading) {
    return <LoadingState message="Loading deals..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Management</h1>
          <p className="text-gray-600">
            Track and manage your sales opportunities
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {deals.length} total deals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${weightedPipeline.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Probability adjusted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeDeals}</div>
            <p className="text-xs text-gray-500">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{wonDeals}</div>
            <p className="text-xs text-gray-500">
              Successfully closed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgDealSize.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Average value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deals Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search deals..."
            actions={toolbarActions}
            filterValue={filterStage}
            onFilterChange={setFilterStage}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredDeals}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
