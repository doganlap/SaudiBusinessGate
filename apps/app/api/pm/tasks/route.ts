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
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const status = searchParams.get('status') || undefined;
    const assignee_id = searchParams.get('assignee_id') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;
    const offset = searchParams.get('offset') ? parseInt(search_params.get('offset') as string) : undefined;

    const tasks = await ProjectManagementService.getTasks(parseInt(projectId), { status, assignee_id, limit, offset });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const taskData = await req.json();
    const newTask = await ProjectManagementService.createTask(taskData);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}