'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Package, DollarSign, Calendar, User, 
  Building2, CheckCircle, Clock, Truck, 
  TrendingUp, AlertCircle, Eye, FileText, XCircle 
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Order } from '@/types/sales';

interface OrderWithDetails extends Order {
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  quote_number?: string;
  contract_title?: string;
  days_since_order?: number;
}

export default function OrdersPage() {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sales/orders', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchOrders();
  };

  const calculateDaysSinceOrder = (orderDate?: string): number | undefined => {
    if (!orderDate) return undefined;
    const order = new Date(orderDate);
    const now = new Date();
    const diffTime = now.getTime() - order.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.quote_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'outline',
      'pending': 'secondary',
      'confirmed': 'default',
      'processing': 'warning',
      'shipped': 'default',
      'delivered': 'success',
      'cancelled': 'destructive',
      'returned': 'destructive'
    } as const;

    const icons = {
      'draft': <FileText className="h-3 w-3" />,
      'pending': <Clock className="h-3 w-3" />,
      'confirmed': <CheckCircle className="h-3 w-3" />,
      'processing': <Package className="h-3 w-3" />,
      'shipped': <Truck className="h-3 w-3" />,
      'delivered': <CheckCircle className="h-3 w-3" />,
      'cancelled': <XCircle className="h-3 w-3" />,
      'returned': <AlertCircle className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
      </Badge>
    );
  };

  const getDaysBadge = (daysSinceOrder?: number) => {
    if (daysSinceOrder === undefined) return null;
    
    if (daysSinceOrder <= 1) {
      return <Badge variant="outline">New</Badge>;
    } else if (daysSinceOrder <= 7) {
      return <Badge variant="secondary">{daysSinceOrder} days</Badge>;
    } else if (daysSinceOrder <= 30) {
      return <Badge variant="warning">{daysSinceOrder} days</Badge>;
    } else {
      return <Badge variant="outline">{daysSinceOrder} days</Badge>;
    }
  };

  const columns = [
    {
      key: 'order_number',
      header: 'Order Number',
      render: (order: OrderWithDetails) => (
        <div className="font-medium text-blue-600">
          {order.order_number}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: OrderWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{order.customer_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Building2 className="h-3 w-3" />
            <span>{order.customer_company || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'related_documents',
      header: 'Related Documents',
      render: (order: OrderWithDetails) => (
        <div className="space-y-1 text-sm">
          {order.quote_number && (
            <div className="text-blue-600">Quote: {order.quote_number}</div>
          )}
          {order.contract_title && (
            <div className="text-green-600">Contract: {order.contract_title}</div>
          )}
        </div>
      )
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (order: OrderWithDetails) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${order.total_amount.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: OrderWithDetails) => getStatusBadge(order.status)
    },
    {
      key: 'order_date',
      header: 'Order Date',
      render: (order: OrderWithDetails) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {getDaysBadge(order.days_since_order)}
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Order',
      icon: Plus,
      onClick: () => console.log('Create new order'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ];

  // Calculate summary stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  if (loading) {
    return <LoadingState message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Orders</h3>
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
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-gray-600">
            Track and manage customer orders and fulfillment
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-gray-500">
              All orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-gray-500">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            <p className="text-xs text-gray-500">
              Delivered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search orders..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredOrders}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}