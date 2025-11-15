import { NextRequest, NextResponse } from 'next/server';
import { Deal } from '@/types/sales';
import { SalesService } from '@/lib/services/sales.service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('tenant-id');

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const deals = await SalesService.getDeals(tenantId);
    const summary = await SalesService.getDealsSummary(tenantId);
    
    return NextResponse.json({ deals, summary });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newDeal: Deal = {
      id: Date.now().toString(),
      ...body,
      tenantId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      stage: 'prospecting',
      probability: 20
    };
    
    mockDeals.push(newDeal);
    
    return NextResponse.json({
      success: true,
      deal: newDeal,
      message: 'Deal created successfully'
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
