import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { multiLayerCache, CACHE_TTL } from '@/lib/services/multi-layer-cache.service';
import { SolutionService } from '@/lib/services/solution.service';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      sector: searchParams.get('sector') || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const cacheKey = `solution:rfps:${tenantId}:${JSON.stringify(filters)}`;
    const rfps = await multiLayerCache.getOrFetch(
      cacheKey,
      async () => await SolutionService.getRFPs(tenantId, filters),
      { ttl: CACHE_TTL.MEDIUM, module: 'solution', staleWhileRevalidate: true }
    );

    return NextResponse.json({
      success: true,
      data: rfps,
      total: rfps.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RFPs',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.client_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title and client_name'
      }, { status: 400 });
    }
    
    const newRFP = await SolutionService.createRFP(tenantId, body);
    
    // Auto-tag if description provided
    if (body.description) {
      await SolutionService.autoTagRFP(tenantId, newRFP.id, body.description);
    }
    
    // Clear cache
    await multiLayerCache.invalidatePattern(`solution:rfps:${tenantId}:*`);
    
    return NextResponse.json({
      success: true,
      data: newRFP,
      message: 'RFP created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating RFP:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create RFP',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

