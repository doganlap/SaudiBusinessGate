// =================================================================
// API ROUTE: EXECUTE REPORT (SECURED WITH SAFE QUERY BUILDER)
// =================================================================
// Endpoint: /api/reports/[reportId]/execute
// This endpoint now uses a secure query builder instead of raw SQL.
// =================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authorizationService } from '@/Services/Security/AuthorizationService';
import { secureQueryBuilderService } from '@/Services/Reports/secure-query-builder-service';
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function POST(
    request: Request,
    { params }: { params: { reportId: string } }
) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const reportId = parseInt(params.reportId, 10);

    if (isNaN(reportId)) {
        return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
    }

    // Authorization Check
    const hasPermission = await authorizationService.hasPermission(
        user.id,
        user.organizationId,
        'reports.view'
    );

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch report definition
        const reportResult = await pool.query(
            'SELECT * FROM custom_reports WHERE id = $1 AND organization_id = $2',
            [reportId, user.organizationId]
        );

        if (reportResult.rows.length === 0) {
            return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
        }

        const report = reportResult.rows[0];
        const queryDefinition = report.query_definition;

        // Log execution start
        const executionResult = await pool.query(
            'INSERT INTO report_executions (report_id, organization_id, executed_by, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
            [reportId, user.organizationId, user.id, 'running']
        );
        const executionId = executionResult.rows[0].id;

        let result;
        const startTime = Date.now();

        try {
            // Execute using secure query builder
            if (queryDefinition.templateId) {
                // Use predefined template
                result = await secureQueryBuilderService.executeTemplate(
                    queryDefinition.templateId,
                    {
                        organization_id: user.organizationId,
                        ...queryDefinition.parameters
                    }
                );
            } else if (queryDefinition.customQuery) {
                // Use safe custom query builder
                result = await secureQueryBuilderService.buildAndExecuteQuery(
                    user.organizationId,
                    queryDefinition.customQuery
                );
            } else {
                throw new Error('Invalid query definition');
            }

            const executionTime = Date.now() - startTime;

            // Log successful execution
            await pool.query(
                'UPDATE report_executions SET status = $1, execution_time_ms = $2, row_count = $3 WHERE id = $4',
                ['completed', executionTime, result.rowCount, executionId]
            );

            return NextResponse.json({
                success: true,
                data: result.rows,
                columns: result.columns,
                rowCount: result.rowCount,
                executionTime: result.executionTime
            });

        } catch (error: any) {
            // Log failed execution
            await pool.query(
                'UPDATE report_executions SET status = $1, error_message = $2 WHERE id = $3',
                ['failed', error.message, executionId]
            );

            throw error;
        }

    } catch (error: any) {
        console.error('Error executing report:', error);
        return NextResponse.json(
            { error: 'An error occurred while executing the report.', details: error.message },
            { status: 500 }
        );
    }
}
