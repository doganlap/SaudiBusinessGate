import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes.service';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const rfqs = await QuotesService.getRfqs(tenantId, filters);
    
    return NextResponse.json({
      success: true,
      data: rfqs,
      total: rfqs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RFQs',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['customer_id', 'rfq_number', 'title'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    const newRfq = await QuotesService.createRfq(tenantId, body);
    
    return NextResponse.json({
      success: true,
      data: newRfq,
      message: 'RFQ created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create RFQ',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}