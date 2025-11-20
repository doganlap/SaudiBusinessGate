'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Calendar, Users, Calculator, 
  FileText, Download, Plus, Clock
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  payPeriod: string;
  status: 'draft' | 'processed' | 'paid';
  payDate: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.lng || 'en';
  
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPayrollRecords();
  }, []);

  const fetchPayrollRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/payroll', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.payroll) {
        // Map API response to component state
        const mappedRecords = data.payroll.map((record: any) => ({
          id: record.id || record.payroll_id || '',
          employeeId: record.employee_id || record.employee_code || '',
          employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown',
          department: record.department || '',
          position: record.position || record.job_title || '',
          baseSalary: record.base_salary || record.monthly_salary || record.salary || 0,
          overtime: record.overtime || record.overtime_pay || 0,
          bonuses: record.bonuses || record.bonus || 0,
          deductions: record.deductions || record.total_deductions || 0,
          grossPay: record.gross_pay || record.total_gross || (record.base_salary || 0) + (record.overtime || 0) + (record.bonuses || 0),
          netPay: record.net_pay || record.total_net || ((record.gross_pay || 0) - (record.deductions || 0)),
          payPeriod: record.pay_period || record.period || '',
          status: record.status || 'draft',
          payDate: record.pay_date || record.payment_date || new Date().toISOString().split('T')[0],
        }));
        setPayrollRecords(mappedRecords);
      } else {
        throw new Error(data.error || 'Failed to fetch payroll records');
      }
    } catch (error: any) {
      console.error('Error fetching payroll records:', error);
      // Keep empty array on error instead of mock data
      setPayrollRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (record: PayrollRecord) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{record.employeeName}</div>
            <div className="text-sm text-gray-500">{record.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      header: 'Position',
      render: (record: PayrollRecord) => (
        <div>
          <div className="font-medium">{record.position}</div>
          <div className="text-sm text-gray-500">{record.department}</div>
        </div>
      )
    },
    {
      key: 'baseSalary',
      header: 'Base Salary',
      render: (record: PayrollRecord) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${record.baseSalary.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'overtime',
      header: 'Overtime',
      render: (record: PayrollRecord) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <span>${record.overtime.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'grossPay',
      header: 'Gross Pay',
      render: (record: PayrollRecord) => (
        <span className="font-medium">${record.grossPay.toLocaleString()}</span>
      )
    },
    {
      key: 'netPay',
      header: 'Net Pay',
      render: (record: PayrollRecord) => (
        <span className="font-bold text-green-600">${record.netPay.toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: PayrollRecord) => (
        <Badge variant={
          record.status === 'paid' ? 'default' :
          record.status === 'processed' ? 'secondary' : 'outline'
        }>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'payDate',
      header: 'Pay Date',
      render: (record: PayrollRecord) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(record.payDate).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'Process Payroll',
      icon: Calculator,
      onClick: () => router.push('/hr/payroll/process'),
      variant: 'primary' as const
    },
    {
      label: 'Export Report',
      icon: Download,
      onClick: async () => {
        try {
          const response = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              module: 'hr',
              data: payrollRecords,
              format: 'excel',
              fields: ['employeeName', 'department', 'grossPay', 'netPay', 'payPeriod', 'status'],
            }),
          });
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payroll-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
        } catch (err) {
          console.error('Export failed:', err);
        }
      },
      variant: 'outline' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'processed', label: 'Processed' },
    { value: 'paid', label: 'Paid' }
  ];

  // Calculate summary stats
  const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.grossPay, 0);
  const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);
  const paidRecords = payrollRecords.filter(record => record.status === 'paid').length;

  if (loading) return <LoadingState message="Loading payroll records..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-gray-600">Process and manage employee payroll and compensation</p>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalGrossPay.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalNetPay.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">After deductions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalDeductions.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Taxes & benefits</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{paidRecords}</div>
            <p className="text-xs text-gray-500">
              {Math.round((paidRecords / payrollRecords.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search employees..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredRecords}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
