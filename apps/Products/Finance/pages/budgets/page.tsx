'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator, PieChart, BarChart2, Calendar, Plus,
  FileText, DollarSign, TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import {
  EnterpriseToolbar,
  KpiCard,
  KpiGrid,
  DataGrid,
  NoDataState,
  LoadingState
} from '../components/enterprise';

interface Budget {
  id: string;
  name: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'draft';
  progress: number;
}

/**
 * Budget Management - Financial Planning & Control
 * Plan and track organizational spending across departments and projects
 */
export default function BudgetManagementPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample data for demonstration
  const sampleBudgets: Budget[] = [
    {
      id: '1',
      name: 'Q4 Operations Budget',
      category: 'Operations',
      planned_amount: 50000,
      actual_amount: 42500,
      start_date: '2025-10-01',
      end_date: '2025-12-31',
      status: 'active',
      progress: 85
    },
    {
      id: '2',
      name: 'Annual Marketing Plan',
      category: 'Marketing',
      planned_amount: 120000,
      actual_amount: 98000,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'active',
      progress: 82
    },
    {
      id: '3',
      name: 'IT Infrastructure Upgrade',
      category: 'IT',
      planned_amount: 75000,
      actual_amount: 78200,
      start_date: '2025-07-01',
      end_date: '2025-09-30',
      status: 'completed',
      progress: 100
    },
    {
      id: '4',
      name: '2026 R&D Budget',
      category: 'R&D',
      planned_amount: 200000,
      actual_amount: 0,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'draft',
      progress: 0
    }
  ];

  // Data grid columns
  const columns = [
    {
      key: 'name',
      title: 'Budget Name',
      sortable: true,
      render: (value: string, record: Budget) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{record.category}</div>
        </div>
      )
    },
    {
      key: 'planned_amount',
      title: 'Planned',
      align: 'right' as const,
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-foreground">${value.toLocaleString()}</div>
      )
    },
    {
      key: 'actual_amount',
      title: 'Actual',
      align: 'right' as const,
      sortable: true,
      render: (value: number, record: Budget) => (
        <div className={`font-medium ${
          record.actual_amount > record.planned_amount ? 'text-danger' : 'text-success'
        }`}>
          ${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'progress',
      title: 'Progress',
      sortable: true,
      render: (value: number) => (
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                value >= 100 ? 'bg-success' :
                value >= 75 ? 'bg-info' :
                value >= 50 ? 'bg-warning' : 'bg-danger'
              }`} 
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium">{value}%</span>
        </div>
      )
    },
    {
      key: 'dates',
      title: 'Period',
      sortable: true,
      render: (_: any, record: Budget) => {
        const startDate = new Date(record.start_date).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        const endDate = new Date(record.end_date).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        
        return (
          <div className="text-sm text-muted-foreground">
            {startDate} <ArrowRight className="inline h-3 w-3" /> {endDate}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === 'active' ? 'bg-success/10 text-success' :
          value === 'completed' ? 'bg-info/10 text-info' :
          'bg-muted/50 text-muted-foreground'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  // Load budget data
  useEffect(() => {
    const loadBudgets = async () => {
      setLoading(true);
      try {
        // Try to fetch from API, fallback to sample data
        const response = await fetch('/api/finance/budgets');
        if (response.ok) {
          const data = await response.json();
          setBudgets(data.data || []);
        } else {
          // Use sample data for demonstration
          setBudgets(sampleBudgets);
        }
      } catch (error) {
        console.error('Failed to load budget data:', error);
        setBudgets(sampleBudgets);
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, []);

  // Filter budgets by status
  const filteredBudgets = selectedStatus === 'all' 
    ? budgets 
    : budgets.filter(budget => budget.status === selectedStatus);

  // Calculate KPIs
  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.planned_amount, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.actual_amount, 0);
  const totalVariance = totalPlanned - totalActual;
  const variancePercentage = totalPlanned > 0 
    ? (totalVariance / totalPlanned) * 100 
    : 0;

  // Budget statistics by category
  const categoryTotals: Record<string, { planned: number; actual: number }> = {};
  budgets.forEach(budget => {
    if (!categoryTotals[budget.category]) {
      categoryTotals[budget.category] = { planned: 0, actual: 0 };
    }
    categoryTotals[budget.category].planned += budget.planned_amount;
    categoryTotals[budget.category].actual += budget.actual_amount;
  });

  if (loading) {
    return <LoadingState message="Loading budget data..." />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Budget Management
          </h1>
          <p className="text-muted-foreground">
            Plan and track organizational spending across departments and projects
          </p>
        </div>

        {/* Budget Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Budget Overview</h2>

          <KpiGrid columns={4}>
            <KpiCard
              icon={Calculator}
              label="Total Planned Budget"
              value={`$${totalPlanned.toLocaleString()}`}
              timeframe={`${budgets.length} active budgets`}
            />
            <KpiCard
              icon={DollarSign}
              label="Total Actual Spend"
              value={`$${totalActual.toLocaleString()}`}
              timeframe="Year to date"
            />
            <KpiCard
              icon={totalVariance >= 0 ? TrendingDown : TrendingUp}
              label="Budget Variance"
              value={`$${Math.abs(totalVariance).toLocaleString()}`}
              delta={`${Math.abs(variancePercentage).toFixed(1)}%`}
              trend={totalVariance >= 0 ? 'up' : 'down'}
              timeframe={totalVariance >= 0 ? 'Under budget' : 'Over budget'}
            />
            <KpiCard
              icon={PieChart}
              label="Completion Rate"
              value={`${Math.round(
                budgets.reduce((sum, budget) => sum + budget.progress, 0) / 
                (budgets.length || 1)
              )}%`}
              timeframe="Average across budgets"
            />
          </KpiGrid>
        </div>

        {/* Budget Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-lg bg-surface">
            <h3 className="text-lg font-semibold mb-4">Budget by Category</h3>
            <div className="space-y-4">
              {Object.entries(categoryTotals).map(([category, totals], index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm">
                      ${totals.actual.toLocaleString()} / ${totals.planned.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        totals.actual > totals.planned ? 'bg-danger' : 'bg-success'
                      }`} 
                      style={{ width: `${Math.min((totals.actual / totals.planned) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border border-border rounded-lg bg-surface">
            <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <div className="text-xl font-bold text-success">
                  {budgets.filter(b => b.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <div className="text-xl font-bold text-info">
                  {budgets.filter(b => b.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <div className="text-xl font-bold text-muted-foreground">
                  {budgets.filter(b => b.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Budget Health</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success" 
                    style={{ 
                      width: `${budgets.filter(b => b.actual_amount <= b.planned_amount).length / 
                        (budgets.length || 1) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(budgets.filter(b => b.actual_amount <= b.planned_amount).length / 
                    (budgets.length || 1) * 100)}% on track
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Budget List</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-surface text-foreground"
              aria-label="Filter budgets by status"
            >
              <option value="all">All Budgets</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <EnterpriseToolbar
            onSearch={() => {}}
            onNew={() => {}}
            placeholder="Search budgets..."
          />

          {filteredBudgets.length > 0 ? (
            <DataGrid
              data={filteredBudgets}
              columns={columns}
              selectable
              onSelectionChange={() => {}}
              onSort={() => {}}
              onRowClick={() => {}}
              actions={{
                view: () => {},
                edit: () => {},
                delete: () => {}
              }}
              pagination={{
                current: 1,
                pageSize: 10,
                total: filteredBudgets.length,
                onChange: () => {}
              }}
            />
          ) : (
            <NoDataState
              message="No budgets found matching your criteria"
              onCreate={() => {}}
              onRefresh={() => window.location.reload()}
            />
          )}
        </div>

        {/* Create Budget CTA */}
        <div className="p-6 border border-border rounded-lg bg-surface/50 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Create New Budget Plan</h3>
            <p className="text-muted-foreground">Set up a new budget to track departmental or project spending</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>
    </div>
  );
}
