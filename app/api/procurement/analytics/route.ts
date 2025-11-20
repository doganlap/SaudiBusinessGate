/**
 * Procurement Analytics API
 * Advanced analytics for procurement module
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build cache key
    const cacheKey = `${CACHE_PREFIXES.ANALYTICS}procurement:${tenantId}:${dateFrom || 'all'}:${dateTo || 'all'}`;

    // Get or fetch analytics with caching
    const analytics = await multiLayerCache.getOrFetch(
      cacheKey,
      async () => {
        return await procurementService.getProcurementAnalytics(tenantId, {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
      },
      {
        ttl: CACHE_TTL.MEDIUM,
        module: 'procurement',
        staleWhileRevalidate: true,
      }
    );

    const response = NextResponse.json({
      success: true,
      analytics,
      module: 'procurement',
    });

    // Add cache headers
    multiLayerCache.addCacheHeaders(response, {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60,
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching procurement analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch procurement analytics' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

