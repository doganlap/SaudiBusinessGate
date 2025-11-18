import { NextRequest, NextResponse } from 'next/server';

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'approval' | 'notification';
  label: string;
  labelAr: string;
  position: { x: number; y: number };
  data: {
    assignedTo?: string;
    condition?: string;
    action?: string;
    timeout?: number;
    retryAttempts?: number;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'finance' | 'compliance' | 'hr' | 'general';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock Workflow Templates
const mockWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-template-1',
    name: 'Invoice Approval Workflow',
    nameAr: 'سير عمل الموافقة على الفواتير',
    description: 'Automated invoice approval process with multi-level authorization',
    descriptionAr: 'عملية الموافقة التلقائية على الفواتير مع التفويض متعدد المستويات',
    category: 'finance',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        label: 'Invoice Received',
        labelAr: 'استلام الفاتورة',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'task-1',
        type: 'task',
        label: 'Validate Invoice',
        labelAr: 'التحقق من الفاتورة',
        position: { x: 300, y: 100 },
        data: {
          assignedTo: 'finance-team',
          timeout: 24 * 60 * 60 * 1000, // 24 hours
          retryAttempts: 2
        }
      },
      {
        id: 'decision-1',
        type: 'decision',
        label: 'Amount > 10,000?',
        labelAr: 'المبلغ > 10,000؟',
        position: { x: 500, y: 100 },
        data: {
          condition: 'amount > 10000'
        }
      },
      {
        id: 'approval-1',
        type: 'approval',
        label: 'Manager Approval',
        labelAr: 'موافقة المدير',
        position: { x: 700, y: 50 },
        data: {
          assignedTo: 'manager',
          timeout: 48 * 60 * 60 * 1000 // 48 hours
        }
      },
      {
        id: 'task-2',
        type: 'task',
        label: 'Process Payment',
        labelAr: 'معالجة الدفع',
        position: { x: 700, y: 150 },
        data: {
          assignedTo: 'finance-team',
          action: 'process_payment'
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        label: 'Send Confirmation',
        labelAr: 'إرسال التأكيد',
        position: { x: 900, y: 100 },
        data: {
          action: 'send_notification'
        }
      },
      {
        id: 'end-1',
        type: 'end',
        label: 'Process Complete',
        labelAr: 'اكتمال العملية',
        position: { x: 1100, y: 100 },
        data: {}
      }
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'decision-1' },
      { id: 'e3', source: 'decision-1', target: 'approval-1', condition: 'yes' },
      { id: 'e4', source: 'decision-1', target: 'task-2', condition: 'no' },
      { id: 'e5', source: 'approval-1', target: 'task-2' },
      { id: 'e6', source: 'task-2', target: 'notification-1' },
      { id: 'e7', source: 'notification-1', target: 'end-1' }
    ],
    isActive: true,
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wf-template-2',
    name: 'Employee Onboarding',
    nameAr: 'إدخال الموظف الجديد',
    description: 'Complete employee onboarding process with document collection and training',
    descriptionAr: 'عملية إدخال الموظف الجديد الكاملة مع جمع الوثائق والتدريب',
    category: 'hr',
    nodes: [
      {
        id: 'start-2',
        type: 'start',
        label: 'New Employee',
        labelAr: 'موظف جديد',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'task-3',
        type: 'task',
        label: 'Collect Documents',
        labelAr: 'جمع الوثائق',
        position: { x: 300, y: 100 },
        data: {
          assignedTo: 'hr-team',
          timeout: 72 * 60 * 60 * 1000 // 72 hours
        }
      },
      {
        id: 'task-4',
        type: 'task',
        label: 'Setup Accounts',
        labelAr: 'إعداد الحسابات',
        position: { x: 500, y: 100 },
        data: {
          assignedTo: 'it-team',
          action: 'setup_accounts'
        }
      },
      {
        id: 'task-5',
        type: 'task',
        label: 'Schedule Training',
        labelAr: 'جدولة التدريب',
        position: { x: 700, y: 100 },
        data: {
          assignedTo: 'training-team'
        }
      },
      {
        id: 'end-2',
        type: 'end',
        label: 'Onboarding Complete',
        labelAr: 'اكتمال الإدخال',
        position: { x: 900, y: 100 },
        data: {}
      }
    ],
    edges: [
      { id: 'e8', source: 'start-2', target: 'task-3' },
      { id: 'e9', source: 'task-3', target: 'task-4' },
      { id: 'e10', source: 'task-4', target: 'task-5' },
      { id: 'e11', source: 'task-5', target: 'end-2' }
    ],
    isActive: true,
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const category = searchParams.get('category');
    const templateId = searchParams.get('templateId');

    let filteredTemplates = mockWorkflowTemplates.filter(template => template.tenantId === tenantId);

    // Get specific template
    if (templateId) {
      const template = filteredTemplates.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: template
      });
    }

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    // Calculate statistics
    const stats = {
      total: filteredTemplates.length,
      active: filteredTemplates.filter(t => t.isActive).length,
      categories: {
        finance: filteredTemplates.filter(t => t.category === 'finance').length,
        compliance: filteredTemplates.filter(t => t.category === 'compliance').length,
        hr: filteredTemplates.filter(t => t.category === 'hr').length,
        general: filteredTemplates.filter(t => t.category === 'general').length
      }
    };

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    const newTemplate: WorkflowTemplate = {
      id: `wf-template-${Date.now()}`,
      name: body.name,
      nameAr: body.nameAr || body.name,
      description: body.description,
      descriptionAr: body.descriptionAr || body.description,
      category: body.category,
      nodes: body.nodes || [],
      edges: body.edges || [],
      isActive: body.isActive !== false,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockWorkflowTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = mockWorkflowTemplates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update the template
    mockWorkflowTemplates[templateIndex] = {
      ...mockWorkflowTemplates[templateIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockWorkflowTemplates[templateIndex]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = mockWorkflowTemplates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    mockWorkflowTemplates.splice(templateIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
