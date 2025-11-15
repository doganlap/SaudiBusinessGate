import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    await pool.query('SELECT 1');
    await pool.end();

    return NextResponse.json({
      status: 'healthy',
      service: 'database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'database',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
