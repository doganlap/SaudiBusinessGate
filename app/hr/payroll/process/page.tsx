/**
 * Process Payroll Page
 * Connected to: POST /api/hr/payroll
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowLeft, Save } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  salary: number;
}

export default function ProcessPayrollPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.lng || 'en';

  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    pay_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    base_salary: '',
    overtime: '0',
    bonuses: '0',
    deductions: '0',
    pay_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();
      
      if (data.success && data.employees) {
        const mappedEmployees = data.employees.map((emp: any) => ({
          id: emp.id || emp.employee_id || '',
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
          employee_id: emp.employee_id || emp.employee_code || emp.id || '',
          salary: emp.salary || emp.monthly_salary || 0,
        }));
        setEmployees(mappedEmployees);
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp.id === employeeId);
    
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      base_salary: employee ? employee.salary.toString() : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate payroll amounts
      const baseSalary = parseFloat(formData.base_salary) || 0;
      const overtime = parseFloat(formData.overtime) || 0;
      const bonuses = parseFloat(formData.bonuses) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      const grossPay = baseSalary + overtime + bonuses;
      const netPay = grossPay - deductions;

      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          pay_period: formData.pay_period,
          base_salary: baseSalary,
          overtime,
          bonuses,
          deductions,
          gross_pay: grossPay,
          net_pay: netPay,
          pay_date: formData.pay_date,
          status: 'processed',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process payroll');
      }

      // Redirect to payroll page
      router.push(`/${locale}/hr/payroll`);
    } catch (err: any) {
      console.error('Error processing payroll:', err);
      setError(err.message || 'Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate totals
  const baseSalary = parseFloat(formData.base_salary) || 0;
  const overtime = parseFloat(formData.overtime) || 0;
  const bonuses = parseFloat(formData.bonuses) || 0;
  const deductions = parseFloat(formData.deductions) || 0;
  const grossPay = baseSalary + overtime + bonuses;
  const netPay = grossPay - deductions;

  if (loadingEmployees) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
            <p className="text-gray-600 mt-1">Process employee payroll and compensation</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payroll Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee *
                  </label>
                  <select
                    id="employee_id"
                    name="employee_id"
                    required
                    value={formData.employee_id}
                    onChange={handleEmployeeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pay_period" className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Period *
                  </label>
                  <input
                    type="month"
                    id="pay_period"
                    name="pay_period"
                    required
                    value={formData.pay_period}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="base_salary" className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary *
                  </label>
                  <input
                    type="number"
                    id="base_salary"
                    name="base_salary"
                    required
                    step="0.01"
                    value={formData.base_salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="overtime" className="block text-sm font-medium text-gray-700 mb-2">
                    Overtime
                  </label>
                  <input
                    type="number"
                    id="overtime"
                    name="overtime"
                    step="0.01"
                    value={formData.overtime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bonuses" className="block text-sm font-medium text-gray-700 mb-2">
                    Bonuses
                  </label>
                  <input
                    type="number"
                    id="bonuses"
                    name="bonuses"
                    step="0.01"
                    value={formData.bonuses}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="deductions" className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    id="deductions"
                    name="deductions"
                    step="0.01"
                    value={formData.deductions}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="pay_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Date *
                  </label>
                  <input
                    type="date"
                    id="pay_date"
                    name="pay_date"
                    required
                    value={formData.pay_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Payroll Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payroll Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Base Salary</p>
                    <p className="text-lg font-bold text-gray-900">${baseSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overtime</p>
                    <p className="text-lg font-bold text-gray-900">${overtime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gross Pay</p>
                    <p className="text-lg font-bold text-blue-600">${grossPay.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Pay</p>
                    <p className="text-lg font-bold text-green-600">${netPay.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Process Payroll
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
