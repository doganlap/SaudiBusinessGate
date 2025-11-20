import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { SolutionService } from '@/lib/services/solution.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';

export const POST = withRateLimit(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const score = await SolutionService.qualifyRFP(tenantId, id, body.criteria);
    
    // Clear cache
    await multiLayerCache.invalidatePattern(`solution:rfps:${tenantId}:*`);
    
    return NextResponse.json({
      success: true,
      data: { score },
      message: 'RFP qualified successfully'
    });
  } catch (error) {
    console.error('Error qualifying RFP:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to qualify RFP',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

