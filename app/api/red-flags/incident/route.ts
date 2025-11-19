import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
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
  const id = data.incidentId;
  if (!id) {
    return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
  }
  const res = await query(
    `SELECT id, title, description, status, severity, organization_id, created_at, updated_at
     FROM incidents WHERE id = $1`,
    [id]
  );
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }
  const row = res.rows[0];
  const status = {
    incidentId: String(row.id),
    status: row.status,
    flagType: row.title,
    severity: row.severity,
    detectedAt: (row.created_at || new Date()).toISOString(),
    containmentActions: [],
    agentJobs: [],
    timeline: []
  };
  return NextResponse.json({ success: true, data: status });
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
  const orgId = parseInt(tenantId, 10);
  if (isNaN(orgId)) {
    return NextResponse.json({ error: 'Invalid tenant/organization ID' }, { status: 400 });
  }
  const res = await query(
    `SELECT id, title, severity, status, created_at
     FROM incidents
     WHERE organization_id = $1 AND status IN ('active','investigating')
     ORDER BY created_at DESC
     LIMIT 100`,
    [orgId]
  );
  const rows = res.rows || [];
  const incidents = rows.map((r: any) => ({
    incidentId: String(r.id),
    flagType: r.title,
    severity: r.severity,
    entityId: null,
    detectedAt: (r.created_at || new Date()).toISOString(),
    status: r.status,
    assignedAgent: null
  }));
  return NextResponse.json({ success: true, data: incidents, count: incidents.length });
}

// ملخص الأعلام الحمراء
async function getRedFlagsSummary(tenantId: string) {
  const orgId = parseInt(tenantId, 10);
  if (isNaN(orgId)) {
    return NextResponse.json({ error: 'Invalid tenant/organization ID' }, { status: 400 });
  }
  const res = await query(
    `SELECT severity, COUNT(*) as count
     FROM incidents
     WHERE organization_id = $1
     GROUP BY severity`,
    [orgId]
  );
  const bySeverity: any = {};
  let total = 0;
  for (const row of res.rows) {
    bySeverity[row.severity || 'unknown'] = Number(row.count) || 0;
    total += Number(row.count) || 0;
  }
  return NextResponse.json({ success: true, data: { total, bySeverity, byType: {}, trends: {} } });
}

// حالة مهام الوكلاء
async function getAgentJobsStatus(tenantId: string) {
  return NextResponse.json({ success: true, data: [], summary: { total: 0, completed: 0, running: 0, queued: 0, failed: 0 } });
}
