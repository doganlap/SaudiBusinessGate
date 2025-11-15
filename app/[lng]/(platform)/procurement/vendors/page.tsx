'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Plus, Phone, Mail, MapPin, 
  Star, DollarSign, Calendar, Package, Users
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: string;
  status: 'active' | 'inactive' | 'pending' | 'blacklisted';
  rating: number;
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  paymentTerms: string;
  deliveryTime: string;
  notes: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/procurement/vendors', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Mock data
      setVendors([
        {
          id: '1', name: 'Office Supplies Inc', contactPerson: 'John Smith', 
          email: 'john@officesupplies.com', phone: '+1-555-0123', address: '123 Business Ave',
          city: 'New York', country: 'USA', category: 'Office Supplies', status: 'active',
          rating: 4.5, totalOrders: 45, totalValue: 125000, lastOrder: '2024-01-10',
          paymentTerms: 'Net 30', deliveryTime: '3-5 days', notes: 'Reliable supplier'
        },
        {
          id: '2', name: 'Tech Equipment Co', contactPerson: 'Sarah Johnson',
          email: 'sarah@techequip.com', phone: '+1-555-0456', address: '456 Tech Blvd',
          city: 'San Francisco', country: 'USA', category: 'IT Equipment', status: 'active',
          rating: 4.8, totalOrders: 28, totalValue: 350000, lastOrder: '2024-01-08',
          paymentTerms: 'Net 15', deliveryTime: '1-2 weeks', notes: 'Premium quality'
        },
        {
          id: '3', name: 'Furniture Solutions', contactPerson: 'Mike Chen',
          email: 'mike@furniture.com', phone: '+1-555-0789', address: '789 Design St',
          city: 'Chicago', country: 'USA', category: 'Furniture', status: 'active',
          rating: 4.2, totalOrders: 15, totalValue: 85000, lastOrder: '2024-01-05',
          paymentTerms: 'Net 45', deliveryTime: '2-3 weeks', notes: 'Custom designs available'
        },
        {
          id: '4', name: 'Cleaning Services Pro', contactPerson: 'Lisa Anderson',
          email: 'lisa@cleanpro.com', phone: '+1-555-0321', address: '321 Service Rd',
          city: 'Boston', country: 'USA', category: 'Services', status: 'pending',
          rating: 0, totalOrders: 0, totalValue: 0, lastOrder: '',
          paymentTerms: 'Net 30', deliveryTime: 'Same day', notes: 'New vendor evaluation'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'vendor',
      header: 'Vendor',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{vendor.name}</div>
            <div className="text-sm text-gray-500">{vendor.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (vendor: Vendor) => (
        <div>
          <div className="font-medium">{vendor.contactPerson}</div>
          <div className="space-y-1 mt-1">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-3 w-3 text-gray-400" />
              <span>{vendor.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{vendor.phone}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{vendor.city}, {vendor.country}</span>
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">
            {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-purple-600" />
          <span className="font-medium">{vendor.totalOrders}</span>
        </div>
      )
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${vendor.totalValue.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (vendor: Vendor) => (
        <Badge variant={
          vendor.status === 'active' ? 'default' :
          vendor.status === 'pending' ? 'secondary' :
          vendor.status === 'blacklisted' ? 'destructive' : 'outline'
        }>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      render: (vendor: Vendor) => (
        <span className="text-sm">{vendor.paymentTerms}</span>
      )
    },
    {
      key: 'deliveryTime',
      header: 'Delivery Time',
      render: (vendor: Vendor) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{vendor.deliveryTime}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Vendor',
      icon: Plus,
      onClick: () => console.log('Create new vendor'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'blacklisted', label: 'Blacklisted' }
  ];

  // Calculate summary stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const totalValue = vendors.reduce((sum, v) => sum + v.totalValue, 0);
  const avgRating = vendors.filter(v => v.rating > 0).reduce((sum, v) => sum + v.rating, 0) / 
                   vendors.filter(v => v.rating > 0).length || 0;

  if (loading) return <LoadingState message="Loading vendors..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-gray-600">Manage supplier relationships and vendor information</p>
        </div>
      </div>

      {/* Vendor Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-gray-500">Registered suppliers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
            <p className="text-xs text-gray-500">
              {Math.round((activeVendors / totalVendors) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Lifetime value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500">Vendor performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search vendors..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredVendors}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
