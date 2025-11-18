"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface Bill {
  id: string;
  vendorName: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
}

export function BillsManager() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/finance/bills', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch bills');
      
      const data = await response.json();
      setBills(data.data || data.bills || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
      // Fallback demo data
      setBills([
        {
          id: '1',
          vendorName: 'Office Supplies Co.',
          billNumber: 'BILL-001',
          amount: 1250.00,
          dueDate: '2024-01-15',
          status: 'pending',
          category: 'Office Supplies'
        },
        {
          id: '2',
          vendorName: 'Tech Services Ltd.',
          billNumber: 'BILL-002',
          amount: 3500.00,
          dueDate: '2024-01-10',
          status: 'overdue',
          category: 'Services'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Bill
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBills.map((bill) => (
          <Card key={bill.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{bill.vendorName}</CardTitle>
                  <CardDescription>Bill #{bill.billNumber}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(bill.status)}
                  <span className="text-2xl font-bold text-gray-900">
                    ${bill.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(bill.dueDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {bill.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {bill.status === 'pending' && (
                    <Button size="sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bills found matching your criteria</p>
        </div>
      )}
    </div>
  );
}