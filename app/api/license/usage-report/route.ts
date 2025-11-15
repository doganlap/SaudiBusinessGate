/**
 * License Usage Report API
 * Returns comprehensive usage analytics and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { enterpriseAutonomyEngine } from '@/Services/License/EnterpriseAutonomyEngine';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId') || (session.user as any)?.organizationId || 'default';
        const period = (searchParams.get('period') || 'day') as 'day' | 'week' | 'month';

        // Generate comprehensive usage report
        const report = await enterpriseAutonomyEngine.generateUsageReport(tenantId, period);

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error generating usage report:', error);
        return NextResponse.json(
            { error: 'Failed to generate usage report' },
            { status: 500 }
        );
    }
}
