'use client';

// =================================================================
// COMPONENT: BUSINESS KPI DASHBOARD
// =================================================================
// A client-side component to display business KPIs fetched from the API.
// Enhanced with license-based filtering and feature access control.
// =================================================================

import { useState, useEffect } from 'react';
import { useLicensedDashboard } from '../../../hooks/useLicensedDashboard';

// --- Interfaces ---
interface Kpi {
    id?: string;
    name: string;
    value: number | string;
    trend: 'up' | 'down' | 'stable';
    requiredFeature?: string; // License feature required to view this KPI
    isPremium?: boolean;
    category?: string;
    description?: string;
}

interface BusinessKpiDashboardProps {
    tenantId?: string;
    userRole?: string;
}

export default function BusinessKpiDashboard({ 
    tenantId = 'default-tenant', 
    userRole = 'user' 
}: BusinessKpiDashboardProps) {
    const [allKpis, setAllKpis] = useState<Kpi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Use license-aware dashboard hook
    const {
        filterKPIsByLicense,
        hasFeature,
        getUpgradePrompt,
        license,
        loading: licenseLoading
    } = useLicensedDashboard(tenantId, userRole);

    useEffect(() => {
        async function fetchKpis() {
            try {
                const response = await fetch('/api/analytics/kpis/business');
                if (!response.ok) {
                    throw new Error('Failed to fetch KPIs.');
                }
                const data = await response.json();
                
                // Transform API data to match LicensedKPI interface
                const transformedKpis = data.map((kpi: any, index: number) => ({
                    id: kpi.id || `kpi-${index}`,
                    name: kpi.name,
                    value: kpi.value,
                    trend: (['up','down','stable'].includes(kpi.trend) ? kpi.trend : 'stable') as 'up'|'down'|'stable',
                    requiredFeature: kpi.requiredFeature || 'dashboard.business',
                    isPremium: kpi.isPremium || false,
                    category: kpi.category || 'business',
                    description: kpi.description || ''
                }));
                
                setAllKpis(transformedKpis);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchKpis();
    }, []);

    // Filter KPIs based on license - convert to LicensedKPI format
    const licensedKpis = allKpis.map(kpi => ({
        id: kpi.id || kpi.name,
        name: kpi.name,
        value: kpi.value,
        requiredFeature: kpi.requiredFeature || 'dashboard.business',
        isPremium: kpi.isPremium || false,
        category: kpi.category,
        description: kpi.description
    }));
    
    const availableKpis = filterKPIsByLicense(licensedKpis);
    const isLoading = loading || licenseLoading;

    if (isLoading) {
        return <div className="text-center p-8">Loading KPIs...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    // Show upgrade prompt if no KPIs available due to license
    if (availableKpis.length === 0 && allKpis.length > 0) {
        return (
            <div className="text-center p-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900">Upgrade Required</h3>
                    <p className="text-blue-700 mt-2">
                        Business KPIs require a Professional or higher license.
                    </p>
                    {getUpgradePrompt('dashboard.business') && (
                        <div className="mt-4">
                            <a
                                href={`/billing/upgrade?feature=dashboard.business&current=${license?.licenseCode}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Upgrade Now
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* License info banner */}
            {license && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            License: <span className="font-medium capitalize">{license.licenseCode}</span>
                        </span>
                        <span className="text-sm text-gray-600">
                            KPIs: {availableKpis.length} / {allKpis.length}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {availableKpis.map((licensedKpi) => {
                    // Find original KPI data for trend information
                    const originalKpi = allKpis.find(k => k.id === licensedKpi.id || k.name === licensedKpi.name);
                    const trend = originalKpi?.trend || 'stable';
                    
                    return (
                        <div key={licensedKpi.id} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-gray-500 text-sm font-medium">{licensedKpi.name}</h3>
                                    <p className="text-3xl font-semibold text-gray-900">{licensedKpi.value}</p>
                                    <p className={`text-sm font-medium ${
                                        trend === 'up' ? 'text-green-500' : 
                                        trend === 'down' ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} Trend is {trend}
                                    </p>
                                </div>
                                {licensedKpi.isPremium && hasFeature(licensedKpi.requiredFeature) && (
                                    <div className="ml-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Premium
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
