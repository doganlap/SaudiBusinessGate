import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { RBACService } from '@/lib/auth/rbac-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const pool = getPool();
    const audit = new AuditLogger(pool);
    const rbac = new RBACService(pool);
    const organizationId = (session.user as any).organizationId || 0;
    const userId = (session.user as any).id || 0;
    const allowed = await rbac.checkPermission(userId, 'finance.budgets.read', organizationId);
    if (!allowed) {
      await audit.logPermissionCheck(userId, organizationId, 'finance.budgets.read', false);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tenantId = request.headers.get('x-tenant-id') || String(organizationId);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || undefined;

    let sql = `
      SELECT 
        id, budget_name, category, total_budget, currency,
        budget_period, start_date, end_date, status,
        created_at, updated_at
      FROM budgets
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    if (period) {
      sql += ` AND budget_period = $2`;
      params.push(period);
    }

    const result = await pool.query(sql, params);

    const budgets = result.rows.map((row: any) => ({
      id: row.id,
      name: row.budget_name,
      category: row.category,
      budgetedAmount: parseFloat(row.total_budget || 0),
      actualAmount: 0,
      period: row.budget_period,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      variance: 0,
      variancePercent: 0
    }));

    await audit.logDataAccess(userId, organizationId, 'budget', 0, 'read');
    return NextResponse.json({
      success: true,
      budgets,
      total: budgets.length,
      summary: {
        totalBudgeted: budgets.reduce((sum: number, b: any) => sum + b.budgetedAmount, 0),
        totalActual: budgets.reduce((sum: number, b: any) => sum + b.actualAmount, 0),
        overBudgetCount: budgets.filter((b: any) => b.status === 'over-budget').length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const tenantId = request.headers.get('x-tenant-id') || String(organizationId);
    const body = await request.json();

    const required = ['budget_name', 'budget_period', 'start_date', 'end_date', 'total_budget'];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ success: false, error: `Missing field: ${f}` }, { status: 400 });
    }

    const sql = `
      INSERT INTO budgets (
        tenant_id, budget_name, budget_period, start_date, end_date,
        category, total_budget, currency, status, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'SAR'), COALESCE($9, 'active'), $10, $11)
      RETURNING *
    `;

    const result = await pool.query(sql, [
      tenantId,
      body.budget_name,
      body.budget_period,
      body.start_date,
      body.end_date,
      body.category || null,
      body.total_budget,
      body.currency || null,
      body.status || null,
      body.description || null,
      userId
    ]);

    await audit.logDataChange(userId, organizationId, 'budget', result.rows[0].id, null, result.rows[0]);
    return NextResponse.json({ success: true, budget: result.rows[0], message: 'Budget created successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
