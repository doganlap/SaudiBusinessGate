import { NextRequest, NextResponse } from 'next/server';
import { databaseStatsService } from '@/lib/services/database-stats.service';

export async function GET(request: NextRequest) {
  try {
    const stats = await databaseStatsService.getDatabaseStats();
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch database statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'test-connection':
        const connectionTest = await databaseStatsService.testDatabaseConnection();
        return NextResponse.json(connectionTest);

      case 'get-activity':
        const activity = await databaseStatsService.getConnectionActivity();
        return NextResponse.json({ activity });

      case 'get-locks':
        const locks = await databaseStatsService.getDatabaseLocks();
        return NextResponse.json({ locks });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing database stats request:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}