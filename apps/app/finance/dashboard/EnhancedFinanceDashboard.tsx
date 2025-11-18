"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Banknote,
  Wallet
} from "lucide-react";

interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashFlow: number;
  grossMargin: number;
  operatingMargin: number;
  monthlyRevenue: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  accountBalances: Array<{ account: string; balance: number; type: string }>;
  topCustomers: Array<{ name: string; revenue: number; }>;
  recentTransactions: Array<{ id: string; description: string; amount: number; date: string; type: string; }>;
}

interface Account {
  id: string;
  account_name: string;
  account_code: string;
  account_type: string;
  balance: number;
  is_active: boolean;
}

interface Transaction {
  id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  description: string;
  status: string;
  reference_id?: string;
}

export default function EnhancedFinanceDashboard() {
  const [tenant, setTenant] = useState("default");
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load all finance data
  const loadFinanceData = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load stats
      const statsRes = await fetch("/api/finance/stats", {
        headers: { "x-tenant-id": t }
      });
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();
      setStats(statsData.data);

      // Load accounts
      const accountsRes = await fetch("/api/finance/accounts", {
        headers: { "x-tenant-id": t }
      });
      if (!accountsRes.ok) throw new Error("Failed to fetch accounts");
      const accountsData = await accountsRes.json();
      setAccounts(accountsData.data || accountsData.accounts || []);

      // Load transactions
      const transactionsRes = await fetch("/api/finance/transactions", {
        headers: { "x-tenant-id": t }
      });
      if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData.data || transactionsData.transactions || []);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData(tenant);
  }, [tenant, dateRange]);

  // CRUD Operations
  const createAccount = async (accountData: Partial<Account>) => {
    try {
      const response = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenant 
        },
        body: JSON.stringify(accountData)
      });
      if (!response.ok) throw new Error('Failed to create account');
      await loadFinanceData(tenant); // Refresh data
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    }
  };

  const updateAccount = async (accountId: string, accountData: Partial<Account>) => {
    try {
      const response = await fetch(`/api/finance/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenant 
        },
        body: JSON.stringify(accountData)
      });
      if (!response.ok) throw new Error('Failed to update account');
      await loadFinanceData(tenant); // Refresh data
      setEditingAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const response = await fetch(`/api/finance/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenant }
      });
      if (!response.ok) throw new Error('Failed to delete account');
      await loadFinanceData(tenant); // Refresh data
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenant 
        },
        body: JSON.stringify(transactionData)
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      await loadFinanceData(tenant); // Refresh data
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const updateTransaction = async (transactionId: string, transactionData: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/finance/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenant 
        },
        body: JSON.stringify(transactionData)
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      await loadFinanceData(tenant); // Refresh data
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`/api/finance/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenant }
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      await loadFinanceData(tenant); // Refresh data
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  // Filter and search functionality
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => 
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading finance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">Error loading finance data: {error}</p>
        </div>
        <button 
          onClick={() => loadFinanceData(tenant)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-500">No finance data available</div>;
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial overview and management</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts, transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </button>
              <button
                onClick={() => loadFinanceData(tenant)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalExpenses?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.netProfit?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`p-3 ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
                <Wallet className={`h-6 w-6 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                <p className={`text-2xl font-bold ${stats.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.cashFlow?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'accounts', label: 'Accounts' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'reports', label: 'Reports' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Monthly Revenue Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Expenses</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={stats.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Line dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account Balances */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.accountBalances || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ account, balance }) => `${account}: $${balance.toLocaleString()}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="balance"
                        >
                          {(stats.accountBalances || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Customers */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
                    <div className="space-y-3">
                      {(stats.topCustomers || []).slice(0, 5).map((customer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{customer.name}</span>
                          <span className="font-semibold text-gray-900">
                            ${customer.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Chart of Accounts</h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAccounts.map((account) => (
                        <tr key={account.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {account.account_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {account.account_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {account.account_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${account.balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              account.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingAccount(account)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteAccount(account.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.reference_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.transaction_type.includes('credit') 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.transaction_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingTransaction(transaction)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Income Statement', description: 'Profit & Loss summary', icon: FileText },
                    { name: 'Balance Sheet', description: 'Assets, liabilities & equity', icon: Banknote },
                    { name: 'Cash Flow Statement', description: 'Cash inflows & outflows', icon: CreditCard }
                  ].map((report) => (
                    <div key={report.name} className="bg-gray-50 rounded-lg p-6 text-center">
                      <report.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h4>
                      <p className="text-gray-600 mb-4">{report.description}</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Generate Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}