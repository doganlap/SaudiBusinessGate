/**
 * Advanced Analytics Dashboards API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { advancedAnalytics } from '@/lib/services/advanced-analytics.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || undefined;
    const dashboardId = searchParams.get('id') || undefined;

    if (dashboardId) {
      const dashboard = await advancedAnalytics.getDashboard(dashboardId);
      if (!dashboard) {
        return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, dashboard });
    }

    const dashboards = module
      ? await advancedAnalytics.getDashboards(module)
      : [];

    return NextResponse.json({
      success: true,
      dashboards,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { module, name, description } = body;

    if (!module || !name) {
      return NextResponse.json(
        { error: 'Module and name are required' },
        { status: 400 }
      );
    }

    const dashboard = await advancedAnalytics.createDashboard(module, name, description);

    return NextResponse.json({
      success: true,
      dashboard,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create dashboard error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 50 });

