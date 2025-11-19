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
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = `
      SELECT 
        id,
        statement_period,
        period_start,
        period_end,
        operating_income,
        operating_expenses,
        operating_net,
        investing_purchases,
        investing_sales,
        investing_net,
        financing_borrowings,
        financing_repayments,
        financing_dividends,
        financing_net,
        net_cash_flow,
        beginning_balance,
        ending_balance,
        status,
        created_at
      FROM cash_flow_statements
      WHERE tenant_id = $1
    `;

    const params: any[] = [tenantId];

    if (startDate && endDate) {
      query += ` AND period_start >= $2 AND period_end <= $3`;
      params.push(startDate, endDate);
    } else {
      // Get last 6 months by default
      query += ` AND statement_period = $2 ORDER BY period_start DESC LIMIT 6`;
      params.push(period);
    }

    const result = await pool.query(query, params);

    const cashFlowData = result.rows.map((row: any) => ({
      period: new Date(row.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      operating: {
        income: parseFloat(row.operating_income || 0),
        expenses: parseFloat(row.operating_expenses || 0),
        net: parseFloat(row.operating_net || 0)
      },
      investing: {
        purchases: parseFloat(row.investing_purchases || 0),
        sales: parseFloat(row.investing_sales || 0),
        net: parseFloat(row.investing_net || 0)
      },
      financing: {
        borrowings: parseFloat(row.financing_borrowings || 0),
        repayments: parseFloat(row.financing_repayments || 0),
        dividends: parseFloat(row.financing_dividends || 0),
        net: parseFloat(row.financing_net || 0)
      },
      netCashFlow: parseFloat(row.net_cash_flow || 0),
      beginningBalance: parseFloat(row.beginning_balance || 0),
      endingBalance: parseFloat(row.ending_balance || 0)
    }));

    return NextResponse.json({
      success: true,
      data: cashFlowData,
      cashFlow: cashFlowData
    });
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash flow data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const body = await request.json();

    const {
      statement_period,
      period_start,
      period_end,
      operating_income,
      operating_expenses,
      investing_purchases,
      investing_sales,
      financing_borrowings,
      financing_repayments,
      financing_dividends,
      beginning_balance
    } = body;

    const query = `
      INSERT INTO cash_flow_statements (
        tenant_id, statement_period, period_start, period_end,
        operating_income, operating_expenses,
        investing_purchases, investing_sales,
        financing_borrowings, financing_repayments, financing_dividends,
        beginning_balance, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      tenantId,
      statement_period,
      period_start,
      period_end,
      operating_income || 0,
      operating_expenses || 0,
      investing_purchases || 0,
      investing_sales || 0,
      financing_borrowings || 0,
      financing_repayments || 0,
      financing_dividends || 0,
      beginning_balance || 0,
      (session.user as any).id || 'system'
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Cash flow statement created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cash flow statement:', error);
    return NextResponse.json(
      { error: 'Failed to create cash flow statement', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

