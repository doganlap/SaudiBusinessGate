import { NextRequest, NextResponse } from 'next/server';
import { ProjectManagementService } from '@/lib/services/project-management.service';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const user_id = searchParams.get('user_id') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') as string) : undefined;

    const timesheets = await ProjectManagementService.getTimesheets(parseInt(taskId), { user_id, limit, offset });
    return NextResponse.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timesheetData = await req.json();
    const newTimesheet = await ProjectManagementService.createTimesheet(timesheetData);
    return NextResponse.json(newTimesheet, { status: 201 });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return NextResponse.json({ error: 'Failed to create timesheet' }, { status: 500 });
  }
}