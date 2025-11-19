import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPool } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    const query = `
      SELECT 
        month,
        revenue,
        expenses,
        profit,
        accounts_receivable,
        accounts_payable,
        cash_flow
      FROM monthly_financial_summary
      WHERE tenant_id = $1
      ORDER BY month DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [tenantId, limit]);

    const monthlyData = result.rows.map((row: any) => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: parseFloat(row.revenue || 0),
      expenses: parseFloat(row.expenses || 0),
      profit: parseFloat(row.profit || 0)
    }));

    return NextResponse.json({
      success: true,
      data: monthlyData,
      monthly: monthlyData
    });
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

