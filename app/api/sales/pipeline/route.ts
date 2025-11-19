import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

interface PipelineStage {
  id: string;
  name: string;
  deals: PipelineDeal[];
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  color: string;
}

interface PipelineDeal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  daysInStage: number;
}

const STAGES = [
  { id: 'prospect', name: 'Prospecting', color: 'bg-gray-100 border-gray-300', conversionRate: 25 },
  { id: 'qualified', name: 'Qualification', color: 'bg-blue-50 border-blue-200', conversionRate: 40 },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-50 border-yellow-200', conversionRate: 60 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-50 border-orange-200', conversionRate: 75 },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-50 border-green-200', conversionRate: 100 },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-50 border-red-200', conversionRate: 0 }
];

async function getPipelineFromDatabase(tenantId: string): Promise<PipelineStage[]> {
  try {
    // Fetch deals from database
    const dealsResult = await query(`
      SELECT 
        d.id, d.name, d.value, d.stage, d.probability, d.expected_close_date,
        d.assigned_to, d.created_at,
        c.name as customer_name, c.company
      FROM deals d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.tenant_id = $1
      ORDER BY d.created_at DESC
    `, [tenantId]);

    // Group deals by stage
    const pipeline: PipelineStage[] = STAGES.map(stage => ({
      ...stage,
      deals: [],
      totalValue: 0,
      averageDealSize: 0
    }));

    const now = new Date();
    for (const row of dealsResult.rows) {
      const stageIndex = STAGES.findIndex(s => s.id === row.stage);
      if (stageIndex === -1) continue;

      const createdDate = new Date(row.created_at);
      const daysInStage = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      const deal: PipelineDeal = {
        id: row.id.toString(),
        name: row.name,
        company: row.company || row.customer_name || '',
        value: Number(row.value),
        probability: row.probability || 0,
        expectedCloseDate: row.expected_close_date ? new Date(row.expected_close_date).toISOString().split('T')[0] : '',
        assignedTo: row.assigned_to || '',
        daysInStage
      };

      pipeline[stageIndex].deals.push(deal);
      pipeline[stageIndex].totalValue += deal.value;
    }

    // Calculate averages
    for (const stage of pipeline) {
      stage.averageDealSize = stage.deals.length > 0 ? stage.totalValue / stage.deals.length : 0;
    }

    return pipeline;
  } catch (error: any) {
    if (error.code === '42P01') {
      // Table doesn't exist
      return [];
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    
    // Try to get real data from database
    let pipeline: PipelineStage[];
    try {
      pipeline = await getPipelineFromDatabase(tenantId);
    } catch (error) {
      console.error('Error fetching pipeline from database:', error);
      // Return empty pipeline if database error
      pipeline = STAGES.map(stage => ({
        ...stage,
        deals: [],
        totalValue: 0,
        averageDealSize: 0
      }));
    }
    
    const totalPipelineValue = pipeline.reduce((sum, stage) => sum + stage.totalValue, 0);
    const totalDeals = pipeline.reduce((sum, stage) => sum + stage.deals.length, 0);
    const weightedValue = pipeline.reduce((sum, stage) => 
      sum + stage.deals.reduce((stageSum, deal) => stageSum + (deal.value * deal.probability / 100), 0), 0
    );
    
    return NextResponse.json({
      success: true,
      pipeline,
      summary: {
        totalPipelineValue,
        totalDeals,
        weightedValue,
        avgDealSize: totalDeals > 0 ? totalPipelineValue / totalDeals : 0,
        avgConversionRate: pipeline.length > 0 
          ? pipeline.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipeline.length 
          : 0
      },
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline' },
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

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const body = await request.json();
    const { dealId, fromStage, toStage } = body;
    
    if (!dealId || !fromStage || !toStage) {
      return NextResponse.json(
        { success: false, error: 'dealId, fromStage, and toStage are required' },
        { status: 400 }
      );
    }
    
    // Update deal stage in database
    try {
      await query(`
        UPDATE deals 
        SET stage = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
      `, [toStage, dealId, tenantId]);

      // Record pipeline movement
      await query(`
        INSERT INTO sales_pipeline (
          tenant_id, deal_id, stage, probability, moved_at, moved_by
        ) VALUES ($1, $2, $3, $4, NOW(), $5)
      `, [tenantId, dealId, toStage, body.probability || 0, (session.user as any).email || 'system']);

      // Get updated pipeline
      const pipeline = await getPipelineFromDatabase(tenantId);
    
    return NextResponse.json({
      success: true,
      message: 'Deal moved successfully',
        pipeline
      });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Deals table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error moving deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move deal' },
      { status: 500 }
    );
  }
}
