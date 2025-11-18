// =================================================================
// API ROUTE: PREVIEW REPORT
// =================================================================
// Endpoint: /api/reports/preview
// Generates a preview of a report without saving it
// =================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authorizationService } from '@/Services/Security/AuthorizationService';
import { secureQueryBuilderService } from '@/Services/Reports/secure-query-builder-service';

export async function POST(request: Request) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    // Authorization Check
    const hasPermission = await authorizationService.hasPermission(
        user.id,
        user.organizationId,
        'reports.create'
    );

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { templateId, parameters } = body;

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        // Execute the template with parameters
        const result = await secureQueryBuilderService.executeTemplate(
            templateId,
            {
                organization_id: user.organizationId,
                ...parameters
            }
        );

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error('Error generating preview:', error);
        return NextResponse.json(
            { error: 'Failed to generate preview', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
