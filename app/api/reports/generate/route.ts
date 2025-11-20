/**
 * Automated Reporting API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { automatedReporting } from '@/lib/services/automated-reporting.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || undefined;

    const templates = await automatedReporting.getTemplates(module);

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch templates' },
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
    const { templateId, format, filters, dateRange } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const execution = await automatedReporting.generateReport(templateId, {
      format,
      filters,
      dateRange: dateRange ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      } : undefined,
    });

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 20 });

