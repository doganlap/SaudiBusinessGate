import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    
    const quote = await QuotesService.getQuoteById(tenantId, id);
    if (!quote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quote',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    const body = await req.json();
    
    const updatedQuote = await QuotesService.updateQuote(tenantId, id, body);
    if (!updatedQuote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedQuote,
      message: 'Quote updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update quote',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';
    
    const deleted = await QuotesService.deleteQuote(tenantId, id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete quote',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}