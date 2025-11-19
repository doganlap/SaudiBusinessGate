import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

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

// Database functions for AI Agent management
async function getAIAgents(tenantId: string, filters: any = {}): Promise<AIAgent[]> {
  try {
    let whereClause = 'WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.type) {
      whereClause += ` AND agent_type = $${paramIndex++}`;
      params.push(filters.type);
    }

    const result = await query(`
      SELECT 
        id, name, name_ar, agent_type, status, description, description_ar,
        capabilities, model, provider, last_active, tasks_completed, 
        tasks_in_progress, success_rate, avg_response_time, configuration,
        metrics, tenant_id, created_at, updated_at
      FROM ai_agents
      ${whereClause}
      ORDER BY created_at DESC
    `, params);

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      type: row.agent_type,
      status: row.status,
      description: row.description,
      descriptionAr: row.description_ar,
      capabilities: JSON.parse(row.capabilities || '[]'),
      model: row.model,
      provider: row.provider,
      lastActive: row.last_active?.toISOString() || new Date().toISOString(),
      tasksCompleted: row.tasks_completed || 0,
      tasksInProgress: row.tasks_in_progress || 0,
      successRate: row.success_rate || 0,
      averageResponseTime: row.avg_response_time || 0,
      configuration: JSON.parse(row.configuration || '{}'),
      metrics: JSON.parse(row.metrics || '{}'),
      tenantId: row.tenant_id,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching AI agents:', error);
    return [];
  }
}

async function createAIAgent(agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIAgent | null> {
  try {
    const result = await query(`
      INSERT INTO ai_agents (
        tenant_id, name, name_ar, agent_type, status, description, description_ar,
        capabilities, model, provider, tasks_completed, tasks_in_progress,
        success_rate, avg_response_time, configuration, metrics
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      agentData.tenantId,
      agentData.name,
      agentData.nameAr,
      agentData.type,
      agentData.status,
      agentData.description,
      agentData.descriptionAr,
      JSON.stringify(agentData.capabilities),
      agentData.model,
      agentData.provider,
      agentData.tasksCompleted,
      agentData.tasksInProgress,
      agentData.successRate,
      agentData.averageResponseTime,
      JSON.stringify(agentData.configuration),
      JSON.stringify(agentData.metrics)
    ]);

    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      type: row.agent_type,
      status: row.status,
      description: row.description,
      descriptionAr: row.description_ar,
      capabilities: JSON.parse(row.capabilities || '[]'),
      model: row.model,
      provider: row.provider,
      lastActive: row.last_active?.toISOString() || new Date().toISOString(),
      tasksCompleted: row.tasks_completed || 0,
      tasksInProgress: row.tasks_in_progress || 0,
      successRate: row.success_rate || 0,
      averageResponseTime: row.avg_response_time || 0,
      configuration: JSON.parse(row.configuration || '{}'),
      metrics: JSON.parse(row.metrics || '{}'),
      tenantId: row.tenant_id,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating AI agent:', error);
    return null;
  }
}

async function updateAIAgent(id: string, updates: Partial<AIAgent>): Promise<AIAgent | null> {
  try {
    const result = await query(`
      UPDATE ai_agents 
      SET 
        name = COALESCE($2, name),
        name_ar = COALESCE($3, name_ar),
        status = COALESCE($4, status),
        description = COALESCE($5, description),
        description_ar = COALESCE($6, description_ar),
        configuration = COALESCE($7, configuration),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id,
      updates.name,
      updates.nameAr,
      updates.status,
      updates.description,
      updates.descriptionAr,
      updates.configuration ? JSON.stringify(updates.configuration) : null
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      type: row.agent_type,
      status: row.status,
      description: row.description,
      descriptionAr: row.description_ar,
      capabilities: JSON.parse(row.capabilities || '[]'),
      model: row.model,
      provider: row.provider,
      lastActive: row.last_active?.toISOString() || new Date().toISOString(),
      tasksCompleted: row.tasks_completed || 0,
      tasksInProgress: row.tasks_in_progress || 0,
      successRate: row.success_rate || 0,
      averageResponseTime: row.avg_response_time || 0,
      configuration: JSON.parse(row.configuration || '{}'),
      metrics: JSON.parse(row.metrics || '{}'),
      tenantId: row.tenant_id,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Update AI agent error:', error);
    return null;
  }
}

async function deleteAIAgent(id: string, tenantId: string): Promise<boolean> {
  try {
    const result = await query(`
      DELETE FROM ai_agents 
      WHERE (id = $1 OR uuid = $1) AND tenant_id = $2
      RETURNING id
    `, [id, tenantId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Delete AI agent error:', error);
    return false;
  }
}

// Fallback mock data for when database is not available
const fallbackAIAgents: AIAgent[] = [
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'demo-tenant';
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    // Try to get agents from database
    let filteredAgents = await getAIAgents(tenantId, { type, status });

    // If no agents found in database, use fallback data
    if (filteredAgents.length === 0) {
      filteredAgents = fallbackAIAgents.filter((agent: AIAgent) => agent.tenantId === tenantId);
      
      if (type) {
        filteredAgents = filteredAgents.filter((agent: AIAgent) => agent.type === type);
      }
      if (status) {
        filteredAgents = filteredAgents.filter((agent: AIAgent) => agent.status === status);
      }
    }

    // Calculate statistics
    const stats = {
      total: filteredAgents.length,
      active: filteredAgents.filter((a: AIAgent) => a.status === 'active').length,
      inactive: filteredAgents.filter((a: AIAgent) => a.status === 'inactive').length,
      maintenance: filteredAgents.filter((a: AIAgent) => a.status === 'maintenance').length,
      error: filteredAgents.filter((a: AIAgent) => a.status === 'error').length,
      totalTasks: filteredAgents.reduce((sum: number, a: AIAgent) => sum + a.tasksCompleted, 0),
      tasksInProgress: filteredAgents.reduce((sum: number, a: AIAgent) => sum + a.tasksInProgress, 0),
      averageSuccessRate: filteredAgents.reduce((sum: number, a: AIAgent) => sum + a.successRate, 0) / filteredAgents.length || 0,
      averageResponseTime: filteredAgents.reduce((sum: number, a: AIAgent) => sum + a.averageResponseTime, 0) / filteredAgents.length || 0
    };

    const response: any = {
      success: true,
      data: includeMetrics ? filteredAgents : filteredAgents.map(({ metrics, ...agent }: AIAgent) => agent),
      stats,
      source: filteredAgents.length > 0 ? 'database' : 'fallback'
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'demo-tenant';
    const body = await request.json();

    // Handle different POST actions
    if (body.agentId && body.action) {
      // Update existing agent
      const { agentId, action, configuration } = body;
      
      let updates: Partial<AIAgent> = {};
      
      switch (action) {
        case 'start':
          updates = { status: 'active' };
          break;
        
        case 'stop':
          updates = { status: 'inactive' };
          break;
        
        case 'restart':
          updates = { status: 'active' };
          break;
        
        case 'configure':
          if (configuration) {
            updates = { configuration };
          }
          break;
        
        case 'maintenance':
          updates = { status: 'maintenance' };
          break;
        
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }

      const updatedAgent = await updateAIAgent(agentId, updates);
      
      if (!updatedAgent) {
        return NextResponse.json(
          { error: 'Agent not found or update failed' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedAgent,
        message: `Agent ${action} successful`
      });
    } else {
      // Create new agent
      const {
        name, nameAr, type, description, descriptionAr, capabilities,
        model = 'gpt-4', provider = 'OpenAI', configuration = {}
      } = body;

      if (!name || !type) {
        return NextResponse.json(
          { error: 'Name and type are required' },
          { status: 400 }
        );
      }

      const newAgentData = {
        name,
        nameAr: nameAr || name,
        type,
        status: 'inactive' as const,
        description: description || '',
        descriptionAr: descriptionAr || description || '',
        capabilities: capabilities || [],
        model,
        provider,
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        tasksInProgress: 0,
        successRate: 0,
        averageResponseTime: 0,
        configuration,
        metrics: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageProcessingTime: 0,
          uptime: 0
        },
        tenantId
      };

      const newAgent = await createAIAgent(newAgentData);
      
      if (!newAgent) {
        return NextResponse.json(
          { error: 'Failed to create agent' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: newAgent,
        message: 'Agent created successfully'
      }, { status: 201 });
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'demo-tenant';

    const deleted = await deleteAIAgent(id, tenantId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
