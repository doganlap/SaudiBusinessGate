'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Calendar, Clock, User, 
  Building2, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, Eye, Scale 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Contract } from '@/types/sales';

interface ContractWithDetails extends Contract {
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  deal_title?: string;
  days_until_expiry?: number;
  is_expiring_soon?: boolean;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sales/contracts', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contracts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch contracts');
      }
      
      setContracts(data.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchContracts();
  };

  const calculateDaysUntilExpiry = (endDate?: string): { days: number | undefined; isExpiringSoon: boolean } => {
    if (!endDate) return { days: undefined, isExpiringSoon: false };
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { 
      days: days >= 0 ? days : undefined, 
      isExpiringSoon: days > 0 && days <= 30 
    };
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.deal_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string, isExpiringSoon?: boolean) => {
    const variants = {
      'draft': 'outline',
      'pending_review': 'secondary',
      'under_negotiation': 'warning',
      'approved': 'default',
      'signed': 'success',
      'active': 'default',
      'expired': 'destructive',
      'terminated': 'destructive',
      'cancelled': 'destructive'
    } as const;

    const icons = {
      'draft': <FileText className="h-3 w-3" />,
      'pending_review': <Clock className="h-3 w-3" />,
      'under_negotiation': <Scale className="h-3 w-3" />,
      'approved': <CheckCircle className="h-3 w-3" />,
      'signed': <CheckCircle className="h-3 w-3" />,
      'active': <CheckCircle className="h-3 w-3" />,
      'expired': <XCircle className="h-3 w-3" />,
      'terminated': <XCircle className="h-3 w-3" />,
      'cancelled': <AlertCircle className="h-3 w-3" />
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'outline'}
        className={isExpiringSoon ? 'animate-pulse' : ''}
      >
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </Badge>
    );
  };

  const getExpiryBadge = (daysUntilExpiry?: number) => {
    if (daysUntilExpiry === undefined) return null;
    
    if (daysUntilExpiry <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge variant="destructive">{daysUntilExpiry} days</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="warning">{daysUntilExpiry} days</Badge>;
    } else {
      return <Badge variant="outline">{daysUntilExpiry} days</Badge>;
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Contract Title',
      render: (contract: ContractWithDetails) => (
        <div className="space-y-1">
          <div className="font-medium text-blue-600">
            {contract.title}
          </div>
          {contract.deal_title && (
            <div className="text-sm text-gray-500">
              Deal: {contract.deal_title}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (contract: ContractWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{contract.customer_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="h-3 w-3" />
            <span>{contract.customer_company || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (contract: ContractWithDetails) => getStatusBadge(contract.status, contract.is_expiring_soon)
    },
    {
      key: 'date_range',
      header: 'Contract Period',
      render: (contract: ContractWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'expiry',
      header: 'Expires In',
      render: (contract: ContractWithDetails) => getExpiryBadge(contract.days_until_expiry)
    }
  ];

  const toolbarActions = [
    {
      label: 'New Contract',
      icon: Plus,
      onClick: () => console.log('Create new contract'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'under_negotiation', label: 'Under Negotiation' },
    { value: 'approved', label: 'Approved' },
    { value: 'signed', label: 'Signed' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Calculate summary stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(contract => contract.status === 'active').length;
  const pendingContracts = contracts.filter(contract => ['pending_review', 'under_negotiation'].includes(contract.status)).length;
  const expiringContracts = contracts.filter(contract => {
    const { days } = calculateDaysUntilExpiry(contract.end_date);
    return days !== undefined && days > 0 && days <= 30;
  }).length;

  if (loading) {
    return <LoadingState message="Loading contracts..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Contracts</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-gray-600">
            Manage sales contracts and agreements
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-gray-500">
              All contracts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeContracts}</div>
            <p className="text-xs text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingContracts}</div>
            <p className="text-xs text-gray-500">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringContracts}</div>
            <p className="text-xs text-gray-500">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search contracts..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredContracts}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}