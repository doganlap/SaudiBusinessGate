/**
 * GRC Analytics & Reporting API Endpoints
 * Control effectiveness, compliance scores, and KPIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRCService } from '@/lib/services/grc.service';

const grcService = new GRCService();

// GET /api/grc/analytics - Get GRC analytics and KPIs
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

    const reportType = searchParams.get('type') || 'overview';

    let data;

    switch (reportType) {
      case 'overview':
        // Get comprehensive overview
        const [controlStatus, frameworkCompliance, kpis] = await Promise.all([
          grcService.getControlStatusSummary(tenantId),
          grcService.getFrameworkCompliance(tenantId),
          grcService.getControlKPIs(tenantId)
        ]);

        data = {
          control_status: controlStatus,
          framework_compliance: frameworkCompliance,
          kpis: kpis,
          summary: {
            total_controls: controlStatus.length,
            effective_controls: controlStatus.filter(c => c.control_effectiveness_score >= 80).length,
            critical_controls: controlStatus.filter(c => c.criticality === 'Critical').length,
            frameworks_count: frameworkCompliance.length,
            avg_compliance: frameworkCompliance.length > 0 
              ? Math.round(frameworkCompliance.reduce((sum, f) => sum + (f.compliance_percentage || 0), 0) / frameworkCompliance.length)
              : 0
          }
        };
        break;

      case 'control-status':
        data = await grcService.getControlStatusSummary(tenantId);
        break;

      case 'framework-compliance':
        data = await grcService.getFrameworkCompliance(tenantId);
        break;

      case 'kpis':
        data = await grcService.getControlKPIs(tenantId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type. Must be one of: overview, control-status, framework-compliance, kpis' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        report_type: reportType,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in GET /api/grc/analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch GRC analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
