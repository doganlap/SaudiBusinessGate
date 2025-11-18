import { NextRequest, NextResponse } from 'next/server';
import { testConnection, query } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // Test query execution
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    
    // Test if tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        currentTime: result.rows[0]?.current_time,
        dbVersion: result.rows[0]?.db_version,
        tablesCount: tablesResult.rowCount,
        tables: tablesResult.rows.map(row => row.table_name)
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
