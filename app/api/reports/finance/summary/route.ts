import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db/connection'
import { financeService } from '@/lib/services/finance.service'

export async function GET(_req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenantCode = (session.user as any)?.tenantCode || 'DEFAULT'
  const tenantRes = await query<{ id: string }>('SELECT id FROM tenants WHERE tenant_code = $1 LIMIT 1', [tenantCode])
  const tenantId = tenantRes.rows?.[0]?.id
  if (!tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  const stats = await financeService.getFinancialStats(tenantId)
  const summary = await financeService.getAccountSummary(tenantId)
  return NextResponse.json({ stats, summary })
}