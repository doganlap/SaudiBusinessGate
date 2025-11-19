import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { HRService } from '@/lib/services/hr.service';

const hrService = new HRService();

/**
 * GET /api/hr/employees
 * Get all employees with optional filtering
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
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const employment_type = searchParams.get('employment_type');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined;

    // Call service layer (business logic)
    const { employees, summary } = await hrService.getEmployees(tenantId, {
      status: status || undefined,
      department: department || undefined,
      employment_type: employment_type as any,
      limit,
      offset,
    });

    // Return HTTP response
    return NextResponse.json({
      success: true,
      employees,
      total: employees.length,
      summary,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees
 * Create new employee
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
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      job_title,
      employment_type,
      hire_date,
      salary,
      work_location,
      currency,
    } = body;

    // Validation
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'first_name, last_name, and email are required',
        },
        { status: 400 }
      );
    }

    // Call service layer (business logic)
    const employee = await hrService.createEmployee(tenantId, {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      job_title,
      employment_type,
      hire_date,
      salary,
      work_location,
      currency,
    });

    // Return HTTP response
    return NextResponse.json(
      {
        success: true,
        employee,
        message: 'Employee created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating employee:', error);

    // Handle specific error cases
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}
