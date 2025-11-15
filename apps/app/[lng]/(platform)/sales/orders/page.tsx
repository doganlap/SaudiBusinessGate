'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Order } from '@/types/sales';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/sales/orders', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'order_number', header: 'Order Number' },
    { key: 'status', header: 'Status' },
    { key: 'total_amount', header: 'Total Amount' },
    { key: 'order_date', header: 'Order Date' },
  ];

  if (loading) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            actions={[{ label: 'New Order', icon: Plus, onClick: () => console.log('New Order') }]}
          />
          <DataGrid data={orders} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}