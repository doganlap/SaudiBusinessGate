'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Calendar, Clock, User, 
  Building2, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, Send, Eye 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { RFQ } from '@/types/sales';

interface RFQWithCustomer extends RFQ {
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  days_until_due?: number;
}

export default function RfqsPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [rfqs, setRfqs] = useState<RFQWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sales/rfqs', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RFQs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch RFQs');
      }
      
      setRfqs(data.data || []);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchRfqs();
  };

  const calculateDaysUntilDue = (dueDate?: string): number | undefined => {
    if (!dueDate) return undefined;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = rfq.rfq_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.customer_company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || rfq.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string, daysUntilDue?: number) => {
    const variants = {
      'draft': 'outline',
      'sent': 'secondary',
      'received': 'secondary',
      'under_review': 'warning',
      'responded': 'default',
      'accepted': 'default',
      'rejected': 'destructive',
      'expired': 'destructive'
    } as const;

    const icons = {
      'draft': <FileText className="h-3 w-3" />,
      'sent': <Send className="h-3 w-3" />,
      'received': <CheckCircle className="h-3 w-3" />,
      'under_review': <Clock className="h-3 w-3" />,
      'responded': <Eye className="h-3 w-3" />,
      'accepted': <CheckCircle className="h-3 w-3" />,
      'rejected': <XCircle className="h-3 w-3" />,
      'expired': <AlertCircle className="h-3 w-3" />
    };

    const isUrgent = daysUntilDue !== undefined && daysUntilDue <= 3 && daysUntilDue >= 0;

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'outline'}
        className={isUrgent ? 'animate-pulse' : ''}
      >
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </Badge>
    );
  };

  const getUrgencyBadge = (daysUntilDue?: number) => {
    if (daysUntilDue === undefined) return null;
    
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge variant="destructive">{daysUntilDue} days</Badge>;
    } else if (daysUntilDue <= 7) {
      return <Badge variant="warning">{daysUntilDue} days</Badge>;
    } else {
      return <Badge variant="outline">{daysUntilDue} days</Badge>;
    }
  };

  const columns = [
    {
      key: 'rfq_number',
      header: 'RFQ Number',
      render: (rfq: RFQWithCustomer) => (
        <div className="font-medium text-blue-600">
          {rfq.rfq_number}
        </div>
      )
    },
    {
      key: 'title',
      header: 'Title & Description',
      render: (rfq: RFQWithCustomer) => (
        <div className="space-y-1">
          <div className="font-medium">{rfq.title}</div>
          {rfq.description && (
            <div className="text-sm text-gray-500 line-clamp-2">
              {rfq.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (rfq: RFQWithCustomer) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{rfq.customer_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="h-3 w-3" />
            <span>{rfq.customer_company || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (rfq: RFQWithCustomer) => getStatusBadge(rfq.status, rfq.days_until_due)
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (rfq: RFQWithCustomer) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {rfq.due_date ? new Date(rfq.due_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {getUrgencyBadge(rfq.days_until_due)}
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New RFQ',
      icon: Plus,
      onClick: () => console.log('Create new RFQ'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'received', label: 'Received' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'responded', label: 'Responded' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  // Calculate summary stats
  const totalRfqs = rfqs.length;
  const pendingRfqs = rfqs.filter(rfq => ['sent', 'received', 'under_review'].includes(rfq.status)).length;
  const overdueRfqs = rfqs.filter(rfq => {
    const daysUntilDue = calculateDaysUntilDue(rfq.due_date);
    return daysUntilDue !== undefined && daysUntilDue < 0;
  }).length;
  const responseRate = totalRfqs > 0 ? 
    (rfqs.filter(rfq => ['responded', 'accepted', 'rejected'].includes(rfq.status)).length / totalRfqs * 100).toFixed(1) : '0';

  if (loading) {
    return <LoadingState message="Loading RFQs..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load RFQs</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Request for Quotes</h1>
          <p className="text-gray-600">
            Manage customer requests for pricing and quotations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRfqs}</div>
            <p className="text-xs text-gray-500">
              All requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRfqs}</div>
            <p className="text-xs text-gray-500">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueRfqs}</div>
            <p className="text-xs text-gray-500">
              Past due date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {responseRate}%
            </div>
            <p className="text-xs text-gray-500">
              Response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RFQs Table */}
      <Card>
        <CardHeader>
          <CardTitle>RFQs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search RFQs..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredRfqs}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}