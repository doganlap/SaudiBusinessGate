/**
 * Analytics Query API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { advancedAnalytics } from '@/lib/services/advanced-analytics.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { module, metrics, dimensions, filters, timeRange, aggregation } = body;

    if (!module || !metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Module and metrics array are required' },
        { status: 400 }
      );
    }

    const query = {
      module,
      metrics,
      dimensions,
      filters,
      timeRange: timeRange ? {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end),
      } : undefined,
      aggregation,
    };

    const result = await advancedAnalytics.executeQuery(query);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Analytics query error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute query' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

