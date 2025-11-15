'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Phone, MapPin, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  location: string;
  employeeId: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([
        {
          id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', phone: '+1-555-0123',
          position: 'Sales Manager', department: 'Sales', manager: 'John Doe', salary: 85000,
          startDate: '2023-01-15', status: 'active', location: 'New York, NY', employeeId: 'EMP001'
        },
        {
          id: '2', name: 'Mike Chen', email: 'mike.chen@company.com', phone: '+1-555-0456',
          position: 'Software Engineer', department: 'Engineering', manager: 'Jane Smith', salary: 95000,
          startDate: '2022-08-20', status: 'active', location: 'San Francisco, CA', employeeId: 'EMP002'
        },
        {
          id: '3', name: 'Alex Rodriguez', email: 'alex.rodriguez@company.com', phone: '+1-555-0789',
          position: 'Marketing Specialist', department: 'Marketing', manager: 'Lisa Brown', salary: 65000,
          startDate: '2023-06-10', status: 'on-leave', location: 'Austin, TX', employeeId: 'EMP003'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (employee: Employee) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">{employee.name.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-gray-500">{employee.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      header: 'Position',
      render: (employee: Employee) => (
        <div>
          <div className="font-medium">{employee.position}</div>
          <div className="text-sm text-gray-500">{employee.department}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (employee: Employee) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{employee.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (employee: Employee) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span>{employee.manager}</span>
        </div>
      )
    },
    {
      key: 'salary',
      header: 'Salary',
      render: (employee: Employee) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${employee.salary.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee: Employee) => (
        <Badge variant={
          employee.status === 'active' ? 'default' :
          employee.status === 'on-leave' ? 'secondary' : 'outline'
        }>
          {employee.status === 'on-leave' ? 'On Leave' : 
           employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (employee: Employee) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(employee.startDate).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Employee',
      icon: Plus,
      onClick: () => console.log('Create new employee'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' }
  ];

  if (loading) return <LoadingState message="Loading employees..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-gray-600">Manage your workforce and employee information</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-gray-500">Active workforce</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {employees.filter(e => e.status === 'on-leave').length}
            </div>
            <p className="text-xs text-gray-500">Temporary absence</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Company average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search employees..."
            actions={toolbarActions}
            filterValue={filterDepartment}
            onFilterChange={setFilterDepartment}
            filterOptions={filterOptions}
          />
          <DataGrid data={filteredEmployees} columns={columns} searchable={false} sortable={true} />
        </CardContent>
      </Card>
    </div>
  );
}
