import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pool = getPool();
  const audit = new AuditLogger(pool);
  const rbac = new RBACService(pool);
  const organizationId = (session.user as any).organizationId || 0;
  const userId = (session.user as any).id || 0;
  const allowed = await rbac.checkPermission(userId, 'finance.budgets.write', organizationId);
  if (!allowed) {
    await audit.logPermissionCheck(userId, organizationId, 'finance.budgets.write', false);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const existing = await pool.query('SELECT id, name, fiscal_year, amount, spent FROM budgets WHERE organization_id = $1 AND id = $2', [organizationId, id]);
  const oldRow = existing.rows[0] || null;
  const updated = await pool.query(
    'UPDATE budgets SET name = COALESCE($1, name), fiscal_year = COALESCE($2, fiscal_year), amount = COALESCE($3, amount) WHERE organization_id = $4 AND id = $5 RETURNING id, name, fiscal_year, amount, spent',
    [body.name, body.fiscalYear, body.amount, organizationId, id]
  );
  const newRow = updated.rows[0];
  await audit.logDataChange(userId, organizationId, 'budget', newRow.id, oldRow, newRow);
  return NextResponse.json(newRow);
}