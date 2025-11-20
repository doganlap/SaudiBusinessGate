/**
 * Real-Time KPIs API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { realtimeKPIs } from '@/lib/services/realtime-analytics-kpis.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';
import { CACHE_TTL } from '@/lib/services/multi-layer-cache.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || undefined;
    const kpiId = searchParams.get('id') || undefined;

    if (kpiId) {
      const cacheKey = `kpi:${kpiId}`;
      const kpi = await multiLayerCache.getOrFetch(
        cacheKey,
        async () => {
          return await realtimeKPIs.getKPI(kpiId);
        },
        { ttl: CACHE_TTL.SHORT, module }
      );

      if (!kpi) {
        return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
      }

      const response = NextResponse.json({ success: true, kpi });
      multiLayerCache.addCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
      return response;
    }

    if (module) {
      const cacheKey = `kpis:${module}`;
      const kpis = await multiLayerCache.getOrFetch(
        cacheKey,
        async () => {
          return await realtimeKPIs.getKPIs(module);
        },
        { ttl: CACHE_TTL.SHORT, module }
      );

      const response = NextResponse.json({ success: true, kpis });
      multiLayerCache.addCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
      return response;
    }

    return NextResponse.json(
      { error: 'Module or KPI ID is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('KPIs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 200 });

