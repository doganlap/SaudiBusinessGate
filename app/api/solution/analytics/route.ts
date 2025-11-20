import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { multiLayerCache, CACHE_TTL } from '@/lib/services/multi-layer-cache.service';
import { SolutionService } from '@/lib/services/solution.service';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    
    const { searchParams } = new URL(request.url);
    const filters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const cacheKey = `solution:analytics:${tenantId}:${JSON.stringify(filters)}`;
    const analytics = await multiLayerCache.getOrFetch(
      cacheKey,
      async () => await SolutionService.getAnalytics(tenantId, filters),
      { ttl: CACHE_TTL.MEDIUM, module: 'solution', staleWhileRevalidate: true }
    );

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

