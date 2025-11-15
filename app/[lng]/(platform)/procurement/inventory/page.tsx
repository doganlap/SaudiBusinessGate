'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Plus, AlertTriangle, TrendingDown, 
  TrendingUp, BarChart3, Calendar, DollarSign, MapPin
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  movementType: 'fast' | 'medium' | 'slow';
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/procurement/inventory', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Mock data
      setInventory([
        {
          id: '1', sku: 'OFF-001', name: 'Office Chairs', category: 'Furniture',
          description: 'Ergonomic office chairs with lumbar support', currentStock: 25, minStock: 10, maxStock: 50,
          unitPrice: 299, totalValue: 7475, location: 'Warehouse A', supplier: 'Furniture Solutions',
          lastRestocked: '2024-01-05', status: 'in-stock', movementType: 'medium'
        },
        {
          id: '2', sku: 'IT-002', name: 'Laptops', category: 'IT Equipment',
          description: 'Business laptops for development team', currentStock: 3, minStock: 5, maxStock: 20,
          unitPrice: 1299, totalValue: 3897, location: 'IT Storage', supplier: 'Tech Equipment Co',
          lastRestocked: '2024-01-10', status: 'low-stock', movementType: 'fast'
        },
        {
          id: '3', sku: 'SUP-003', name: 'Printer Paper', category: 'Office Supplies',
          description: 'A4 white printer paper, 500 sheets per pack', currentStock: 0, minStock: 20, maxStock: 100,
          unitPrice: 8, totalValue: 0, location: 'Supply Room', supplier: 'Office Supplies Inc',
          lastRestocked: '2023-12-15', status: 'out-of-stock', movementType: 'fast'
        },
        {
          id: '4', sku: 'OFF-004', name: 'Desk Lamps', category: 'Furniture',
          description: 'LED desk lamps with adjustable brightness', currentStock: 45, minStock: 15, maxStock: 30,
          unitPrice: 89, totalValue: 4005, location: 'Warehouse A', supplier: 'Furniture Solutions',
          lastRestocked: '2024-01-08', status: 'overstocked', movementType: 'slow'
        },
        {
          id: '5', sku: 'IT-005', name: 'Monitors', category: 'IT Equipment',
          description: '24-inch LED monitors for workstations', currentStock: 18, minStock: 10, maxStock: 25,
          unitPrice: 249, totalValue: 4482, location: 'IT Storage', supplier: 'Tech Equipment Co',
          lastRestocked: '2024-01-12', status: 'in-stock', movementType: 'medium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return Package;
      case 'low-stock': return AlertTriangle;
      case 'out-of-stock': return TrendingDown;
      case 'overstocked': return TrendingUp;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-yellow-600';
      case 'out-of-stock': return 'text-red-600';
      case 'overstocked': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const columns = [
    {
      key: 'item',
      header: 'Item',
      render: (item: InventoryItem) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">{item.sku}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: InventoryItem) => (
        <span className="font-medium">{item.category}</span>
      )
    },
    {
      key: 'stock',
      header: 'Stock Level',
      render: (item: InventoryItem) => {
        const StatusIcon = getStatusIcon(item.status);
        const colorClass = getStatusColor(item.status);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-4 w-4 ${colorClass}`} />
              <span className="font-medium">{item.currentStock}</span>
            </div>
            <div className="text-xs text-gray-500">
              Min: {item.minStock} | Max: {item.maxStock}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryItem) => (
        <Badge variant={
          item.status === 'in-stock' ? 'default' :
          item.status === 'low-stock' ? 'secondary' :
          item.status === 'out-of-stock' ? 'destructive' : 'outline'
        }>
          {item.status === 'in-stock' ? 'In Stock' :
           item.status === 'low-stock' ? 'Low Stock' :
           item.status === 'out-of-stock' ? 'Out of Stock' : 'Overstocked'}
        </Badge>
      )
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (item: InventoryItem) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${item.unitPrice.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (item: InventoryItem) => (
        <span className="font-bold text-green-600">${item.totalValue.toLocaleString()}</span>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: InventoryItem) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{item.location}</span>
        </div>
      )
    },
    {
      key: 'movement',
      header: 'Movement',
      render: (item: InventoryItem) => (
        <Badge variant={
          item.movementType === 'fast' ? 'default' :
          item.movementType === 'medium' ? 'secondary' : 'outline'
        }>
          {item.movementType.charAt(0).toUpperCase() + item.movementType.slice(1)}
        </Badge>
      )
    },
    {
      key: 'lastRestocked',
      header: 'Last Restocked',
      render: (item: InventoryItem) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(item.lastRestocked).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'Add Item',
      icon: Plus,
      onClick: () => console.log('Add inventory item'),
      variant: 'primary' as const
    },
    {
      label: 'Restock Alert',
      icon: AlertTriangle,
      onClick: () => console.log('View restock alerts'),
      variant: 'outline' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'overstocked', label: 'Overstocked' }
  ];

  // Calculate summary stats
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const inStockItems = inventory.filter(item => item.status === 'in-stock').length;

  if (loading) return <LoadingState message="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-gray-600">Track and manage inventory levels and stock movements</p>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500">Unique SKUs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inStockItems}</div>
            <p className="text-xs text-gray-500">
              {Math.round((inStockItems / totalItems) * 100)}% of items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restock Needed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-gray-500">Low or out of stock</p>
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
            <p className="text-xs text-gray-500">Inventory worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search inventory..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredInventory}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
