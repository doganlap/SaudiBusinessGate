import { NextRequest, NextResponse } from 'next/server';
import { incidentMode, IncidentContext } from '@/lib/red-flags/incident-mode';
import { redFlagsAgents } from '@/lib/agents/red-flags-agents';

// Red Flags Incident Response API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'activate_incident_mode':
        return await activateIncidentMode(data);
      
      case 'execute_agent':
        return await executeAgent(data);
      
      case 'get_incident_status':
        return await getIncidentStatus(data);
      
      case 'resolve_incident':
        return await resolveIncident(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Red Flags API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// تفعيل وضع الحادث
async function activateIncidentMode(data: any) {
  const context: IncidentContext = {
    tenantId: data.tenantId,
    flagType: data.flagType,
    severity: data.severity || 'medium',
    entityId: data.entityId,
    entityType: data.entityType,
    detectedAt: new Date(data.detectedAt || Date.now()),
    evidence: data.evidence || {},
    actorId: data.actorId
  };

  const response = await incidentMode.activateIncidentMode(context);

  return NextResponse.json({
    success: true,
    data: response,
    message: 'Incident mode activated successfully'
  });
}

// تشغيل وكيل ذكي
async function executeAgent(data: any) {
  const job = {
    jobId: data.jobId || `JOB-${Date.now()}`,
    jobType: data.jobType,
    tenantId: data.tenantId,
    incidentId: data.incidentId,
    priority: data.priority || 'medium',
    inputData: data.inputData,
    status: 'queued' as const,
    createdAt: new Date()
  };

  const result = await redFlagsAgents.executeAgent(job);

  return NextResponse.json({
    success: true,
    data: result,
    message: 'Agent executed successfully'
  });
}

// الحصول على حالة الحادث
async function getIncidentStatus(data: any) {
  // هذا مثال - في التطبيق الحقيقي سيتم الاستعلام من قاعدة البيانات
  const mockStatus = {
    incidentId: data.incidentId,
    status: 'active',
    flagType: 'accounting_unbalanced',
    severity: 'high',
    detectedAt: new Date().toISOString(),
    containmentActions: [
      'GL posting disabled',
      'Imbalances moved to Suspense',
      'Finance team notified'
    ],
    agentJobs: [
      {
        jobId: 'JOB-123',
        jobType: 'FIN_REPAIR_UNBALANCED',
        status: 'completed',
        result: 'Successfully repaired unbalanced entries'
      }
    ],
    timeline: [
      {
        timestamp: new Date().toISOString(),
        action: 'Incident detected',
        actor: 'SYSTEM'
      },
      {
        timestamp: new Date().toISOString(),
        action: 'Containment activated',
        actor: 'INCIDENT_MODE'
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: mockStatus
  });
}

// حل الحادث
async function resolveIncident(data: any) {
  // في التطبيق الحقيقي، سيتم تحديث قاعدة البيانات
  const resolution = {
    incidentId: data.incidentId,
    resolvedAt: new Date().toISOString(),
    resolvedBy: data.resolvedBy,
    resolutionNotes: data.resolutionNotes,
    finalStatus: 'resolved'
  };

  return NextResponse.json({
    success: true,
    data: resolution,
    message: 'Incident resolved successfully'
  });
}

// GET endpoint للاستعلامات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'active_incidents':
        return await getActiveIncidents(tenantId);
      
      case 'red_flags_summary':
        return await getRedFlagsSummary(tenantId);
      
      case 'agent_jobs_status':
        return await getAgentJobsStatus(tenantId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Red Flags GET Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// الحصول على الحوادث النشطة
async function getActiveIncidents(tenantId: string) {
  // مثال على البيانات - في التطبيق الحقيقي من قاعدة البيانات
  const mockIncidents = [
    {
      incidentId: 'INC-001',
      flagType: 'accounting_unbalanced',
      severity: 'high',
      entityId: 'J-2024-001',
      detectedAt: new Date().toISOString(),
      status: 'active',
      assignedAgent: 'FIN_REPAIR_UNBALANCED'
    },
    {
      incidentId: 'INC-002',
      flagType: 'duplicate_transaction',
      severity: 'medium',
      entityId: 'PAY-2024-456',
      detectedAt: new Date().toISOString(),
      status: 'investigating',
      assignedAgent: 'FIN_DEDUP_REVIEW'
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockIncidents,
    count: mockIncidents.length
  });
}

// ملخص الأعلام الحمراء
async function getRedFlagsSummary(tenantId: string) {
  const mockSummary = {
    total: 15,
    byType: {
      accounting_unbalanced: { count: 3, severity: 'high' },
      duplicate_transaction: { count: 5, severity: 'medium' },
      sanctioned_entity: { count: 1, severity: 'critical' },
      audit_tampered: { count: 0, severity: 'critical' },
      large_unexplained: { count: 4, severity: 'high' },
      rapid_succession: { count: 2, severity: 'medium' }
    },
    bySeverity: {
      critical: 1,
      high: 7,
      medium: 7,
      low: 0
    },
    trends: {
      last24Hours: 8,
      last7Days: 15,
      last30Days: 45
    }
  };

  return NextResponse.json({
    success: true,
    data: mockSummary
  });
}

// حالة مهام الوكلاء
async function getAgentJobsStatus(tenantId: string) {
  const mockJobs = [
    {
      jobId: 'JOB-001',
      jobType: 'FIN_REPAIR_UNBALANCED',
      status: 'completed',
      priority: 'high',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: 'Successfully repaired 3 unbalanced entries'
    },
    {
      jobId: 'JOB-002',
      jobType: 'FIN_DEDUP_REVIEW',
      status: 'running',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      progress: 75
    },
    {
      jobId: 'JOB-003',
      jobType: 'COMPLIANCE_CASE_OPEN',
      status: 'queued',
      priority: 'critical',
      createdAt: new Date().toISOString()
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockJobs,
    summary: {
      total: mockJobs.length,
      completed: mockJobs.filter(j => j.status === 'completed').length,
      running: mockJobs.filter(j => j.status === 'running').length,
      queued: mockJobs.filter(j => j.status === 'queued').length,
      failed: mockJobs.filter(j => j.status === 'failed').length
    }
  });
}
