import { NextRequest, NextResponse } from 'next/server';

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
  tenantId: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0123',
    position: 'Sales Manager',
    department: 'Sales',
    manager: 'John Doe',
    salary: 85000,
    startDate: '2023-01-15',
    status: 'active',
    location: 'New York, NY',
    employeeId: 'EMP001',
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    phone: '+1-555-0456',
    position: 'Software Engineer',
    department: 'Engineering',
    manager: 'Jane Smith',
    salary: 95000,
    startDate: '2022-08-20',
    status: 'active',
    location: 'San Francisco, CA',
    employeeId: 'EMP002',
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const tenantEmployees = mockEmployees.filter(employee => employee.tenantId === tenantId);
    
    return NextResponse.json({
      success: true,
      employees: tenantEmployees,
      total: tenantEmployees.length,
      summary: {
        totalEmployees: tenantEmployees.length,
        activeEmployees: tenantEmployees.filter(e => e.status === 'active').length,
        onLeave: tenantEmployees.filter(e => e.status === 'on-leave').length,
        avgSalary: Math.round(tenantEmployees.reduce((sum, e) => sum + e.salary, 0) / tenantEmployees.length)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      employeeId: `EMP${String(mockEmployees.length + 1).padStart(3, '0')}`,
      status: 'active'
    };
    
    mockEmployees.push(newEmployee);
    
    return NextResponse.json({
      success: true,
      employee: newEmployee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create employee' }, { status: 500 });
  }
}
