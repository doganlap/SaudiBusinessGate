'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Calendar, Clock, User, 
  Building2, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, Eye, Send, Edit3 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Proposal } from '@/types/sales';

interface ProposalWithDetails extends Proposal {
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  deal_title?: string;
  quote_number?: string;
  days_since_created?: number;
  sections_count?: number;
}

export default function ProposalsPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sales/proposals', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch proposals');
      }
      
      setProposals(data.data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchProposals();
  };

  const calculateDaysSinceCreated = (createdAt?: string): number | undefined => {
    if (!createdAt) return undefined;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.deal_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.quote_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || proposal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'outline',
      'in_progress': 'secondary',
      'under_review': 'warning',
      'sent': 'default',
      'viewed': 'secondary',
      'accepted': 'success',
      'rejected': 'destructive',
      'expired': 'destructive',
      'withdrawn': 'destructive'
    } as const;

    const icons = {
      'draft': <Edit3 className="h-3 w-3" />,
      'in_progress': <FileText className="h-3 w-3" />,
      'under_review': <Clock className="h-3 w-3" />,
      'sent': <Send className="h-3 w-3" />,
      'viewed': <Eye className="h-3 w-3" />,
      'accepted': <CheckCircle className="h-3 w-3" />,
      'rejected': <XCircle className="h-3 w-3" />,
      'expired': <AlertCircle className="h-3 w-3" />,
      'withdrawn': <XCircle className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </Badge>
    );
  };

  const getAgeBadge = (daysSinceCreated?: number) => {
    if (daysSinceCreated === undefined) return null;
    
    if (daysSinceCreated <= 1) {
      return <Badge variant="outline">New</Badge>;
    } else if (daysSinceCreated <= 7) {
      return <Badge variant="secondary">{daysSinceCreated} days</Badge>;
    } else if (daysSinceCreated <= 30) {
      return <Badge variant="warning">{daysSinceCreated} days</Badge>;
    } else {
      return <Badge variant="outline">{daysSinceCreated} days</Badge>;
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Proposal Title',
      render: (proposal: ProposalWithDetails) => (
        <div className="space-y-1">
          <div className="font-medium text-blue-600">
            {proposal.title}
          </div>
          {proposal.content && (
            <div className="text-sm text-gray-500 line-clamp-2">
              {proposal.content.substring(0, 100)}...
            </div>
          )}
        </div>
      )
    },
    {
      key: 'related_documents',
      header: 'Related Documents',
      render: (proposal: ProposalWithDetails) => (
        <div className="space-y-1 text-sm">
          {proposal.deal_title && (
            <div className="text-blue-600">Deal: {proposal.deal_title}</div>
          )}
          {proposal.quote_number && (
            <div className="text-green-600">Quote: {proposal.quote_number}</div>
          )}
          {proposal.sections_count && (
            <div className="text-gray-500">{proposal.sections_count} sections</div>
          )}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (proposal: ProposalWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{proposal.customer_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="h-3 w-3" />
            <span>{proposal.customer_company || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (proposal: ProposalWithDetails) => getStatusBadge(proposal.status)
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (proposal: ProposalWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {getAgeBadge(proposal.days_since_created)}
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Proposal',
      icon: Plus,
      onClick: () => console.log('Create new proposal'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  // Calculate summary stats
  const totalProposals = proposals.length;
  const sentProposals = proposals.filter(proposal => ['sent', 'viewed'].includes(proposal.status)).length;
  const acceptedProposals = proposals.filter(proposal => proposal.status === 'accepted').length;
  const conversionRate = totalProposals > 0 ? (acceptedProposals / totalProposals * 100).toFixed(1) : '0';

  if (loading) {
    return <LoadingState message="Loading proposals..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Proposals</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposal Management</h1>
          <p className="text-gray-600">
            Create and manage sales proposals and presentations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProposals}</div>
            <p className="text-xs text-gray-500">
              All proposals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sentProposals}</div>
            <p className="text-xs text-gray-500">
              With customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedProposals}</div>
            <p className="text-xs text-gray-500">
              Successfully closed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {conversionRate}%
            </div>
            <p className="text-xs text-gray-500">
              Acceptance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proposals Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search proposals..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredProposals}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}