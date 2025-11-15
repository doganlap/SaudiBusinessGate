// =================================================================
// PAGE: MAIN DASHBOARD (SECURED)
// =================================================================
// This page serves as the main entry point for the user dashboard,
// composing various components like the KPI dashboard.
// It is now secured and requires authentication to access.
// =================================================================

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import BusinessKpiDashboard from './components/BusinessKpiDashboard';

export default async function DashboardPage() {
    const session = await getServerSession();

    // If no session exists, redirect the user to the sign-in page.
    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <main className="flex-1 bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Enterprise Dashboard
            </h1>

            {/* Section for Business KPIs */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Business Performance
                </h2>
                <BusinessKpiDashboard />
            </section>

            {/* Other sections can be added here */}
            {/* 
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Sales Analytics
                </h2>
                // Sales components would go here
            </section>
            */}
        </main>
    );
}
