import { NextRequest, NextResponse } from 'next/server'
import { query, getPool } from '@/lib/db/connection'
import { getServerSession } from 'next-auth'
import { AuditLogger } from '@/lib/audit/audit-logger'
import { RBACService } from '@/lib/auth/rbac-service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pool = getPool();
  const audit = new AuditLogger(pool);
  const rbac = new RBACService(pool);
  const organizationId = (session.user as any).organizationId || 0;
  const userId = (session.user as any).id || 0;
  const allowed = await rbac.checkPermission(userId, 'finance.transactions.read', organizationId);
  if (!allowed) {
    await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.read', false);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const result = await query('SELECT * FROM transactions WHERE id = $1', [params.id])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await audit.logDataAccess(userId, organizationId, 'transaction', 0, 'read')
  return NextResponse.json(result.rows[0])
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pool = getPool();
  const audit = new AuditLogger(pool);
  const rbac = new RBACService(pool);
  const organizationId = (session.user as any).organizationId || 0;
  const userId = (session.user as any).id || 0;
  const allowed = await rbac.checkPermission(userId, 'finance.transactions.write', organizationId);
  if (!allowed) {
    await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.write', false);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json()
  const fields = ['account_id','transaction_type','amount','transaction_date','reference_id','transaction_number','description','status']
  const updates: string[] = []
  const values: any[] = []
  let i = 1
  for (const f of fields) { if (body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(body[f]) } }
  values.push(params.id)
  const sql = `UPDATE transactions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`
  const result = await query(sql, values)
  if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await audit.logDataChange(userId, organizationId, 'transaction', (result.rows[0] as any).id, null, result.rows[0])
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pool = getPool();
  const audit = new AuditLogger(pool);
  const rbac = new RBACService(pool);
  const organizationId = (session.user as any).organizationId || 0;
  const userId = (session.user as any).id || 0;
  const allowed = await rbac.checkPermission(userId, 'finance.transactions.write', organizationId);
  if (!allowed) {
    await audit.logPermissionCheck(userId, organizationId, 'finance.transactions.write', false);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const before = await query('SELECT * FROM transactions WHERE id = $1', [params.id])
  const result = await query('DELETE FROM transactions WHERE id = $1 RETURNING id', [params.id])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await audit.logDataChange(userId, organizationId, 'transaction', (result.rows[0] as any).id, before.rows[0], null)
  return NextResponse.json({ success: true })
}