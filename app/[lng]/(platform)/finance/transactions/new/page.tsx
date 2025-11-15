'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TransactionForm {
  date: string;
  description: string;
  amount: string;
  type: 'debit' | 'credit';
  account: string;
  category: string;
  reference: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TransactionForm>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'debit',
    account: '',
    category: '',
    reference: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': 'default-tenant'
        },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) * (form.type === 'debit' ? -1 : 1)
        })
      });

      if (response.ok) {
        router.push('/finance/transactions');
      } else {
        console.error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TransactionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
            <p className="text-gray-600">Create a new financial transaction</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value as 'debit' | 'credit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="debit">Debit (Expense)</option>
                  <option value="credit">Credit (Income)</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  id="description"
                  type="text"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Account */}
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  id="account"
                  value={form.account}
                  onChange={(e) => handleChange('account', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Account</option>
                  <option value="Cash">Cash</option>
                  <option value="Checking Account">Checking Account</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Office Expenses">Office Expenses</option>
                  <option value="Software Expenses">Software Expenses</option>
                  <option value="Accounts Receivable">Accounts Receivable</option>
                  <option value="Accounts Payable">Accounts Payable</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Operating Expenses">Operating Expenses</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Travel">Travel</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                  Reference
                </label>
                <Input
                  id="reference"
                  type="text"
                  value={form.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="Invoice #, PO #, etc."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Creating...' : 'Create Transaction'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
