import { NextRequest, NextResponse } from 'next/server';

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

const mockPayroll: PayrollRecord[] = [
  {
    id: '1', employeeId: 'EMP001', employeeName: 'Sarah Johnson', department: 'Sales',
    position: 'Sales Manager', baseSalary: 7083, overtime: 450, bonuses: 1000, deductions: 1200,
    grossPay: 8533, netPay: 7333, payPeriod: 'January 2024', status: 'paid', payDate: '2024-01-31'
  },
  {
    id: '2', employeeId: 'EMP002', employeeName: 'Mike Chen', department: 'Engineering',
    position: 'Software Engineer', baseSalary: 7917, overtime: 600, bonuses: 500, deductions: 1400,
    grossPay: 9017, netPay: 7617, payPeriod: 'January 2024', status: 'paid', payDate: '2024-01-31'
  },
  {
    id: '3', employeeId: 'EMP003', employeeName: 'Alex Rodriguez', department: 'Marketing',
    position: 'Marketing Specialist', baseSalary: 5417, overtime: 200, bonuses: 300, deductions: 950,
    grossPay: 5917, netPay: 4967, payPeriod: 'February 2024', status: 'processed', payDate: '2024-02-29'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    const totalGrossPay = mockPayroll.reduce((sum, record) => sum + record.grossPay, 0);
    const totalNetPay = mockPayroll.reduce((sum, record) => sum + record.netPay, 0);
    const totalDeductions = mockPayroll.reduce((sum, record) => sum + record.deductions, 0);
    
    return NextResponse.json({
      success: true,
      payroll: mockPayroll,
      summary: {
        totalEmployees: mockPayroll.length,
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        paidEmployees: mockPayroll.filter(p => p.status === 'paid').length
      }
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newPayroll: PayrollRecord = {
      id: Date.now().toString(),
      ...body,
      grossPay: body.baseSalary + body.overtime + body.bonuses,
      netPay: body.baseSalary + body.overtime + body.bonuses - body.deductions,
      status: 'draft'
    };
    
    mockPayroll.push(newPayroll);
    
    return NextResponse.json({
      success: true,
      payroll: newPayroll,
      message: 'Payroll record created successfully'
    });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payroll' },
      { status: 500 }
    );
  }
}
