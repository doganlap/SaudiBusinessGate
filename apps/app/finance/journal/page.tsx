"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  FileText, 
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  Calculator,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  entry_type: string;
  reference?: string;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLine[];
}

interface JournalEntryLine {
  id: string;
  line_number: number;
  account_id: string;
  account_name?: string;
  account_code?: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

export default function JournalEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
    loadJournalEntries();
    }, []);

  const loadJournalEntries = async () => {
        try {
      setLoading(true);
      setError(null);
      
      const tenantId = 'default-tenant';
      const response = await fetch(`/api/finance/journal-entries?limit=100`, {
        headers: { 
          'tenant-id': tenantId,
          'Content-Type': 'application/json'
        }
      });
      
            if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch journal entries');
            }
      
            const result = await response.json();
      const entriesData = result.data || result.entries || [];
      setEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
      console.error('Error loading journal entries:', err);
        } finally {
            setLoading(false);
        }
    };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-100 text-green-800">مرحل</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">مسودة</Badge>;
      case 'reversed':
        return <Badge className="bg-red-100 text-red-800">معكوس</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredEntries.length;
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.total_debit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.total_credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    if (loading) {
        return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<FinanceLoading />}>
          <FinanceLoading />
        </Suspense>
            </div>
        );
    }

    if (error) {
        return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
            </div>
        );
    }

    return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              قيود اليومية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              نظام القيد المزدوج للمحاسبة
            </p>
          </div>
          <Button onClick={() => router.push('/finance/journal/create')}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء قيد جديد
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي القيود</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
              <Calculator className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalDebit.toLocaleString()} SAR</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
              <Calculator className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCredit.toLocaleString()} SAR</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التوازن</CardTitle>
              {isBalanced ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {isBalanced ? 'متوازن' : 'غير متوازن'}
              </div>
              {!isBalanced && (
                <p className="text-xs text-red-600 mt-1">
                  الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()} SAR
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث في القيود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="تصفية حسب الحالة"
            title="تصفية حسب الحالة"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="posted">مرحل</option>
            <option value="reversed">معكوس</option>
          </select>
          <Button variant="outline" onClick={loadJournalEntries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة قيود اليومية</CardTitle>
          <CardDescription>جميع القيود المحاسبية</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد قيود</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/finance/journal/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                إنشاء قيد جديد
              </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم القيد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المرجع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدين
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدائن
                                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => {
                    const isEntryBalanced = Math.abs(entry.total_debit - entry.total_credit) < 0.01;
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.entry_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.entry_date).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                          {entry.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.reference || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {entry.total_debit.toLocaleString()} SAR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {entry.total_credit.toLocaleString()} SAR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entry.status)}
                            {!isEntryBalanced && (
                              <Badge className="bg-red-100 text-red-800">غير متوازن</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // View entry details
                              console.log('View entry:', entry.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                                        </td>
                                    </tr>
                    );
                  })}
                            </tbody>
                        </table>
                    </div>
                )}
        </CardContent>
      </Card>
        </div>
    );
}

