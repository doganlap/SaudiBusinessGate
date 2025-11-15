// =================================================================
// PAGE: REPORT VIEWER (SECURED - ENHANCED)
// =================================================================
// Enterprise-grade report viewer with real-time data and
// multiple visualization options.
// =================================================================

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authorizationService } from '@/Services/Security/AuthorizationService';
import ReportViewer from './components/ReportViewer';
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'production',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

export default async function ReportViewerPage({ params }: { params: { reportId: string } }) {
    const session = await getServerSession();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    const user = session.user as any;
    const reportId = parseInt(params.reportId, 10);

    // Check if user has permission to view reports
    const hasPermission = await authorizationService.hasPermission(
        user.id,
        user.organizationId,
        'reports.view'
    );

    if (!hasPermission) {
        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to view reports.</p>
                </div>
            </main>
        );
    }

    // Fetch report metadata
    const reportResult = await pool.query(
        'SELECT * FROM custom_reports WHERE id = $1 AND organization_id = $2',
        [reportId, user.organizationId]
    );

    if (reportResult.rows.length === 0) {
        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
                    <p className="text-gray-600">The requested report does not exist or you don't have access to it.</p>
                </div>
            </main>
        );
    }

    const report = reportResult.rows[0];

    return (
        <main className="flex-1 bg-gray-50 min-h-screen">
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {report.report_name}
                            </h1>
                            {report.report_type && (
                                <p className="text-gray-600">{report.report_type}</p>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.href = '/reports/builder'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create New Report
                        </button>
                    </div>
                </div>
                
                <ReportViewer reportId={reportId} config={report.visualization_config} />
            </div>
        </main>
    );
}
