import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPool } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
    responseTime: 0
  };

  try {
    // Prisma Connection Check - NO FALLBACKS
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const userCount = await prisma.user.count();
    checks.checks.prisma = {
      status: 'ok',
      userCount,
      connected: true
    };

    // Direct Pool Connection Check
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database');
    checks.checks.pool = {
      status: 'ok',
      currentTime: result.rows[0].current_time,
      database: result.rows[0].database,
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount
    };

    // Database Tables Check
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    checks.checks.schema = {
      status: 'ok',
      tableCount: tables.length
    };

    // Real data stats
    const [users, tenants, subscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.tenantSubscription.count({ where: { status: 'active' } })
    ]);
    
    checks.checks.data = {
      status: 'ok',
      users,
      tenants,
      activeSubscriptions: subscriptions
    };

  } catch (error: any) {
    checks.status = 'critical';
    checks.error = error.message;
    return NextResponse.json(checks, { status: 503 });
  }

  checks.responseTime = Date.now() - startTime;
  return NextResponse.json(checks, { status: 200 });
}
