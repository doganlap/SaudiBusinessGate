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

    const quotes = await QuotesService.getQuotes(tenantId, filters);
    
    return NextResponse.json({
      success: true,
      data: quotes,
      total: quotes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quotes',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['deal_id', 'customer_id', 'quote_number', 'total_amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    const newQuote = await QuotesService.createQuote(tenantId, body);
    
    return NextResponse.json({
      success: true,
      data: newQuote,
      message: 'Quote created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create quote',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}