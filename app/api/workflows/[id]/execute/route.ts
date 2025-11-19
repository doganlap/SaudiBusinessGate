import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { WorkflowAutomationEngine } from '@/Services/Workflow/workflow-automation-engine';

const workflowEngine = new WorkflowAutomationEngine();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authentication check
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract workflow ID from params
        const { id } = await params;
        const workflowId = parseInt(id, 10);

        if (isNaN(workflowId)) {
            return NextResponse.json(
                { error: 'Invalid workflow ID', details: `Workflow ID must be a number, got: ${id}` },
                { status: 400 }
            );
        }

        // Get execution context from request body (optional)
        const body = await request.json().catch(() => ({}));
        const context = body.context || body || {};

        // Get organization ID from session
        const organizationId = (session.user as any)?.organizationId;
        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID not found in session' },
                { status: 400 }
            );
        }

        // Execute the workflow
        console.log(`Executing workflow ${workflowId} for organization ${organizationId}...`);
        const execution = await workflowEngine.executeWorkflow(workflowId, {
            ...context,
            organizationId,
            executedBy: (session.user as any).id,
            executedAt: new Date().toISOString()
        });

        // Return execution result
        return NextResponse.json({
            success: true,
            execution: {
                id: execution.id,
                workflow_id: execution.workflow_id,
                status: execution.status,
                started_at: execution.started_at,
                completed_at: execution.completed_at,
                error_message: execution.error_message,
                context: execution.context
            },
            message: execution.status === 'completed' 
                ? 'Workflow executed successfully' 
                : execution.status === 'failed'
                ? `Workflow execution failed: ${execution.error_message}`
                : 'Workflow execution in progress'
        }, { 
            status: execution.status === 'completed' ? 200 : execution.status === 'failed' ? 500 : 202 
        });
        
    } catch (error) {
        console.error('/api/workflows/[id]/execute error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Internal server error', 
                details: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}





