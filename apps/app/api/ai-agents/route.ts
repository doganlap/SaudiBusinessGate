import { NextRequest, NextResponse } from 'next/server';

interface AIAgent {
  id: string;
  name: string;
  nameAr: string;
  type: 'finance_analyzer' | 'compliance_monitor' | 'fraud_detector' | 'workflow_automator' | 'report_generator';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  description: string;
  descriptionAr: string;
  capabilities: string[];
  model: string;
  provider: string;
  lastActive: string;
  tasksCompleted: number;
  tasksInProgress: number;
  successRate: number;
  averageResponseTime: number;
  configuration: {
    maxConcurrentTasks: number;
    timeout: number;
    retryAttempts: number;
    priority: 'low' | 'medium' | 'high';
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
    uptime: number;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock AI Agents
const mockAIAgents: AIAgent[] = [
  {
    id: 'agent-1',
    name: 'Finance Analyzer Pro',
    nameAr: 'محلل مالي محترف',
    type: 'finance_analyzer',
    status: 'active',
    description: 'Advanced AI agent for financial analysis, transaction monitoring, and budget optimization',
    descriptionAr: 'وكيل ذكي متقدم للتحليل المالي ومراقبة المعاملات وتحسين الميزانية',
    capabilities: [
      'Transaction Analysis',
      'Budget Forecasting',
      'Risk Assessment',
      'Anomaly Detection',
      'Financial Reporting'
    ],
    model: 'gpt-4',
    provider: 'OpenAI',
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    tasksCompleted: 1247,
    tasksInProgress: 3,
    successRate: 98.5,
    averageResponseTime: 2.3,
    configuration: {
      maxConcurrentTasks: 10,
      timeout: 30000,
      retryAttempts: 3,
      priority: 'high'
    },
    metrics: {
      totalRequests: 1265,
      successfulRequests: 1247,
      failedRequests: 18,
      averageProcessingTime: 2.3,
      uptime: 99.2
    },
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agent-2',
    name: 'Compliance Monitor',
    nameAr: 'مراقب الامتثال',
    type: 'compliance_monitor',
    status: 'active',
    description: 'Automated compliance monitoring and regulatory requirement tracking',
    descriptionAr: 'مراقبة الامتثال التلقائي وتتبع المتطلبات التنظيمية',
    capabilities: [
      'Regulatory Compliance',
      'Policy Monitoring',
      'Audit Trail Analysis',
      'Risk Scoring',
      'Alert Generation'
    ],
    model: 'claude-3-sonnet',
    provider: 'Anthropic',
    lastActive: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    tasksCompleted: 892,
    tasksInProgress: 1,
    successRate: 99.1,
    averageResponseTime: 1.8,
    configuration: {
      maxConcurrentTasks: 5,
      timeout: 25000,
      retryAttempts: 2,
      priority: 'high'
    },
    metrics: {
      totalRequests: 900,
      successfulRequests: 892,
      failedRequests: 8,
      averageProcessingTime: 1.8,
      uptime: 99.8
    },
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agent-3',
    name: 'Fraud Detector',
    nameAr: 'كاشف الاحتيال',
    type: 'fraud_detector',
    status: 'active',
    description: 'Real-time fraud detection and suspicious activity monitoring',
    descriptionAr: 'كشف الاحتيال في الوقت الفعلي ومراقبة الأنشطة المشبوهة',
    capabilities: [
      'Pattern Recognition',
      'Anomaly Detection',
      'Risk Scoring',
      'Real-time Monitoring',
      'Alert Management'
    ],
    model: 'gemini-pro',
    provider: 'Google',
    lastActive: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    tasksCompleted: 2156,
    tasksInProgress: 5,
    successRate: 97.8,
    averageResponseTime: 1.2,
    configuration: {
      maxConcurrentTasks: 15,
      timeout: 15000,
      retryAttempts: 3,
      priority: 'high'
    },
    metrics: {
      totalRequests: 2204,
      successfulRequests: 2156,
      failedRequests: 48,
      averageProcessingTime: 1.2,
      uptime: 98.9
    },
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agent-4',
    name: 'Workflow Automator',
    nameAr: 'أتمتة سير العمل',
    type: 'workflow_automator',
    status: 'inactive',
    description: 'Intelligent workflow automation and process optimization',
    descriptionAr: 'أتمتة سير العمل الذكي وتحسين العمليات',
    capabilities: [
      'Process Automation',
      'Task Scheduling',
      'Decision Making',
      'Integration Management',
      'Performance Optimization'
    ],
    model: 'llama-3-70b',
    provider: 'Meta',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tasksCompleted: 456,
    tasksInProgress: 0,
    successRate: 95.2,
    averageResponseTime: 3.1,
    configuration: {
      maxConcurrentTasks: 8,
      timeout: 45000,
      retryAttempts: 2,
      priority: 'medium'
    },
    metrics: {
      totalRequests: 479,
      successfulRequests: 456,
      failedRequests: 23,
      averageProcessingTime: 3.1,
      uptime: 87.5
    },
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'agent-5',
    name: 'Report Generator',
    nameAr: 'مولد التقارير',
    type: 'report_generator',
    status: 'maintenance',
    description: 'Automated report generation and business intelligence insights',
    descriptionAr: 'توليد التقارير التلقائي ورؤى ذكاء الأعمال',
    capabilities: [
      'Report Generation',
      'Data Analysis',
      'Visualization',
      'Insights Extraction',
      'Automated Scheduling'
    ],
    model: 'mistral-large',
    provider: 'Mistral',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tasksCompleted: 234,
    tasksInProgress: 0,
    successRate: 92.1,
    averageResponseTime: 4.5,
    configuration: {
      maxConcurrentTasks: 3,
      timeout: 60000,
      retryAttempts: 1,
      priority: 'low'
    },
    metrics: {
      totalRequests: 254,
      successfulRequests: 234,
      failedRequests: 20,
      averageProcessingTime: 4.5,
      uptime: 78.3
    },
    tenantId: 'demo-tenant',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    let filteredAgents = mockAIAgents.filter(agent => agent.tenantId === tenantId);

    // Apply filters
    if (type) {
      filteredAgents = filteredAgents.filter(agent => agent.type === type);
    }
    if (status) {
      filteredAgents = filteredAgents.filter(agent => agent.status === status);
    }

    // Calculate statistics
    const stats = {
      total: filteredAgents.length,
      active: filteredAgents.filter(a => a.status === 'active').length,
      inactive: filteredAgents.filter(a => a.status === 'inactive').length,
      maintenance: filteredAgents.filter(a => a.status === 'maintenance').length,
      error: filteredAgents.filter(a => a.status === 'error').length,
      totalTasks: filteredAgents.reduce((sum, a) => sum + a.tasksCompleted, 0),
      tasksInProgress: filteredAgents.reduce((sum, a) => sum + a.tasksInProgress, 0),
      averageSuccessRate: filteredAgents.reduce((sum, a) => sum + a.successRate, 0) / filteredAgents.length || 0,
      averageResponseTime: filteredAgents.reduce((sum, a) => sum + a.averageResponseTime, 0) / filteredAgents.length || 0
    };

    const response: any = {
      success: true,
      data: includeMetrics ? filteredAgents : filteredAgents.map(({ metrics, ...agent }) => agent),
      stats
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const { agentId, action, configuration } = await request.json();

    const agentIndex = mockAIAgents.findIndex(agent => agent.id === agentId);
    if (agentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = mockAIAgents[agentIndex];

    switch (action) {
      case 'start':
        agent.status = 'active';
        agent.lastActive = new Date().toISOString();
        break;
      
      case 'stop':
        agent.status = 'inactive';
        agent.tasksInProgress = 0;
        break;
      
      case 'restart':
        agent.status = 'active';
        agent.lastActive = new Date().toISOString();
        agent.tasksInProgress = 0;
        break;
      
      case 'configure':
        if (configuration) {
          agent.configuration = { ...agent.configuration, ...configuration };
        }
        break;
      
      case 'maintenance':
        agent.status = 'maintenance';
        agent.tasksInProgress = 0;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    agent.updatedAt = new Date().toISOString();
    mockAIAgents[agentIndex] = agent;

    return NextResponse.json({
      success: true,
      data: agent,
      message: `Agent ${action} completed successfully`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agentIndex = mockAIAgents.findIndex(agent => agent.id === id);
    if (agentIndex === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update the agent
    mockAIAgents[agentIndex] = {
      ...mockAIAgents[agentIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockAIAgents[agentIndex]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
