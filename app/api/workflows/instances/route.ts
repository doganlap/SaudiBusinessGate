import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db/connection';
// import { emitWorkflowUpdate, emitWorkflowCreated } from '@/server/websocket';

// GET /api/workflows/instances
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        wi.id,
        wi.workflow_name as "workflowName",
        wi.workflow_name_ar as "workflowNameAr",
        wi.status,
        wi.created_at as "createdAt",
        wi.updated_at as "updatedAt",
        wi.started_at as "startedAt",
        wi.completed_at as "completedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', ws.id,
              'stepName', ws.step_name,
              'stepNameAr', ws.step_name_ar,
              'status', ws.status,
              'startedAt', ws.started_at,
              'completedAt', ws.completed_at,
              'duration', ws.duration_ms,
              'progress', ws.progress,
              'details', ws.details,
              'detailsAr', ws.details_ar,
              'agentName', ws.agent_name
            ) ORDER BY ws.step_order
          ) FILTER (WHERE ws.id IS NOT NULL),
          '[]'
        ) as steps
      FROM workflow_instances wi
      LEFT JOIN workflow_steps ws ON ws.workflow_instance_id = wi.id
      WHERE wi.tenant_id = $1
    `;

    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (workflowId) {
      sql += ` AND wi.id = $${paramIndex}`;
      params.push(workflowId);
      paramIndex++;
    }

    if (status) {
      sql += ` AND wi.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` GROUP BY wi.id ORDER BY wi.created_at DESC LIMIT 50`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      workflows: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST /api/workflows/instances
export async function POST(req: NextRequest) {
  const client = await getClient();
  
  try {
    const body = await req.json();
    const {
      tenantId,
      workflowName,
      workflowNameAr,
      steps,
      createdBy
    } = body;

    if (!tenantId || !workflowName || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Create workflow instance
    const workflowResult = await client.query(
      `
      INSERT INTO workflow_instances (
        tenant_id, 
        workflow_name, 
        workflow_name_ar, 
        status,
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, 'queued', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [tenantId, workflowName, workflowNameAr || workflowName, createdBy]
    );

    const workflow = workflowResult.rows[0];

    // Create workflow steps
    const stepPromises = steps.map((step: any, index: number) =>
      client.query(
        `
        INSERT INTO workflow_steps (
          workflow_instance_id,
          step_name,
          step_name_ar,
          step_order,
          status,
          details,
          details_ar,
          agent_name,
          progress,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
        `,
        [
          workflow.id,
          step.name,
          step.nameAr || step.name,
          index,
          step.details || '',
          step.detailsAr || step.details || '',
          step.agentName || 'system'
        ]
      )
    );

    const stepResults = await Promise.all(stepPromises);
    const createdSteps = stepResults.map(r => r.rows[0]);

    await client.query('COMMIT');

    // Prepare response
    const workflowWithSteps = {
      ...workflow,
      workflowName: workflow.workflow_name,
      workflowNameAr: workflow.workflow_name_ar,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
      steps: createdSteps.map(s => ({
        id: s.id,
        stepName: s.step_name,
        stepNameAr: s.step_name_ar,
        status: s.status,
        progress: s.progress,
        details: s.details,
        detailsAr: s.details_ar,
        agentName: s.agent_name
      }))
    };

    // Emit WebSocket event (disabled until websocket server is implemented)
    // try {
    //   emitWorkflowCreated(tenantId, workflowWithSteps);
    // } catch (wsError) {
    //   console.error('WebSocket emit error:', wsError);
    // }

    return NextResponse.json({
      success: true,
      workflow: workflowWithSteps
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create workflow' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// PATCH /api/workflows/instances (update status)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflowId, tenantId, status, stepId, stepStatus, stepProgress } = body;

    if (!workflowId || !tenantId) {
      return NextResponse.json(
        { error: 'workflowId and tenantId are required' },
        { status: 400 }
      );
    }

    // Update workflow status
    if (status) {
      await query(
        `
        UPDATE workflow_instances 
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP,
            ${status === 'running' ? 'started_at = CURRENT_TIMESTAMP,' : ''}
            ${status === 'completed' || status === 'failed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
        WHERE id = $2 AND tenant_id = $3
        `,
        [status, workflowId, tenantId]
      );
    }

    // Update step status
    if (stepId && stepStatus !== undefined) {
      await query(
        `
        UPDATE workflow_steps 
        SET status = $1,
            progress = $2,
            updated_at = CURRENT_TIMESTAMP,
            ${stepStatus === 'running' ? 'started_at = CURRENT_TIMESTAMP,' : ''}
            ${stepStatus === 'completed' || stepStatus === 'failed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
            ${stepStatus === 'completed' || stepStatus === 'failed' ? 'duration_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000,' : ''}
        WHERE id = $3
        `,
        [stepStatus, stepProgress || 0, stepId]
      );
    }

    // Fetch updated workflow
    const result = await query(
      `
      SELECT 
        wi.*,
        json_agg(
          json_build_object(
            'id', ws.id,
            'stepName', ws.step_name,
            'stepNameAr', ws.step_name_ar,
            'status', ws.status,
            'progress', ws.progress,
            'startedAt', ws.started_at,
            'completedAt', ws.completed_at,
            'duration', ws.duration_ms
          ) ORDER BY ws.step_order
        ) as steps
      FROM workflow_instances wi
      LEFT JOIN workflow_steps ws ON ws.workflow_instance_id = wi.id
      WHERE wi.id = $1 AND wi.tenant_id = $2
      GROUP BY wi.id
      `,
      [workflowId, tenantId]
    );

    const updatedWorkflow = result.rows[0];

    // Emit WebSocket event
    try {
      // emitWorkflowUpdate(tenantId, updatedWorkflow); // Disabled until websocket server is implemented
    } catch (wsError) {
      console.error('WebSocket emit error:', wsError);
    }

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow
    });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update workflow' },
      { status: 500 }
    );
  }
}
