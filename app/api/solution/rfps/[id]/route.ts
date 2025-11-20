import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const rfp = await SolutionService.getRFPById(tenantId, id);
    
    if (!rfp) {
      return NextResponse.json({
        success: false,
        error: 'RFP not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RFP',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const updatedRFP = await SolutionService.updateRFP(tenantId, id, body);
    
    if (!updatedRFP) {
      return NextResponse.json({
        success: false,
        error: 'RFP not found'
      }, { status: 404 });
    }
    
    // Clear cache
    await multiLayerCache.invalidatePattern(`solution:rfps:${tenantId}:*`);
    
    return NextResponse.json({
      success: true,
      data: updatedRFP,
      message: 'RFP updated successfully'
    });
  } catch (error) {
    console.error('Error updating RFP:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update RFP',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

