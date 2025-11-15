// =================================================================
// PAGE: REPORT BUILDER (SECURED - ENHANCED)
// =================================================================
// Enterprise-grade report builder with step-by-step wizard,
// template selection, and live preview capabilities.
// =================================================================

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authorizationService } from '@/Services/Security/AuthorizationService';
import ReportBuilderForm from './components/ReportBuilderForm';

export default async function ReportBuilderPage() {
    const session = await getServerSession();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    const user = session.user as any;

    // Check if user has permission to create reports
    const hasPermission = await authorizationService.hasPermission(
        user.id,
        user.organizationId,
        'reports.create'
    );

    if (!hasPermission) {
        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to create reports.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Create Custom Report
                    </h1>
                    <p className="text-lg text-gray-600">
                        Build powerful reports with our secure, template-based builder
                    </p>
                </div>
                
                <ReportBuilderForm />
            </div>
        </main>
    );
}
