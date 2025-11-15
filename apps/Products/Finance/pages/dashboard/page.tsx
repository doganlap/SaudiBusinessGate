'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, 
  Receipt, FileText, Calculator, BarChart3
} from 'lucide-react';
import { 
  EnterpriseToolbar, 
  KpiCard, 
  KpiGrid, 
  DataGrid,
  NoDataState,
  LoadingState
} from '../components/enterprise';

interface FinancialData {
  id: string;
  type: 'payable' | 'receivable';
  party_name: string;
  reference: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

/**
 * Finance Dashboard - Financial Management & Accounting
 * Comprehensive financial health monitoring and accounting operations
 */
export default function FinanceDashboardPage() {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  // Sample data for demonstration
  const sampleFinancialData: FinancialData[] = [
    {
      id: '1',
      type: 'receivable',
      party_name: 'Acme Corporation',
      reference: 'INV-2024-001',
      amount: 45000,
      due_date: '2024-11-15',
      status: 'pending',
      created_at: '2024-10-15'
    },
    {
      id: '2',
      type: 'payable',
      party_name: 'Tech Suppliers Ltd',
      reference: 'BILL-2024-089',
      amount: 12500,
      due_date: '2024-11-20',
      status: 'pending',
      created_at: '2024-10-20'
    },
    {
      id: '3',
      type: 'receivable',
      party_name: 'Future Systems Inc',
      reference: 'INV-2024-002',
      amount: 78000,
      due_date: '2024-12-01',
      status: 'overdue',
      created_at: '2024-09-01'
    },
    {
      id: '4',
      type: 'payable',
      party_name: 'Office Solutions Co',
      reference: 'BILL-2024-090',
      amount: 3200,
      due_date: '2024-11-10',
      status: 'paid',
      created_at: '2024-10-10'
    }
  ];

  // Data grid columns
  const columns = [
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === 'receivable' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        }`}>
          {value === 'receivable' ? 'A/R' : 'A/P'}
        </span>
      )
    },
    {
      key: 'party_name',
      title: 'Party',
      sortable: true,
      render: (value: string, record: FinancialData) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{record.reference}</div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      align: 'right' as const,
      render: (value: number, record: FinancialData) => (
        <div className={`font-semibold ${
          record.type === 'receivable' ? 'text-success' : 'text-warning'
        }`}>
          {record.type === 'receivable' ? '+' : '-'}${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'due_date',
      title: 'Due Date',
      sortable: true,
      render: (value: string) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <div className={`text-sm ${
            isOverdue ? 'text-danger font-medium' : 'text-muted-foreground'
          }`}>
            {dueDate.toLocaleDateString()}
            {isOverdue && <div className="text-xs text-danger">Overdue</div>}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === 'paid' ? 'bg-success/10 text-success' :
          value === 'overdue' ? 'bg-danger/10 text-danger' :
          'bg-info/10 text-info'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Load financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      setLoading(true);
      try {
        // Fetch transactions data
        const txnResponse = await fetch(`/api/finance/transactions?status=${selectedType !== 'all' ? selectedType : ''}`);
        
        // Fetch accounts data for context
        const accountsResponse = await fetch('/api/finance/accounts');
        
        if (txnResponse.ok && accountsResponse.ok) {
          const txnData = await txnResponse.json();
          const accountsData = await accountsResponse.json();
          
          // Convert transactions to financial data with account names
          const accounts = accountsData.data || [];
          const transactions = txnData.data || [];
          
          const enhancedData = transactions.map((tx: any) => {
            const account = accounts.find((a: any) => a.id === tx.account_id);
            return {
              id: tx.id,
              type: tx.transaction_type === 'receipt' ? 'receivable' : 'payable',
              party_name: account?.account_name || 'Unknown Account',
              reference: tx.reference_id || tx.transaction_number,
              amount: tx.amount,
              due_date: tx.transaction_date,
              status: tx.status,
              created_at: tx.created_at
            };
          });
          
          setFinancialData(enhancedData);
        } else {
          // Use sample data for demonstration
          setFinancialData(sampleFinancialData);
        }
      } catch (error) {
        console.error('Failed to load financial data:', error);
        setFinancialData(sampleFinancialData);
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, [selectedType]);

  // Filter data by type
  const filteredData = selectedType === 'all' 
    ? financialData 
    : financialData.filter(item => item.type === selectedType);

  // Calculate KPIs
  const totalReceivable = financialData
    .filter(item => item.type === 'receivable' && item.status !== 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalPayable = financialData
    .filter(item => item.type === 'payable' && item.status !== 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const netPosition = totalReceivable - totalPayable;
  
  const overdueAmount = financialData
    .filter(item => item.status === 'overdue')
    .reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return <LoadingState message="Loading finance dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Financial health monitoring and accounting operations
          </p>
        </div>

        {/* KPI Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Financial Metrics</h2>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-surface text-foreground"
              aria-label="Filter by transaction type"
            >
              <option value="all">All Transactions</option>
              <option value="receivable">Accounts Receivable</option>
              <option value="payable">Accounts Payable</option>
            </select>
          </div>

          <KpiGrid columns={4}>
            <KpiCard
              icon={TrendingUp}
              label="Accounts Receivable"
              value={`$${totalReceivable.toLocaleString()}`}
              delta="+8.5%"
              trend="up"
              timeframe="outstanding"
            />
            <KpiCard
              icon={TrendingDown}
              label="Accounts Payable"
              value={`$${totalPayable.toLocaleString()}`}
              delta="-3.2%"
              trend="down"
              timeframe="outstanding"
            />
            <KpiCard
              icon={DollarSign}
              label="Net Position"
              value={`$${netPosition.toLocaleString()}`}
              delta={netPosition > 0 ? "+12.3%" : "-5.1%"}
              trend={netPosition > 0 ? "up" : "down"}
              timeframe="current"
            />
            <KpiCard
              icon={CreditCard}
              label="Overdue Amount"
              value={`$${overdueAmount.toLocaleString()}`}
              delta="-15.2%"
              trend="down"
              timeframe="needs attention"
            />
          </KpiGrid>
        </div>

        {/* Financial Transactions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Financial Transactions</h2>
          
          <EnterpriseToolbar
            onSearch={() => {}}
            onNew={() => {}}
            placeholder="Search by party name, reference, or amount..."
          />

          {filteredData.length > 0 ? (
            <DataGrid
              data={filteredData}
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
                total: filteredData.length,
                onChange: () => {}
              }}
            />
          ) : (
            <NoDataState
              onCreate={() => {}}
              onRefresh={() => window.location.reload()}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-lg bg-surface hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Financial Reports</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Generate comprehensive financial reports and statements
            </p>
            <button className="text-primary hover:text-primary-600 text-sm font-medium">
              View Reports →
            </button>
          </div>

          <div className="p-6 border border-border rounded-lg bg-surface hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Calculator className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Budget Management</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Plan and track budgets across departments and projects
            </p>
            <button className="text-primary hover:text-primary-600 text-sm font-medium">
              Manage Budgets →
            </button>
          </div>

          <div className="p-6 border border-border rounded-lg bg-surface hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Financial Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Advanced financial analytics and trend analysis
            </p>
            <button className="text-primary hover:text-primary-600 text-sm font-medium">
              View Analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
