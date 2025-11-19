import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { HRService } from '@/lib/services/hr.service';

const hrService = new HRService();

/**
 * GET /api/hr/payroll
 * Get payroll records with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const employee_id = searchParams.get('employee_id')
      ? parseInt(searchParams.get('employee_id')!)
      : undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined;

    // Call service layer (business logic)
    const { payroll, summary } = await hrService.getPayroll(tenantId, {
      employee_id,
      start_date,
      end_date,
      status,
      limit,
      offset,
    });

    // Return HTTP response
    return NextResponse.json({
      success: true,
      payroll,
      summary,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/payroll
 * Create new payroll record
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    // Parse and validate request body
    const body = await request.json();

    const {
      employee_id,
      pay_period_start,
      pay_period_end,
      pay_date,
      base_salary,
      overtime_hours,
      overtime_rate,
      allowances,
      bonuses,
      deductions,
      currency,
      payment_method,
    } = body;

    // Validation
    if (!employee_id || !pay_period_start || !pay_period_end || !pay_date || base_salary === undefined) {
      return NextResponse.json(
        {
          success: false,
          error:
            'employee_id, pay_period_start, pay_period_end, pay_date, and base_salary are required',
        },
        { status: 400 }
      );
    }

    // Call service layer (business logic)
    const payroll = await hrService.createPayroll(tenantId, {
      employee_id,
      pay_period_start,
      pay_period_end,
      pay_date,
      base_salary,
      overtime_hours,
      overtime_rate,
      allowances,
      bonuses,
      deductions,
      currency,
      payment_method,
    });

    // Return HTTP response
    return NextResponse.json(
      {
        success: true,
        payroll,
        message: 'Payroll record created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating payroll:', error);

    // Handle specific error cases
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payroll record',
      },
      { status: 500 }
    );
  }
}
