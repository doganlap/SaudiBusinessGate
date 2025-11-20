/**
 * Platform Audit Logs API Route
 * Returns audit logs for the platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    
    // Build query
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (category && category !== 'all') {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    params.push(limit);
    params.push(offset);
    
    // Fetch audit logs
    const result = await query(`
      SELECT
        id,
        user_id,
        COALESCE((SELECT name FROM users WHERE id = audit_logs.user_id), 'System') as user_name,
        action,
        resource,
        resource_id,
        status,
        category,
        ip_address,
        user_agent,
        details,
        created_at as timestamp
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
    
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      userName: row.user_name || 'System',
      action: row.action || 'Unknown',
      resource: row.resource || 'N/A',
      status: row.status || 'success',
      ipAddress: row.ip_address || undefined,
      details: row.details || undefined,
      category: row.category || 'system'
    }));
    
    return NextResponse.json({
      success: true,
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
        logs: []
      },
      { status: 500 }
    );
  }
}

