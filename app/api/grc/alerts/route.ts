/**
 * GRC CCM Alerts API Endpoints
 * Continuous Control Monitoring alerts management
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/alerts - List CCM alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const controlId = searchParams.get('control_id') || undefined;
    const status = searchParams.get('status') || undefined;
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['open', 'acknowledged', 'resolved', 'false_positive'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
          { status: 400 }
        );
      }
    }

    const alerts = await grcService.getCCMAlerts(tenantId, controlId, status);

    // Group alerts by severity for summary
    const alertSummary = {
      critical: alerts.filter(a => a.alert_type === 'critical').length,
      warning: alerts.filter(a => a.alert_type === 'warning').length,
      info: alerts.filter(a => a.alert_type === 'info').length,
      open: alerts.filter(a => a.status === 'open').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };

    return NextResponse.json({
      success: true,
      data: alerts,
      meta: {
        total: alerts.length,
        control_id: controlId,
        status: status,
        summary: alertSummary
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/alerts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch CCM alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
