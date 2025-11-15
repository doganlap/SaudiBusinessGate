import { query, transaction, PoolClient } from '@/lib/db/connection';

// AI Finance Agent Interfaces
export interface AIFinanceAgent {
  id: string;
  tenant_id: string;
  agent_code: string;
  agent_name: string;
  agent_title_en: string;
  agent_title_ar: string;
  agent_type: 'executive' | 'operational' | 'analytical' | 'specialist';
  agent_status: 'active' | 'inactive' | 'learning' | 'error';
  agent_version: string;
  primary_functions: string[];
  secondary_functions: string[];
  decision_authority_level: number;
  automation_level: 'full' | 'semi' | 'manual';
  llm_model: string;
  prompt_template?: string;
  chain_of_thought_enabled: boolean;
  memory_enabled: boolean;
  learning_enabled: boolean;
  tasks_completed: number;
  success_rate: number;
  average_processing_time: number;
  last_active_at?: string;
  config_json?: any;
  created_at: string;
  updated_at: string;
}

export interface AIWorkflow {
  id: string;
  tenant_id: string;
  workflow_code: string;
  workflow_name: string;
  workflow_description?: string;
  trigger_type: 'event' | 'schedule' | 'manual' | 'api';
  trigger_conditions: any;
  workflow_steps: any[];
  is_autonomous: boolean;
  requires_approval: boolean;
  approval_threshold?: number;
  primary_agent_id?: string;
  secondary_agents: string[];
  execution_count: number;
  success_count: number;
  failure_count: number;
  average_duration: number;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface AIWorkflowExecution {
  id: string;
  tenant_id: string;
  workflow_id: string;
  execution_number: string;
  trigger_event?: string;
  trigger_data?: any;
  input_data?: any;
  output_data?: any;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps?: number;
  executing_agent_id?: string;
  agent_decisions?: any;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  success?: boolean;
  error_message?: string;
  warning_messages: string[];
  financial_impact?: any;
}

export interface AIAgentTask {
  id: string;
  tenant_id: string;
  execution_id?: string;
  agent_id: string;
  task_type: 'analyze' | 'calculate' | 'approve' | 'execute' | 'report';
  task_name: string;
  task_description?: string;
  task_priority: number;
  input_data?: any;
  output_data?: any;
  processing_context?: any;
  llm_prompt?: string;
  llm_response?: string;
  chain_of_thought?: string;
  confidence_score?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  success?: boolean;
  error_message?: string;
  retry_count: number;
}

export interface AIFinanceEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  event_source: 'system' | 'external_api' | 'user' | 'agent';
  event_name: string;
  event_data: any;
  event_metadata?: any;
  processed: boolean;
  processing_agent_id?: string;
  workflows_triggered: string[];
  event_timestamp: string;
  processed_at?: string;
  priority: number;
  routing_rules?: any;
}

export class AIFinanceAgentService {
  // AGENT MANAGEMENT
  
  static async getAgents(tenantId: string, filters?: {
    agent_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AIFinanceAgent[]> {
    let sql = 'SELECT * FROM ai_finance_agents WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.agent_type) {
      sql += ` AND agent_type = $${paramIndex}`;
      params.push(filters.agent_type);
      paramIndex++;
    }

    if (filters?.status) {
      sql += ` AND agent_status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ' ORDER BY decision_authority_level DESC, agent_name ASC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<AIFinanceAgent>(sql, params);
    return result.rows;
  }

  static async getAgentByCode(tenantId: string, agentCode: string): Promise<AIFinanceAgent | null> {
    const result = await query<AIFinanceAgent>(
      'SELECT * FROM ai_finance_agents WHERE tenant_id = $1 AND agent_code = $2',
      [tenantId, agentCode]
    );
    return result.rows[0] || null;
  }

  static async updateAgentPerformance(tenantId: string, agentId: string, metrics: {
    tasks_completed?: number;
    success_rate?: number;
    average_processing_time?: number;
  }): Promise<AIFinanceAgent | null> {
    const setClause = [];
    const params: any[] = [tenantId, agentId];
    let paramIndex = 3;

    if (metrics.tasks_completed !== undefined) {
      setClause.push(`tasks_completed = tasks_completed + $${paramIndex}`);
      params.push(metrics.tasks_completed);
      paramIndex++;
    }

    if (metrics.success_rate !== undefined) {
      setClause.push(`success_rate = $${paramIndex}`);
      params.push(metrics.success_rate);
      paramIndex++;
    }

    if (metrics.average_processing_time !== undefined) {
      setClause.push(`average_processing_time = $${paramIndex}`);
      params.push(metrics.average_processing_time);
      paramIndex++;
    }

    setClause.push(`last_active_at = CURRENT_TIMESTAMP`);

    if (setClause.length === 0) return null;

    const sql = `
      UPDATE ai_finance_agents 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await query<AIFinanceAgent>(sql, params);
    return result.rows[0] || null;
  }

  // WORKFLOW MANAGEMENT

  static async getWorkflows(tenantId: string, filters?: {
    status?: string;
    trigger_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<AIWorkflow[]> {
    let sql = 'SELECT * FROM ai_finance_workflows WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.trigger_type) {
      sql += ` AND trigger_type = $${paramIndex}`;
      params.push(filters.trigger_type);
      paramIndex++;
    }

    sql += ' ORDER BY workflow_name ASC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<AIWorkflow>(sql, params);
    return result.rows;
  }

  static async triggerWorkflow(tenantId: string, workflowCode: string, triggerData: any): Promise<AIWorkflowExecution> {
    return await transaction(async (client) => {
      // Get workflow
      const workflowResult = await client.query(
        'SELECT * FROM ai_finance_workflows WHERE tenant_id = $1 AND workflow_code = $2 AND status = $3',
        [tenantId, workflowCode, 'active']
      );

      if (workflowResult.rows.length === 0) {
        throw new Error(`Workflow ${workflowCode} not found or inactive`);
      }

      const workflow = workflowResult.rows[0];

      // Generate execution number
      const executionNumberResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(execution_number FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_number
         FROM ai_workflow_executions WHERE tenant_id = $1`,
        [tenantId]
      );
      const executionNumber = `WF-${executionNumberResult.rows[0].next_number.toString().padStart(6, '0')}`;

      // Create execution record
      const executionResult = await client.query<AIWorkflowExecution>(
        `INSERT INTO ai_workflow_executions (
          tenant_id, workflow_id, execution_number, trigger_event, trigger_data,
          input_data, total_steps, executing_agent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          tenantId, workflow.id, executionNumber, 'manual_trigger', triggerData,
          triggerData, workflow.workflow_steps.length, workflow.primary_agent_id
        ]
      );

      // Update workflow execution count
      await client.query(
        'UPDATE ai_finance_workflows SET execution_count = execution_count + 1 WHERE id = $1',
        [workflow.id]
      );

      return executionResult.rows[0];
    });
  }

  static async executeWorkflowStep(tenantId: string, executionId: string, stepNumber: number): Promise<AIAgentTask> {
    return await transaction(async (client) => {
      // Get execution details
      const executionResult = await client.query(
        `SELECT we.*, wf.workflow_steps 
         FROM ai_workflow_executions we
         JOIN ai_finance_workflows wf ON we.workflow_id = wf.id
         WHERE we.tenant_id = $1 AND we.id = $2`,
        [tenantId, executionId]
      );

      if (executionResult.rows.length === 0) {
        throw new Error('Workflow execution not found');
      }

      const execution = executionResult.rows[0];
      const step = execution.workflow_steps[stepNumber - 1];

      if (!step) {
        throw new Error(`Step ${stepNumber} not found in workflow`);
      }

      // Get agent for this step
      const agentResult = await client.query(
        'SELECT * FROM ai_finance_agents WHERE tenant_id = $1 AND agent_code = $2',
        [tenantId, step.agent]
      );

      if (agentResult.rows.length === 0) {
        throw new Error(`Agent ${step.agent} not found`);
      }

      const agent = agentResult.rows[0];

      // Create agent task
      const taskResult = await client.query<AIAgentTask>(
        `INSERT INTO ai_agent_tasks (
          tenant_id, execution_id, agent_id, task_type, task_name,
          task_description, input_data, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          tenantId, executionId, agent.id, step.action, step.action.replace('_', ' '),
          `Execute ${step.action} for workflow step ${stepNumber}`,
          execution.input_data, 'pending'
        ]
      );

      // Update execution current step
      await client.query(
        'UPDATE ai_workflow_executions SET current_step = $3 WHERE tenant_id = $1 AND id = $2',
        [tenantId, executionId, stepNumber]
      );

      return taskResult.rows[0];
    });
  }

  // EVENT SYSTEM

  static async createEvent(tenantId: string, eventData: {
    event_type: string;
    event_source: 'system' | 'external_api' | 'user' | 'agent';
    event_name: string;
    event_data: any;
    event_metadata?: any;
    priority?: number;
    routing_rules?: any;
  }): Promise<AIFinanceEvent> {
    const result = await query<AIFinanceEvent>(
      `INSERT INTO ai_finance_events (
        tenant_id, event_type, event_source, event_name, event_data,
        event_metadata, priority, routing_rules
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        tenantId, eventData.event_type, eventData.event_source, eventData.event_name,
        eventData.event_data, eventData.event_metadata, eventData.priority || 5,
        eventData.routing_rules
      ]
    );
    return result.rows[0];
  }

  static async processEvents(tenantId: string, limit: number = 10): Promise<AIFinanceEvent[]> {
    return await transaction(async (client) => {
      // Get unprocessed events
      const eventsResult = await client.query<AIFinanceEvent>(
        `SELECT * FROM ai_finance_events 
         WHERE tenant_id = $1 AND processed = false 
         ORDER BY priority DESC, event_timestamp ASC 
         LIMIT $2`,
        [tenantId, limit]
      );

      const events = eventsResult.rows;
      const processedEvents: AIFinanceEvent[] = [];

      for (const event of events) {
        // Find matching workflows
        const workflowsResult = await client.query(
          `SELECT * FROM ai_finance_workflows 
           WHERE tenant_id = $1 AND status = 'active' 
           AND trigger_type = 'event'
           AND trigger_conditions->>'event_type' = $2`,
          [tenantId, event.event_type]
        );

        const triggeredWorkflows: string[] = [];

        // Trigger matching workflows
        for (const workflow of workflowsResult.rows) {
          try {
            const execution = await this.triggerWorkflow(tenantId, workflow.workflow_code, event.event_data);
            triggeredWorkflows.push(workflow.id);
          } catch (error) {
            console.error(`Failed to trigger workflow ${workflow.workflow_code}:`, error);
          }
        }

        // Mark event as processed
        await client.query(
          `UPDATE ai_finance_events 
           SET processed = true, processed_at = CURRENT_TIMESTAMP, workflows_triggered = $3
           WHERE id = $1 AND tenant_id = $2`,
          [event.id, tenantId, triggeredWorkflows]
        );

        processedEvents.push({
          ...event,
          processed: true,
          workflows_triggered: triggeredWorkflows,
          processed_at: new Date().toISOString()
        });
      }

      return processedEvents;
    });
  }

  // AGENT DECISION ENGINE

  static async makeAgentDecision(tenantId: string, agentCode: string, decisionContext: {
    task_type: string;
    input_data: any;
    business_rules?: any[];
    threshold_checks?: any[];
  }): Promise<{
    decision: 'approve' | 'reject' | 'escalate' | 'request_info';
    confidence: number;
    reasoning: string;
    recommended_actions?: string[];
  }> {
    // Get agent
    const agent = await this.getAgentByCode(tenantId, agentCode);
    if (!agent) {
      throw new Error(`Agent ${agentCode} not found`);
    }

    // Simulate AI decision making (in real implementation, this would call LLM)
    const decision = this.simulateAIDecision(agent, decisionContext);

    // Update agent performance
    await this.updateAgentPerformance(tenantId, agent.id, {
      tasks_completed: 1,
      average_processing_time: Math.floor(Math.random() * 30) + 5 // 5-35 seconds
    });

    return decision;
  }

  private static simulateAIDecision(agent: AIFinanceAgent, context: any): any {
    // This is a simplified simulation - in real implementation, this would:
    // 1. Use the agent's LLM model and prompt template
    // 2. Apply chain-of-thought reasoning
    // 3. Check against business rules and thresholds
    // 4. Consider agent's memory and past decisions

    const { task_type, input_data } = context;
    let decision = 'approve';
    let confidence = 0.85;
    let reasoning = `Agent ${agent.agent_name} analyzed the ${task_type} request.`;

    // Simple rule-based logic for demonstration
    if (task_type === 'payment_approval' && input_data.amount > agent.decision_authority_level * 1000) {
      decision = 'escalate';
      confidence = 0.95;
      reasoning += ` Amount ${input_data.amount} exceeds authority level, escalating to higher authority.`;
    } else if (task_type === 'invoice_validation' && !input_data.vendor_verified) {
      decision = 'request_info';
      confidence = 0.70;
      reasoning += ' Vendor verification required before processing.';
    }

    return {
      decision,
      confidence,
      reasoning,
      recommended_actions: [`Execute ${task_type}`, 'Update records', 'Send notifications']
    };
  }

  // ANALYTICS AND REPORTING

  static async getAgentPerformanceMetrics(tenantId: string, agentId?: string): Promise<any> {
    let sql = `
      SELECT 
        afa.agent_code,
        afa.agent_name,
        afa.tasks_completed,
        afa.success_rate,
        afa.average_processing_time,
        COUNT(aat.id) as current_tasks,
        COUNT(CASE WHEN aat.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN aat.status = 'failed' THEN 1 END) as failed_tasks
      FROM ai_finance_agents afa
      LEFT JOIN ai_agent_tasks aat ON afa.id = aat.agent_id AND aat.created_at >= CURRENT_DATE - INTERVAL '30 days'
      WHERE afa.tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (agentId) {
      sql += ' AND afa.id = $2';
      params.push(agentId);
    }

    sql += ' GROUP BY afa.id, afa.agent_code, afa.agent_name, afa.tasks_completed, afa.success_rate, afa.average_processing_time';

    const result = await query(sql, params);
    return result.rows;
  }

  static async getWorkflowMetrics(tenantId: string): Promise<any> {
    const result = await query(`
      SELECT 
        wf.workflow_code,
        wf.workflow_name,
        wf.execution_count,
        wf.success_count,
        wf.failure_count,
        wf.average_duration,
        COUNT(we.id) as recent_executions,
        COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as recent_successes,
        COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as recent_failures
      FROM ai_finance_workflows wf
      LEFT JOIN ai_workflow_executions we ON wf.id = we.workflow_id AND we.started_at >= CURRENT_DATE - INTERVAL '30 days'
      WHERE wf.tenant_id = $1
      GROUP BY wf.id, wf.workflow_code, wf.workflow_name, wf.execution_count, wf.success_count, wf.failure_count, wf.average_duration
      ORDER BY wf.execution_count DESC
    `, [tenantId]);

    return result.rows;
  }
}
