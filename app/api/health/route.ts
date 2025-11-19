import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Try to import services, but don't fail if they're not available
    let dbTest: PromiseSettledResult<any> = { status: 'rejected', reason: 'Service not available' };
    let connectionsReport: PromiseSettledResult<any> = { status: 'rejected', reason: 'Service not available' };
    
    try {
      const { databaseStatsService } = await import('@/lib/services/database-stats.service');
      const { appConnectionsService } = await import('@/lib/services/app-connections.service');
      
      // Basic health check
      [dbTest, connectionsReport] = await Promise.allSettled([
        databaseStatsService.testDatabaseConnection(),
        appConnectionsService.getConnectionsReport()
      ]);
    } catch (importError) {
      // Services not available, continue with basic health check
      console.warn('Health check services not available:', importError);
    }

    const responseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: dbTest.status === 'fulfilled' ? dbTest.value : { isConnected: false, error: 'Failed to check' },
        overall: connectionsReport.status === 'fulfilled' ? connectionsReport.value.overallHealth : 'unknown'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      version: process.version,
      environment: process.env.NODE_ENV || 'unknown'
    };

    // Determine overall status
    if (dbTest.status === 'rejected' || 
        (dbTest.status === 'fulfilled' && !dbTest.value.isConnected)) {
      health.status = 'degraded';
    }

    if (connectionsReport.status === 'fulfilled' && 
        connectionsReport.value.overallHealth === 'critical') {
      health.status = 'critical';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}