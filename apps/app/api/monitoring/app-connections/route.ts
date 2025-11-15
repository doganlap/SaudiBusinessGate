import { NextRequest, NextResponse } from 'next/server';
import { appConnectionsService } from '@/lib/services/app-connections.service';

export async function GET(request: NextRequest) {
  try {
    const report = await appConnectionsService.getConnectionsReport();
    
    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching app connections report:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch app connections report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, action } = body;

    // Handle specific service checks
    switch (service) {
      case 'database':
        if (action === 'test') {
          // Test database connection specifically
          const result = await fetch('/api/monitoring/database-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'test-connection' })
          });
          const data = await result.json();
          return NextResponse.json(data);
        }
        break;

      case 'all':
        if (action === 'refresh') {
          // Force refresh all connections
          const report = await appConnectionsService.getConnectionsReport();
          return NextResponse.json(report);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid service or action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing app connections request:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}