/**
 * Platform Statistics API Route
 * Returns platform-wide statistics for the control panel dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { PlatformService } from '@/lib/services/platform.service';
import { query } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Get tenant statistics
    const tenantStats = await PlatformService.getTenantStats();
    
    // Get user statistics across all tenants
    const userStatsResult = await query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 END) as admin_users
      FROM users
    `);
    
    const userStats = userStatsResult.rows[0] || {
      total_users: '0',
      active_users: '0',
      admin_users: '0'
    };
    
    // Get system health (simple check)
    const systemHealth = 'healthy'; // Can be enhanced with actual health checks
    
    // Get API status (simple check)
    const apiStatus = 'operational'; // Can be enhanced with actual API status checks
    
    // Get recent activity count (last 24 hours)
    const recentActivityResult = await query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    const recentActivity = parseInt(recentActivityResult.rows[0]?.count || '0');
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: parseInt(userStats.total_users) || 0,
        totalTenants: parseInt(tenantStats.total_tenants) || 0,
        activeTenants: parseInt(tenantStats.active_tenants) || 0,
        systemHealth,
        apiStatus,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch platform statistics',
        stats: {
          totalUsers: 0,
          totalTenants: 0,
          activeTenants: 0,
          systemHealth: 'unknown',
          apiStatus: 'unknown',
          recentActivity: 0
        }
      },
      { status: 500 }
    );
  }
}

