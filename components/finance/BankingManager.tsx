"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Building2, 
  CreditCard, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  availableBalance: number;
  bankName: string;
  status: 'active' | 'inactive';
  lastReconciled: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'cleared' | 'pending' | 'reconciled';
}

export function BankingManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load accounts
      const accountsRes = await fetch('/api/finance/banking/accounts', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!accountsRes.ok) throw new Error('Failed to fetch bank accounts');
      
      const accountsData = await accountsRes.json();
      setAccounts(accountsData.data || accountsData.accounts || []);

      // Load recent transactions
      const transactionsRes = await fetch('/api/finance/banking/transactions?limit=10', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
      
      const transactionsData = await transactionsRes.json();
      setRecentTransactions(transactionsData.data || transactionsData.transactions || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banking data');
      // Fallback demo data
      setAccounts([
        {
          id: '1',
          accountName: 'Main Operating Account',
          accountNumber: '****1234',
          accountType: 'checking',
          balance: 125000.50,
          availableBalance: 124500.00,
          bankName: 'First National Bank',
          status: 'active',
          lastReconciled: '2024-01-10'
        },
        {
          id: '2',
          accountName: 'Business Savings',
          accountNumber: '****5678',
          accountType: 'savings',
          balance: 50000.00,
          availableBalance: 50000.00,
          bankName: 'First National Bank',
          status: 'active',
          lastReconciled: '2024-01-08'
        }
      ]);
      
      setRecentTransactions([
        {
          id: '1',
          date: '2024-01-15',
          description: 'Vendor Payment - Office Supplies',
          amount: -1250.00,
          type: 'debit',
          status: 'cleared'
        },
        {
          id: '2',
          date: '2024-01-14',
          description: 'Customer Payment - Invoice #1234',
          amount: 3500.00,
          type: 'credit',
          status: 'reconciled'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <CreditCard className="h-5 w-5" />;
      case 'savings':
        return <Building2 className="h-5 w-5" />;
      case 'credit':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <Badge className="bg-green-100 text-green-800">Reconciled</Badge>;
      case 'cleared':
        return <Badge className="bg-blue-100 text-blue-800">Cleared</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Banking Overview</CardTitle>
          <CardDescription>Total balance across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                ${totalBalance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600">+2.5% this month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bank Accounts</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.accountName}</CardTitle>
                      <CardDescription>{account.bankName}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(account.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">${account.balance.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Current Balance</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Balance:</span>
                    <span className="font-medium">${account.availableBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Account Number:</span>
                    <span className="font-mono">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Reconciled:</span>
                    <span>{new Date(account.lastReconciled).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Transactions
                    </Button>
                    <Button variant="outline" size="sm">
                      Reconcile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'debit' ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  {getTransactionStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
          
          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}