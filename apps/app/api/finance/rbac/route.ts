import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';
import { RBACService } from '@/lib/auth/rbac-service';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pool = getPool();
  const rbac = new RBACService(pool);
  const organizationId = (session.user as any).organizationId || 0;
  const userId = (session.user as any).id || 0;
  const budgetsWrite = await rbac.checkPermission(userId, 'finance.budgets.write', organizationId);
  const costCentersWrite = await rbac.checkPermission(userId, 'finance.cost_centers.write', organizationId);
  const budgetsRead = await rbac.checkPermission(userId, 'finance.budgets.read', organizationId);
  const costCentersRead = await rbac.checkPermission(userId, 'finance.cost_centers.read', organizationId);
  return NextResponse.json({ budgetsWrite, costCentersWrite, budgetsRead, costCentersRead });
}