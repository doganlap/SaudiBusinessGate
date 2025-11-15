'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportService } from '@/lib/utils/export-utils';
import { 
  Plus, TrendingUp, TrendingDown, AlertTriangle,
  PiggyBank, Target, Calendar, DollarSign, Download
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Budget {
  id: string;
  name: string;
  category: string;
  budgetedAmount?: number;
  actualAmount?: number;
  period: string;
  startDate: string;
  endDate: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
  variance?: number;
  variancePercent?: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/finance/budgets', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      // Fallback data for demo
      setBudgets([
        {
          id: '1',
          name: 'Marketing Budget Q1 2024',
          category: 'Marketing',
          budgetedAmount: 50000,
          actualAmount: 42000,
          period: 'Q1 2024',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          status: 'under-budget',
          variance: -8000,
          variancePercent: -16
        },
        {
          id: '2',
          name: 'Technology Infrastructure',
          category: 'Technology',
          budgetedAmount: 75000,
          actualAmount: 82000,
          period: 'Q1 2024',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          status: 'over-budget',
          variance: 7000,
          variancePercent: 9.3
        },
        {
          id: '3',
          name: 'Office Operations',
          category: 'Operations',
          budgetedAmount: 25000,
          actualAmount: 24500,
          period: 'Q1 2024',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          status: 'on-track',
          variance: -500,
          variancePercent: -2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: 'Budget Name',
      render: (budget: Budget) => (
        <div>
          <div className="font-medium">{budget.name}</div>
          <div className="text-sm text-gray-500">{budget.category}</div>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Period',
      render: (budget: Budget) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{budget.period}</span>
        </div>
      )
    },
    {
      key: 'budgetedAmount',
      header: 'Budgeted',
      render: (budget: Budget) => (
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span>${budget?.budgetedAmount?.toLocaleString() || '0'}</span>
        </div>
      )
    },
    {
      key: 'actualAmount',
      header: 'Actual',
      render: (budget: Budget) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>${budget?.actualAmount?.toLocaleString() || '0'}</span>
        </div>
      )
    },
    {
      key: 'variance',
      header: 'Variance',
      render: (budget: Budget) => (
        <div className={`flex items-center space-x-2 ${
          (budget?.variance || 0) > 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {(budget?.variance || 0) > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>
            {(budget?.variance || 0) > 0 ? '+' : ''}${(budget?.variance || 0).toLocaleString()} 
            ({(budget?.variancePercent || 0) > 0 ? '+' : ''}{(budget?.variancePercent || 0).toFixed(1)}%)
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (budget: Budget) => (
        <Badge variant={
          budget.status === 'on-track' ? 'default' :
          budget.status === 'under-budget' ? 'secondary' : 'destructive'
        }>
          {budget.status === 'on-track' ? 'On Track' :
           budget.status === 'under-budget' ? 'Under Budget' : 'Over Budget'}
        </Badge>
      )
    }
  ];

  const exportBudgets = () => {
    try {
      ExportService.exportBudgets(budgets, {
        format: 'csv',
        filename: `budgets-${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  const toolbarActions = [
    {
      label: 'Export Data',
      icon: Download,
      onClick: exportBudgets,
      variant: 'outline' as const
    },
    {
      label: 'New Budget',
      icon: Plus,
      onClick: () => console.log('Create new budget'),
      variant: 'primary' as const
    }
  ];

  // Calculate summary stats
  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.budgetedAmount || 0), 0);
  const totalActual = budgets.reduce((sum, b) => sum + (b.actualAmount || 0), 0);
  const totalVariance = totalActual - totalBudgeted;
  const overBudgetCount = budgets.filter(b => b.status === 'over-budget').length;

  if (loading) {
    return <LoadingState message="Loading budgets..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-gray-600">
            Plan, track, and manage your financial budgets
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalBudgeted.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Across {budgets.length} budgets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalActual.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Current spending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
            {totalVariance > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalVariance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {totalVariance > 0 ? '+' : ''}${totalVariance.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {totalVariance > 0 ? 'Over budget' : 'Under budget'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overBudgetCount}
            </div>
            <p className="text-xs text-gray-500">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Budget Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search budgets..."
            actions={toolbarActions}
          />
          
          <DataGrid
            data={filteredBudgets}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
