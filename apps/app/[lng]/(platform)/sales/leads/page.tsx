'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, Phone, Mail, Calendar, 
  TrendingUp, Star, MapPin, Building2 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  score: number;
  value: number;
  createdAt: string;
  lastContact: string;
  assignedTo: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/sales/leads', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]); // Set leads to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'name',
      header: 'Lead',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{lead?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{lead?.position || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{lead?.company || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (lead: Lead) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{lead?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{lead?.phone || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'score',
      header: 'Score',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Star className={`h-4 w-4 ${(lead?.score || 0) >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`font-medium ${
            (lead?.score || 0) >= 80 ? 'text-green-600' : 
            (lead?.score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {lead?.score || 0}
          </span>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Est. Value',
      render: (lead: Lead) => (
        <span className="font-medium">${(lead?.value || 0).toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: Lead) => (
        <Badge variant={
          lead?.status === 'closed-won' ? 'default' :
          lead?.status === 'closed-lost' ? 'destructive' :
          lead?.status === 'proposal' || lead?.status === 'negotiation' ? 'secondary' : 'outline'
        }>
          {(lead?.status || 'new').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {(lead?.assignedTo || 'N/A').split(' ').map(n => n[0] || '').join('')}
            </span>
          </div>
          <span className="text-sm">{lead?.assignedTo || 'Unassigned'}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Lead',
      icon: Plus,
      onClick: () => console.log('Create new lead'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  // Calculate summary stats
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const qualifiedLeads = leads.filter(lead => ['qualified', 'proposal', 'negotiation'].includes(lead.status)).length;
  const avgScore = leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length || 0;

  if (loading) {
    return <LoadingState message="Loading leads..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-gray-600">
            Track and manage your sales leads and prospects
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-gray-500">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{qualifiedLeads}</div>
            <p className="text-xs text-gray-500">
              Ready for proposal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Total estimated value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {avgScore.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500">
              Lead quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search leads..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredLeads}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
