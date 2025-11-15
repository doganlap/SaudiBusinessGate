'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Download, FileBarChart, Calendar, Filter, 
  BarChart2, PieChart, TrendingUp, CreditCard
} from 'lucide-react';
import {
  EnterpriseToolbar,
  KpiCard,
  KpiGrid,
  LoadingState
} from '../components/enterprise';

interface ReportData {
  reportType: string;
  period: string;
  data: any;
}

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('summary');
  const [period, setPeriod] = useState('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams({
          type: reportType,
          period
        });
        
        if (fromDate) {
          params.append('fromDate', fromDate);
        }
        
        if (toDate) {
          params.append('toDate', toDate);
        }
        
        const response = await fetch(`/api/finance/reports?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          console.error('Failed to fetch report data');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, period, fromDate, toDate]);

  // Report types with metadata
  const reportTypes = [
    { 
      id: 'summary', 
      name: 'Financial Summary', 
      description: 'Overview of financial health',
      icon: FileText
    },
    { 
      id: 'cash_flow', 
      name: 'Cash Flow', 
      description: 'Income and expense over time',
      icon: TrendingUp
    },
    { 
      id: 'account_balances', 
      name: 'Account Balances', 
      description: 'Current balances across accounts',
      icon: CreditCard
    }
  ];

  const periodOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
  ];

  // Render financial summary
  const renderSummary = (data: any) => {
    if (!data) return null;
    
    return (
      <div className="space-y-8">
        <KpiGrid columns={3}>
          <KpiCard
            icon={TrendingUp}
            label="Total Income"
            value={`$${data.total_income?.toLocaleString() || 0}`}
            delta="+12.5%"
            trend="up"
            timeframe="All time"
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Expenses"
            value={`$${data.total_expense?.toLocaleString() || 0}`}
            delta="-3.2%"
            trend="down"
            timeframe="All time"
          />
          <KpiCard
            icon={FileText}
            label="Transactions"
            value={data.transaction_count?.toString() || '0'}
            delta="+8.1%"
            trend="up"
            timeframe={`${data.pending_count || 0} pending`}
          />
        </KpiGrid>
        
        <div className="p-6 border border-border rounded-lg bg-surface">
          <h3 className="text-lg font-semibold mb-4">Financial Health Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Expense Ratio</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: '32%' }}></div>
                </div>
                <span className="text-sm font-medium">32%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Receivables Due</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '48%' }}></div>
                </div>
                <span className="text-sm font-medium">48%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cash Reserves</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-medium">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render cash flow
  const renderCashFlow = (data: any[]) => {
    if (!data || !data.length) return null;
    
    // Calculate totals
    const totalIncome = data.reduce((sum, item) => sum + (item.income || 0), 0);
    const totalExpense = data.reduce((sum, item) => sum + (item.expense || 0), 0);
    const netCashFlow = totalIncome - totalExpense;
    
    return (
      <div className="space-y-8">
        <KpiGrid columns={3}>
          <KpiCard
            icon={TrendingUp}
            label="Total Inflow"
            value={`$${totalIncome.toLocaleString()}`}
            delta="+5.2%"
            trend="up"
            timeframe={`${data.length} periods`}
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Outflow"
            value={`$${totalExpense.toLocaleString()}`}
            delta="-2.8%"
            trend="down"
            timeframe={`${data.length} periods`}
          />
          <KpiCard
            icon={TrendingUp}
            label="Net Cash Flow"
            value={`$${netCashFlow.toLocaleString()}`}
            delta={netCashFlow > 0 ? "+12.4%" : "-3.5%"}
            trend={netCashFlow > 0 ? "up" : "down"}
            timeframe="Period total"
          />
        </KpiGrid>
        
        <div className="p-6 border border-border rounded-lg bg-surface">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                <th className="py-3 text-right text-sm font-medium text-muted-foreground">Income</th>
                <th className="py-3 text-right text-sm font-medium text-muted-foreground">Expense</th>
                <th className="py-3 text-right text-sm font-medium text-muted-foreground">Net</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const periodDate = new Date(item.period);
                const formattedPeriod = periodDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short',
                  ...(period === 'day' && { day: 'numeric' }),
                  ...(period === 'week' && { day: 'numeric' })
                });
                
                return (
                  <tr key={index} className="border-b border-border">
                    <td className="py-3 text-sm">{formattedPeriod}</td>
                    <td className="py-3 text-right text-sm font-medium text-success">
                      ${item.income?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-warning">
                      ${item.expense?.toLocaleString() || 0}
                    </td>
                    <td className={`py-3 text-right text-sm font-medium ${
                      item.net >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      ${item.net?.toLocaleString() || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted">
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>
    );
  };

  // Render account balances
  const renderAccountBalances = (data: any[]) => {
    if (!data || !data.length) return null;
    
    // Calculate totals by account type
    const accountTypeTotals: Record<string, number> = {};
    data.forEach(account => {
      if (!accountTypeTotals[account.account_type]) {
        accountTypeTotals[account.account_type] = 0;
      }
      accountTypeTotals[account.account_type] += account.balance;
    });
    
    // Calculate total assets and liabilities
    const totalAssets = data
      .filter(account => account.account_type === 'Asset')
      .reduce((sum, account) => sum + account.balance, 0);
      
    const totalLiabilities = data
      .filter(account => account.account_type === 'Liability')
      .reduce((sum, account) => sum + account.balance, 0);
      
    const netWorth = totalAssets - totalLiabilities;
    
    return (
      <div className="space-y-8">
        <KpiGrid columns={3}>
          <KpiCard
            icon={TrendingUp}
            label="Total Assets"
            value={`$${totalAssets.toLocaleString()}`}
            delta="+3.5%"
            trend="up"
            timeframe="Current balances"
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Liabilities"
            value={`$${totalLiabilities.toLocaleString()}`}
            delta="-1.2%"
            trend="down"
            timeframe="Current balances"
          />
          <KpiCard
            icon={TrendingUp}
            label="Net Worth"
            value={`$${netWorth.toLocaleString()}`}
            delta={netWorth > 0 ? "+5.4%" : "-2.3%"}
            trend={netWorth > 0 ? "up" : "down"}
            timeframe="Current balance"
          />
        </KpiGrid>
        
        <div className="p-6 border border-border rounded-lg bg-surface">
          <h3 className="text-lg font-semibold mb-4">Account Balances</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left text-sm font-medium text-muted-foreground">Account</th>
                <th className="py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="py-3 text-right text-sm font-medium text-muted-foreground">Balance</th>
                <th className="py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((account, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3">
                    <div>
                      <div className="font-medium">{account.account_name}</div>
                      <div className="text-xs text-muted-foreground">{account.account_number}</div>
                    </div>
                  </td>
                  <td className="py-3 text-sm">{account.account_type}</td>
                  <td className={`py-3 text-right font-medium ${
                    account.balance >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {account.balance >= 0 ? '+' : ''}{account.balance.toLocaleString()} {account.currency}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted">
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>
    );
  };

  // Render report content based on type
  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'summary':
        return renderSummary(reportData.data);
      case 'cash_flow':
        return renderCashFlow(reportData.data);
      case 'account_balances':
        return renderAccountBalances(reportData.data);
      default:
        return <div>Select a report type</div>;
    }
  };

  if (loading) {
    return <LoadingState message="Generating financial report..." />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and view detailed financial reports
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = reportType === type.id;
            
            return (
              <div
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-surface hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {type.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Controls */}
        <div className="flex flex-col md:flex-row gap-4 p-6 border border-border rounded-lg bg-surface">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Report Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-border rounded-md bg-background"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          
          <div className="flex items-end ml-auto">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div>
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}
