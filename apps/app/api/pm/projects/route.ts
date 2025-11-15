import { NextRequest, NextResponse } from 'next/server';
import { ProjectManagementService } from '@/lib/services/project-management.service';
import { getToken } from 'next-auth/jwt';
import { testConnection } from '@/lib/db/connection';

export async function GET(req: NextRequest) {
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') as string) : undefined;

    const projects = await ProjectManagementService.getProjects(token.tenantId as string, { status, limit, offset });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projectData = await req.json();
    const newProject = await ProjectManagementService.createProject(token.tenantId as string, projectData);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}