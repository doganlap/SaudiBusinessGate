import { NextRequest, NextResponse } from 'next/server';

interface ActivityRecord {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  contact: string;
  company: string;
  assignedTo: string;
  status: 'completed' | 'pending' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  duration?: number;
  tenantId: string;
}

const mockActivities: ActivityRecord[] = [
  {
    id: '1',
    type: 'call',
    title: 'Follow-up Call',
    description: 'Discuss contract terms',
    contact: 'John Smith',
    company: 'TechCorp',
    assignedTo: 'Sarah Johnson',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-14',
    duration: 30,
    tenantId: 'default-tenant'
  },
  {
    id: '2',
    type: 'email',
    title: 'Proposal Sent',
    description: 'Sent pricing proposal',
    contact: 'Emily Davis',
    company: 'Startup Inc',
    assignedTo: 'Mike Chen',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-01-14',
    createdAt: '2024-01-14',
    tenantId: 'default-tenant'
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const tenantActivities = mockActivities.filter(activity => activity.tenantId === tenantId);
    
    return NextResponse.json({
      success: true,
      activities: tenantActivities,
      total: tenantActivities.length,
      summary: {
        totalActivities: tenantActivities.length,
        completed: tenantActivities.filter(a => a.status === 'completed').length,
        scheduled: tenantActivities.filter(a => a.status === 'scheduled').length,
        highPriority: tenantActivities.filter(a => a.priority === 'high').length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newActivity: ActivityRecord = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    mockActivities.push(newActivity);
    
    return NextResponse.json({
      success: true,
      activity: newActivity,
      message: 'Activity created successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create activity' }, { status: 500 });
  }
}
