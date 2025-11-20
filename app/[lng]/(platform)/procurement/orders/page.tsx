'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Package, Calendar, DollarSign, Building2, Clock, CheckCircle } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendor: string;
  description: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  approvedBy?: string;
  orderDate: string;
  expectedDelivery: string;
  category: string;
  items: number;
}

export default function ProcurementOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.lng as string) || 'en';

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/procurement/orders', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.orders) {
        // Map API response to component state
        const mappedOrders = data.orders.map((order: any) => ({
          id: order.id || '',
          orderNumber: order.orderNumber || order.po_number || '',
          vendor: order.vendorName || order.vendor_name || '',
          description: order.description || order.notes || '',
          totalAmount: parseFloat(order.totalAmount || order.total_amount || 0),
          status: order.status || 'draft',
          priority: order.priority || 'medium',
          requestedBy: order.requestedBy || order.created_by || '',
          approvedBy: order.approvedBy || order.approved_by,
          orderDate: order.orderDate || order.order_date || new Date().toISOString().split('T')[0],
          expectedDelivery: order.expectedDelivery || order.expected_delivery_date || '',
          category: order.category || '',
          items: order.items || order.item_count || 0,
        }));
        setOrders(mappedOrders);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      // Keep empty array on error instead of mock data
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'order',
      header: 'Order',
      render: (order: PurchaseOrder) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{order.orderNumber}</div>
            <div className="text-sm text-gray-500">{order.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (order: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{order.vendor}</span>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (order: PurchaseOrder) => (
        <div>
          <div className="font-medium">{order.description}</div>
          <div className="text-sm text-gray-500">{order.items} items</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (order: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${order.totalAmount.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: PurchaseOrder) => (
        <Badge variant={
          order.status === 'received' ? 'default' :
          order.status === 'approved' || order.status === 'ordered' ? 'secondary' :
          order.status === 'cancelled' ? 'destructive' : 'outline'
        }>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (order: PurchaseOrder) => (
        <Badge variant={
          order.priority === 'urgent' || order.priority === 'high' ? 'destructive' :
          order.priority === 'medium' ? 'secondary' : 'outline'
        }>
          {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
        </Badge>
      )
    },
    {
      key: 'expectedDelivery',
      header: 'Expected Delivery',
      render: (order: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(order.expectedDelivery).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'requestedBy',
      header: 'Requested By',
      render: (order: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{order.requestedBy.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <span className="text-sm">{order.requestedBy}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Order',
      icon: Plus,
      onClick: () => router.push('/procurement/orders/create'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) return <LoadingState message="Loading purchase orders..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-gray-600">Manage procurement and purchase orders</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'received').length}
            </div>
            <p className="text-xs text-gray-500">Successfully delivered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Purchase Orders</span>
          </CardTitle>
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
          <DataGrid data={filteredOrders} columns={columns} searchable={false} sortable={true} />
        </CardContent>
      </Card>
    </div>
  );
}
