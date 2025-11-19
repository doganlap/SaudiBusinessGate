import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { HRService } from '@/lib/services/hr.service';

const hrService = new HRService();

/**
 * GET /api/hr/attendance
 * Get attendance records with optional filtering
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
    const { attendance, summary } = await hrService.getAttendance(tenantId, {
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
      attendance,
      summary,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/attendance
 * Create new attendance record
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
      attendance_date,
      check_in_time,
      check_out_time,
      break_duration_minutes,
      status,
      leave_type,
      notes,
    } = body;

    // Validation
    if (!employee_id) {
      return NextResponse.json(
        { success: false, error: 'employee_id is required' },
        { status: 400 }
      );
    }

    // Call service layer (business logic)
    const attendance = await hrService.createAttendance(tenantId, {
      employee_id,
      attendance_date: attendance_date || new Date().toISOString().split('T')[0],
      check_in_time,
      check_out_time,
      break_duration_minutes,
      status,
      leave_type,
      notes,
    });

    // Return HTTP response
    return NextResponse.json(
      {
        success: true,
        attendance,
        message: 'Attendance record created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating attendance:', error);

    // Handle specific error cases
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

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
      {
        success: false,
        error: error.message || 'Failed to create attendance record',
      },
      { status: 500 }
    );
  }
}
