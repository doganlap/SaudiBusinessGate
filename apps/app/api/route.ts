import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'DoganHub Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/platform/status',
      dashboard: '/api/dashboard/stats',
      auth: '/api/auth/me',
      modules: [
        'finance',
        'sales', 
        'crm',
        'hr',
        'procurement',
        'analytics',
        'billing',
        'platform'
      ]
    }
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Use GET to access API information'
  }, { status: 405 });
}
