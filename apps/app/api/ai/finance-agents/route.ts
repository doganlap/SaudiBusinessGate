import { NextRequest, NextResponse } from 'next/server';
import { AIFinanceAgentService } from '@/lib/services/ai-finance-agents.service';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    
    const filters = {
      agent_type: searchParams.get('agent_type') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };
    
    const agents = await AIFinanceAgentService.getAgents(tenantId, filters);
    
    // Get performance metrics for all agents
    const metrics = await AIFinanceAgentService.getAgentPerformanceMetrics(tenantId);
    
    // Combine agents with their metrics
    const agentsWithMetrics = agents.map(agent => {
      const agentMetrics = metrics.find((m: any) => m.agent_code === agent.agent_code);
      return {
        ...agent,
        current_tasks: agentMetrics?.current_tasks || 0,
        completed_tasks: agentMetrics?.completed_tasks || 0,
        failed_tasks: agentMetrics?.failed_tasks || 0
      };
    });
    
    return NextResponse.json({
      success: true,
      data: agentsWithMetrics,
      total: agentsWithMetrics.length,
      filters
    });
  } catch (error) {
    console.error('Error fetching AI finance agents:', error);
    
    // Fallback sample data
    const fallbackAgents = [
      {
        id: '1',
        tenant_id: 'default-tenant',
        agent_code: 'CFO_AGENT',
        agent_name: 'AI Chief Financial Officer',
        agent_title_en: 'Chief Financial Officer',
        agent_title_ar: 'المدير المالي التنفيذي',
        agent_type: 'executive',
        agent_status: 'active',
        agent_version: '1.0.0',
        primary_functions: ['strategic_planning', 'financial_oversight', 'board_reporting', 'risk_management'],
        decision_authority_level: 10,
        automation_level: 'full',
        llm_model: 'gpt-4',
        tasks_completed: 156,
        success_rate: 94.5,
        average_processing_time: 45,
        current_tasks: 3,
        completed_tasks: 12,
        failed_tasks: 1,
        created_at: '2024-11-01T00:00:00Z'
      },
      {
        id: '2',
        tenant_id: 'default-tenant',
        agent_code: 'CONTROLLER_AGENT',
        agent_name: 'AI Finance Controller',
        agent_title_en: 'Finance Controller',
        agent_title_ar: 'المراقب المالي',
        agent_type: 'operational',
        agent_status: 'active',
        agent_version: '1.0.0',
        primary_functions: ['financial_reporting', 'month_end_close', 'compliance', 'internal_controls'],
        decision_authority_level: 8,
        automation_level: 'full',
        llm_model: 'gpt-4',
        tasks_completed: 234,
        success_rate: 97.2,
        average_processing_time: 32,
        current_tasks: 5,
        completed_tasks: 18,
        failed_tasks: 0,
        created_at: '2024-11-01T00:00:00Z'
      },
      {
        id: '3',
        tenant_id: 'default-tenant',
        agent_code: 'AR_SPECIALIST_AGENT',
        agent_name: 'AI AR Specialist',
        agent_title_en: 'Accounts Receivable Specialist',
        agent_title_ar: 'أخصائي الحسابات المدينة',
        agent_type: 'specialist',
        agent_status: 'active',
        agent_version: '1.0.0',
        primary_functions: ['invoice_processing', 'payment_collection', 'customer_management', 'aging_analysis'],
        decision_authority_level: 5,
        automation_level: 'full',
        llm_model: 'gpt-4',
        tasks_completed: 445,
        success_rate: 98.8,
        average_processing_time: 15,
        current_tasks: 8,
        completed_tasks: 35,
        failed_tasks: 2,
        created_at: '2024-11-01T00:00:00Z'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackAgents,
      total: fallbackAgents.length,
      fallback: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();
    
    if (action === 'make_decision') {
      // Agent decision making
      const { agent_code, decision_context } = body;
      
      if (!agent_code || !decision_context) {
        return NextResponse.json(
          { success: false, error: 'Missing agent_code or decision_context' },
          { status: 400 }
        );
      }
      
      const decision = await AIFinanceAgentService.makeAgentDecision(
        tenantId, 
        agent_code, 
        decision_context
      );
      
      return NextResponse.json({
        success: true,
        data: decision,
        message: 'Agent decision completed'
      });
    }
    
    if (action === 'trigger_workflow') {
      // Trigger a workflow
      const { workflow_code, trigger_data } = body;
      
      if (!workflow_code) {
        return NextResponse.json(
          { success: false, error: 'Missing workflow_code' },
          { status: 400 }
        );
      }
      
      const execution = await AIFinanceAgentService.triggerWorkflow(
        tenantId, 
        workflow_code, 
        trigger_data || {}
      );
      
      return NextResponse.json({
        success: true,
        data: execution,
        message: 'Workflow triggered successfully'
      });
    }
    
    if (action === 'create_event') {
      // Create a new event
      const event = await AIFinanceAgentService.createEvent(tenantId, body);
      
      return NextResponse.json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in AI finance agents API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
