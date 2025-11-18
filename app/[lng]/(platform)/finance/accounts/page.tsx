'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Edit, Trash2, Eye, 
  TrendingUp, TrendingDown, DollarSign, Filter
} from 'lucide-react';

interface Account {
  id: string;
  account_name: string;
  account_code: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  is_active: boolean;
  created_at: string;
  description?: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);
  const [form, setForm] = useState({
    account_name: '',
    account_code: '',
    account_type: 'asset',
    balance: '0',
    description: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, [filterType]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finance/accounts?type=${filterType}&active=true`);
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ account_name: '', account_code: '', account_type: 'asset', balance: '0', description: '' });
    setIsAddOpen(true);
  };

  const openEdit = (account: Account) => {
    setSelected(account);
    setForm({
      account_name: account.account_name,
      account_code: account.account_code,
      account_type: account.account_type,
      balance: String(account.balance),
      description: account.description || ''
    });
    setIsEditOpen(true);
  };

  const openDelete = (account: Account) => {
    setSelected(account);
    setIsDeleteOpen(true);
  };

  const submitAdd = async () => {
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_name: form.account_name,
          account_code: form.account_code,
          account_type: form.account_type,
          balance: form.balance,
          description: form.description,
          is_active: true
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAccounts(prev => [json.data, ...prev]);
        setIsAddOpen(false);
      }
    } catch (e) {
      console.error('Create account failed', e);
    }
  };

  const submitEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          account_name: form.account_name,
          account_code: form.account_code,
          account_type: form.account_type,
          balance: parseFloat(form.balance),
          description: form.description
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAccounts(prev => prev.map(a => (a.id === selected.id ? { ...a, ...json.data } : a)));
        setIsEditOpen(false);
        setSelected(null);
      }
    } catch (e) {
      console.error('Update account failed', e);
    }
  };

  const submitDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id })
      });
      if (res.ok) {
        setAccounts(prev => prev.filter(a => a.id !== selected.id));
        setIsDeleteOpen(false);
        setSelected(null);
      }
    } catch (e) {
      console.error('Delete account failed', e);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-green-100 text-green-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-blue-100 text-blue-800';
      case 'revenue': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBalanceColor = (type: string, balance: number) => {
    if (balance === 0) return 'text-gray-600';
    
    switch (type) {
      case 'asset':
      case 'revenue':
        return balance > 0 ? 'text-green-600' : 'text-red-600';
      case 'liability':
      case 'expense':
        return balance > 0 ? 'text-red-600' : 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate summary by account type
  const summary = {
    assets: accounts.filter(a => a.account_type === 'asset').reduce((sum, a) => sum + a.balance, 0),
    liabilities: accounts.filter(a => a.account_type === 'liability').reduce((sum, a) => sum + a.balance, 0),
    equity: accounts.filter(a => a.account_type === 'equity').reduce((sum, a) => sum + a.balance, 0),
    revenue: accounts.filter(a => a.account_type === 'revenue').reduce((sum, a) => sum + a.balance, 0),
    expenses: accounts.filter(a => a.account_type === 'expense').reduce((sum, a) => sum + a.balance, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart of accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your financial account structure and balances
                </p>
              </div>
              <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </button>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Assets</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.assets)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Liabilities</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.liabilities)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Equity</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.equity)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.revenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.expenses)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter accounts by type"
              >
                <option value="all">All Types</option>
                <option value="asset">Assets</option>
                <option value="liability">Liabilities</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
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
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.account_code} - {account.account_name}
                        </div>
                        {account.description && (
                          <div className="text-sm text-gray-500">{account.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.account_type)}`}>
                        {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getBalanceColor(account.account_type, account.balance)}`}>
                        {formatCurrency(account.balance)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-700" title="View account">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(account)} className="p-1 text-gray-600 hover:text-gray-700" title="Edit account">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => openDelete(account)} className="p-1 text-red-600 hover:text-red-700" title="Delete account">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first account'
                }
              </p>
            </div>
          )}
        </div>
        {/* Donut Chart Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Distribution</h2>
            <div className="flex items-center gap-6">
              <svg width="160" height="160" viewBox="0 0 36 36" className="text-gray-200">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
                {Object.entries({
                  asset: summary.assets,
                  liability: summary.liabilities,
                  equity: summary.equity,
                  revenue: summary.revenue,
                  expense: summary.expenses
                }).reduce((acc: any[], [key, val], idx, arr) => {
                  const total = summary.assets + summary.liabilities + summary.equity + summary.revenue + summary.expenses;
                  const frac = total > 0 ? val / total : 0;
                  const prev = acc[idx - 1]?.end || 0;
                  const end = prev + frac * 100;
                  const colors: Record<string, string> = {
                    asset: '#16a34a', liability: '#dc2626', equity: '#2563eb', revenue: '#7c3aed', expense: '#ea580c'
                  };
                  acc.push({ start: prev, end, color: colors[key] });
                  return acc;
                }, []).map((seg, i) => (
                  <circle key={i} cx="18" cy="18" r="16" fill="none" stroke={seg.color} strokeWidth="4"
                    strokeDasharray={`${seg.end - seg.start} ${100 - (seg.end - seg.start)}`}
                    strokeDashoffset={25 - seg.start} />
                ))}
              </svg>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-green-600" /> Assets {formatCurrency(summary.assets)}</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-red-600" /> Liabilities {formatCurrency(summary.liabilities)}</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-blue-600" /> Equity {formatCurrency(summary.equity)}</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-purple-600" /> Revenue {formatCurrency(summary.revenue)}</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-orange-600" /> Expenses {formatCurrency(summary.expenses)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button onClick={openAdd} className="px-3 py-2 border rounded-lg hover:bg-gray-50">Add Account</button>
              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">Export CSV</button>
              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">View Reports</button>
            </div>
          </div>
        </div>
        {/* Modals */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow w-full max-w-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Add Account</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-500">✕</button>
              </div>
              <div className="p-4 space-y-3">
                <input className="w-full border rounded p-2" placeholder="Account Name" value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} />
                <input className="w-full border rounded p-2" placeholder="Account Code" value={form.account_code} onChange={e => setForm({ ...form, account_code: e.target.value })} />
                <select className="w-full border rounded p-2" value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })}>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
                <input className="w-full border rounded p-2" placeholder="Balance" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
                <textarea className="w-full border rounded p-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button onClick={() => setIsAddOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button onClick={submitAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        )}
        {isEditOpen && selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow w-full max-w-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Edit Account</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-500">✕</button>
              </div>
              <div className="p-4 space-y-3">
                <input className="w-full border rounded p-2" placeholder="Account Name" value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} />
                <input className="w-full border rounded p-2" placeholder="Account Code" value={form.account_code} onChange={e => setForm({ ...form, account_code: e.target.value })} />
                <select className="w-full border rounded p-2" value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })}>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
                <input className="w-full border rounded p-2" placeholder="Balance" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
                <textarea className="w-full border rounded p-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button onClick={() => setIsEditOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button onClick={submitEdit} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        )}
        {isDeleteOpen && selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow w-full max-w-md">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Delete Account</h3>
              </div>
              <div className="p-4">
                Are you sure you want to delete <span className="font-semibold">{selected.account_name}</span>?
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button onClick={() => setIsDeleteOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button onClick={submitDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
