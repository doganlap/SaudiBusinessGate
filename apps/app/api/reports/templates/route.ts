// =================================================================
// API ROUTE: GET REPORT TEMPLATES
// =================================================================
// Endpoint: /api/reports/templates
// Returns available secure query templates
// =================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { secureQueryBuilderService } from '@/Services/Reports/secure-query-builder-service';

export async function GET() {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const templates = secureQueryBuilderService.getAvailableTemplates();
        return NextResponse.json(templates);
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}
