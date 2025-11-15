'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Filter, Download, ArrowUpDown, 
  Calendar, DollarSign, Building2, User, FileText,
  ArrowRightLeft, TrendingUp, CheckCircle, XCircle,
  Edit, Eye, RefreshCw
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { NoDataState } from '@/components/enterprise/NoDataState';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  account: string;
  category: string;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  tenantId: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/finance/transactions', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback data for demo
      setTransactions([
        {
          id: '1',
          date: '2024-01-15',
          description: 'Office Supplies Purchase',
          amount: -250.00,
          type: 'debit',
          account: 'Office Expenses',
          category: 'Operating Expenses',
          reference: 'PO-2024-001',
          status: 'approved',
          createdBy: 'John Doe',
          tenantId: 'tenant-1'
        },
        {
          id: '2',
          date: '2024-01-14',
          description: 'Client Payment Received',
          amount: 5000.00,
          type: 'credit',
          account: 'Accounts Receivable',
          category: 'Revenue',
          reference: 'INV-2024-001',
          status: 'approved',
          createdBy: 'Jane Smith',
          tenantId: 'tenant-1'
        },
        {
          id: '3',
          date: '2024-01-13',
          description: 'Software License Renewal',
          amount: -1200.00,
          type: 'debit',
          account: 'Software Expenses',
          category: 'Technology',
          reference: 'SUB-2024-001',
          status: 'pending',
          createdBy: 'Mike Johnson',
          tenantId: 'tenant-1'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (transaction: Transaction) => (
        <div>
          <div className="font-medium">{transaction.description}</div>
          <div className="text-sm text-gray-500">{transaction.reference}</div>
        </div>
      )
    },
    {
      key: 'account',
      header: 'Account',
      render: (transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{transaction.account}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (transaction: Transaction) => (
        <div className={`flex items-center space-x-2 font-medium ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          <DollarSign className="h-4 w-4" />
          <span>
            {transaction.type === 'credit' ? '+' : '-'}
            ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (transaction: Transaction) => (
        <Badge variant={
          transaction.status === 'approved' ? 'default' :
          transaction.status === 'pending' ? 'secondary' : 'destructive'
        }>
          {transaction.status}
        </Badge>
      )
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span>{transaction.createdBy}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Transaction',
      icon: Plus,
      onClick: () => window.location.href = '/finance/transactions/new',
      variant: 'primary' as const
    },
    {
      label: 'Export',
      icon: Download,
      onClick: () => console.log('Export transactions'),
      variant: 'outline' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (loading) {
    return <LoadingState message="Loading transactions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track all financial transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${transactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${Math.abs(transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0))
                .toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search transactions..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          {filteredTransactions.length === 0 ? (
            <NoDataState
              title="No transactions found"
              description="No transactions match your current filters."
              actionLabel="Create Transaction"
              onAction={() => window.location.href = '/finance/transactions/new'}
            />
          ) : (
            <DataGrid
              data={filteredTransactions}
              columns={columns}
              searchable={false}
              sortable={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
