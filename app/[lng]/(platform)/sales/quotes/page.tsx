'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, DollarSign, Calendar, User, Eye,
  Building2, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Quote } from '@/types/sales';

interface QuoteWithCustomer extends Quote {
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  deal_title?: string;
}

export default function QuotesPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [quotes, setQuotes] = useState<QuoteWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sales/quotes', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quotes');
      }
      
      setQuotes(data.data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchQuotes();
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer_company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'outline',
      'sent': 'secondary',
      'viewed': 'secondary',
      'accepted': 'default',
      'rejected': 'destructive',
      'expired': 'destructive'
    } as const;

    const icons = {
      'draft': <FileText className="h-3 w-3" />,
      'sent': <CheckCircle className="h-3 w-3" />,
      'viewed': <Eye className="h-3 w-3" />,
      'accepted': <CheckCircle className="h-3 w-3" />,
      'rejected': <XCircle className="h-3 w-3" />,
      'expired': <Clock className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </Badge>
    );
  };

  const columns = [
    {
      key: 'quote_number',
      header: lng === 'ar' ? 'رقم عرض الأسعار' : 'Quote Number',
      render: (quote: QuoteWithCustomer) => (
        <div className="font-medium text-blue-600">
          {quote.quote_number}
        </div>
      )
    },
    {
      key: 'customer',
      header: lng === 'ar' ? 'العميل' : 'Customer',
      render: (quote: QuoteWithCustomer) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{quote.customer_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 rtl:space-x-reverse">
            <Building2 className="h-3 w-3" />
            <span>{quote.customer_company || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'deal_title',
      header: lng === 'ar' ? 'الصفقة' : 'Deal',
      render: (quote: QuoteWithCustomer) => (
        <span className="text-sm">{quote.deal_title || 'N/A'}</span>
      )
    },
    {
      key: 'total_amount',
      header: lng === 'ar' ? 'إجمالي المبلغ' : 'Total Amount',
      render: (quote: QuoteWithCustomer) => (
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${quote.total_amount.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: lng === 'ar' ? 'الحالة' : 'Status',
      render: (quote: QuoteWithCustomer) => getStatusBadge(quote.status)
    },
    {
      key: 'valid_until',
      header: lng === 'ar' ? 'صالح حتى' : 'Valid Until',
      render: (quote: QuoteWithCustomer) => (
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: lng === 'ar' ? 'عرض أسعار جديد' : 'New Quote',
      icon: Plus,
      onClick: () => console.log('Create new quote'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: lng === 'ar' ? 'جميع الحالات' : 'All Status' },
    { value: 'draft', label: lng === 'ar' ? 'مسودة' : 'Draft' },
    { value: 'sent', label: lng === 'ar' ? 'مرسل' : 'Sent' },
    { value: 'viewed', label: lng === 'ar' ? 'تم العرض' : 'Viewed' },
    { value: 'accepted', label: lng === 'ar' ? 'مقبول' : 'Accepted' },
    { value: 'rejected', label: lng === 'ar' ? 'مرفوض' : 'Rejected' },
    { value: 'expired', label: lng === 'ar' ? 'منتهي الصلاحية' : 'Expired' }
  ];

  // Calculate summary stats
  const totalValue = quotes.reduce((sum, quote) => sum + quote.total_amount, 0);
  const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted').length;
  const pendingQuotes = quotes.filter(quote => ['sent', 'viewed'].includes(quote.status)).length;
  const conversionRate = quotes.length > 0 ? (acceptedQuotes / quotes.length * 100).toFixed(1) : '0';

  if (loading) {
    return <LoadingState message={lng === 'ar' ? 'جاري تحميل عروض الأسعار...' : 'Loading quotes...'} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lng === 'ar' ? 'فشل في تحميل عروض الأسعار' : 'Failed to Load Quotes'}</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          {lng === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lng === 'ar' ? 'إدارة عروض الأسعار' : 'Quote Management'}</h1>
          <p className="text-gray-600">
            {lng === 'ar' ? 'إنشاء وإدارة وتتبع عروض الأسعار والمقترحات' : 'Create, manage, and track sales quotes and proposals'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'إجمالي عروض الأسعار' : 'Total Quotes'}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'جميع الأوقات' : 'All time quotes'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'مقبول' : 'Accepted'}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedQuotes}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'مقبول بنجاح' : 'Successfully accepted'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'معلق' : 'Pending'}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingQuotes}</div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'في انتظار الرد' : 'Awaiting response'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lng === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {conversionRate}%
            </div>
            <p className="text-xs text-gray-500">
              {lng === 'ar' ? 'معدل القبول' : 'Acceptance rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>{lng === 'ar' ? 'نظرة عامة على عروض الأسعار' : 'Quotes Overview'}</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={lng === 'ar' ? 'البحث في عروض الأسعار...' : 'Search quotes...'}
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredQuotes}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}