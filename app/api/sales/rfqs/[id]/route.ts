import { NextRequest, NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const rfq = await QuotesService.getRfqById(tenantId, id);
    if (!rfq) {
      return NextResponse.json({
        success: false,
        error: 'RFQ not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: rfq,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RFQ',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const body = await req.json();
    const updatedRfq = await QuotesService.updateRfq(tenantId, id, body);
    if (!updatedRfq) {
      return NextResponse.json({
        success: false,
        error: 'RFQ not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updatedRfq,
      message: 'RFQ updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update RFQ',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.headers.get('tenant-id') || 'default';

  try {
    const deleted = await QuotesService.deleteRfq(tenantId, id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'RFQ not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'RFQ deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete RFQ',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}