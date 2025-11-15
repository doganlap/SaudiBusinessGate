'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, Building2, Mail, Phone, 
  MapPin, Calendar, DollarSign, Star, Activity
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  industry: string;
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalValue: number;
  lastOrder: string;
  createdAt: string;
  assignedTo: string;
  notes: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/crm/customers', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback data for demo
      setCustomers([
        {
          id: '1',
          name: 'John Smith',
          company: 'TechCorp Solutions',
          email: 'john.smith@techcorp.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave',
          city: 'San Francisco',
          country: 'USA',
          industry: 'Technology',
          status: 'active',
          tier: 'gold',
          totalValue: 250000,
          lastOrder: '2024-01-10',
          createdAt: '2023-06-15',
          assignedTo: 'Sarah Johnson',
          notes: 'Key enterprise customer, high satisfaction'
        },
        {
          id: '2',
          name: 'Emily Davis',
          company: 'Innovate.io',
          email: 'emily.davis@innovate.io',
          phone: '+1 (555) 987-6543',
          address: '456 Innovation Blvd',
          city: 'Austin',
          country: 'USA',
          industry: 'Software',
          status: 'active',
          tier: 'silver',
          totalValue: 125000,
          lastOrder: '2024-01-08',
          createdAt: '2023-09-20',
          assignedTo: 'Mike Chen',
          notes: 'Growing startup, potential for upsell'
        },
        {
          id: '3',
          name: 'Robert Wilson',
          company: 'Global Manufacturing',
          email: 'r.wilson@globalmfg.com',
          phone: '+1 (555) 456-7890',
          address: '789 Industrial Way',
          city: 'Detroit',
          country: 'USA',
          industry: 'Manufacturing',
          status: 'prospect',
          tier: 'bronze',
          totalValue: 0,
          lastOrder: '',
          createdAt: '2024-01-15',
          assignedTo: 'Alex Rodriguez',
          notes: 'New prospect, evaluating our solutions'
        },
        {
          id: '4',
          name: 'Lisa Anderson',
          company: 'Healthcare Plus',
          email: 'l.anderson@healthplus.com',
          phone: '+1 (555) 321-0987',
          address: '321 Medical Center Dr',
          city: 'Boston',
          country: 'USA',
          industry: 'Healthcare',
          status: 'active',
          tier: 'platinum',
          totalValue: 500000,
          lastOrder: '2024-01-12',
          createdAt: '2022-03-10',
          assignedTo: 'Sarah Johnson',
          notes: 'Premium customer, excellent relationship'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.company}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (customer: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{customer.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{customer.city}, {customer.country}</span>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Industry',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{customer.industry}</span>
        </div>
      )
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <Star className={`h-4 w-4 ${
            customer.tier === 'platinum' ? 'text-purple-500' :
            customer.tier === 'gold' ? 'text-yellow-500' :
            customer.tier === 'silver' ? 'text-gray-400' : 'text-orange-600'
          }`} />
          <Badge variant={
            customer.tier === 'platinum' ? 'default' :
            customer.tier === 'gold' ? 'secondary' : 'outline'
          }>
            {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${customer.totalValue.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (customer: Customer) => (
        <Badge variant={
          customer.status === 'active' ? 'default' :
          customer.status === 'prospect' ? 'secondary' :
          customer.status === 'churned' ? 'destructive' : 'outline'
        }>
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'assignedTo',
      header: 'Account Manager',
      render: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{customer.assignedTo.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <span className="text-sm">{customer.assignedTo}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Customer',
      icon: Plus,
      onClick: () => console.log('Create new customer'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'churned', label: 'Churned' }
  ];

  // Calculate summary stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalValue = customers.reduce((sum, c) => sum + c.totalValue, 0);
  const avgCustomerValue = totalValue / totalCustomers || 0;

  if (loading) {
    return <LoadingState message="Loading customers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-gray-600">
            Manage your customer relationships and accounts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-gray-500">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
            <p className="text-xs text-gray-500">
              {Math.round((activeCustomers / totalCustomers) * 100)}% of total
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
              Customer lifetime value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${avgCustomerValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Average per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search customers..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredCustomers}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
