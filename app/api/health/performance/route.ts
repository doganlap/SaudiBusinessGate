/**
 * Performance Health Check Endpoint
 * GET /api/health/performance
 */

import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/monitoring/performance';

export async function GET() {
  try {
    const healthStatus = getHealthStatus();

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Performance health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
