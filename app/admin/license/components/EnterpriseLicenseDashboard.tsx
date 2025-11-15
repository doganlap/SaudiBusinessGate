'use client';

/**
 * ENTERPRISE LICENSE DASHBOARD
 * Real-time license usage monitoring with AI recommendations
 */

import { useState, useEffect } from 'react';
import { enterpriseAutonomyEngine } from '@/Services/License/EnterpriseAutonomyEngine';

interface UsageReport {
    period: string;
    license: {
        tier: string;
        status: string;
        expiresAt: string | null;
    };
    usage: {
        apiCalls: { current: number; limit: number; percentUsed: number };
        users: { current: number; limit: number; percentUsed: number };
        storage: { current: number; limit: number; percentUsed: number };
    };
    topEndpoints: Array<{ endpoint: string; calls: number }>;
    recommendations: {
        recommend: boolean;
        tier?: string;
        reason?: string;
    };
}

export default function EnterpriseLicenseDashboard({ tenantId }: { tenantId: string }) {
    const [report, setReport] = useState<UsageReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

    useEffect(() => {
        fetchReport();
    }, [period]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/license/usage-report?tenantId=${tenantId}&period=${period}`);
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error('Failed to fetch usage report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                Failed to load license information
            </div>
        );
    }

    const getStatusColor = (percentUsed: number) => {
        if (percentUsed >= 90) return 'text-danger bg-danger/10';
        if (percentUsed >= 75) return 'text-warning bg-warning/10';
        return 'text-success bg-success/10';
    };

    const getStatusText = (percentUsed: number) => {
        if (percentUsed >= 90) return 'Critical';
        if (percentUsed >= 75) return 'Warning';
        return 'Healthy';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-elevate p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">License Dashboard</h1>
                        <p className="mt-2 text-primary-100">
                            Current Tier: <span className="font-semibold uppercase">{report.license.tier}</span>
                        </p>
                        {report.license.expiresAt && (
                            <p className="mt-1 text-sm text-primary-200">
                                Expires: {new Date(report.license.expiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {['day', 'week', 'month'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    period === p
                                        ? 'bg-white text-primary-700 shadow-md'
                                        : 'bg-primary-500/20 text-white hover:bg-primary-500/30'
                                }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Recommendation Alert */}
            {report.recommendations.recommend && (
                <div className="bg-warning/10 border-2 border-warning rounded-xl p-6 flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-warning-900">Upgrade Recommended</h3>
                        <p className="mt-1 text-warning-800">{report.recommendations.reason}</p>
                        <p className="mt-2 text-sm text-warning-700">
                            Recommended tier: <span className="font-semibold uppercase">{report.recommendations.tier}</span>
                        </p>
                        <button className="mt-4 px-6 py-2 bg-warning text-white rounded-lg font-medium hover:bg-warning-600 transition-colors shadow-md">
                            View Upgrade Options
                        </button>
                    </div>
                </div>
            )}

            {/* Usage Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* API Calls */}
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">API Calls</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.usage.apiCalls.percentUsed)}`}>
                            {getStatusText(report.usage.apiCalls.percentUsed)}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-foreground">
                                {report.usage.apiCalls.current.toLocaleString()}
                            </span>
                            {report.usage.apiCalls.limit > 0 && (
                                <span className="text-lg text-muted-foreground">
                                    / {report.usage.apiCalls.limit.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-muted rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    report.usage.apiCalls.percentUsed >= 90
                                        ? 'bg-danger'
                                        : report.usage.apiCalls.percentUsed >= 75
                                        ? 'bg-warning'
                                        : 'bg-success'
                                }`}
                                style={{ width: `${Math.min(report.usage.apiCalls.percentUsed, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground text-right">
                            {report.usage.apiCalls.percentUsed.toFixed(1)}% used
                        </div>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Active Users</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.usage.users.percentUsed)}`}>
                            {getStatusText(report.usage.users.percentUsed)}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-foreground">
                                {report.usage.users.current}
                            </span>
                            {report.usage.users.limit > 0 && (
                                <span className="text-lg text-muted-foreground">
                                    / {report.usage.users.limit}
                                </span>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-muted rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    report.usage.users.percentUsed >= 90
                                        ? 'bg-danger'
                                        : report.usage.users.percentUsed >= 75
                                        ? 'bg-warning'
                                        : 'bg-success'
                                }`}
                                style={{ width: `${Math.min(report.usage.users.percentUsed, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground text-right">
                            {report.usage.users.percentUsed.toFixed(1)}% of limit
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Storage</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.usage.storage.percentUsed)}`}>
                            {getStatusText(report.usage.storage.percentUsed)}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-foreground">
                                {report.usage.storage.current.toFixed(1)}
                            </span>
                            <span className="text-lg text-muted-foreground">GB</span>
                            {report.usage.storage.limit > 0 && (
                                <span className="text-lg text-muted-foreground">
                                    / {report.usage.storage.limit} GB
                                </span>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-muted rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    report.usage.storage.percentUsed >= 90
                                        ? 'bg-danger'
                                        : report.usage.storage.percentUsed >= 75
                                        ? 'bg-warning'
                                        : 'bg-success'
                                }`}
                                style={{ width: `${Math.min(report.usage.storage.percentUsed, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground text-right">
                            {report.usage.storage.percentUsed.toFixed(1)}% used
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Endpoints */}
            <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top API Endpoints</h3>
                <div className="space-y-3">
                    {report.topEndpoints.slice(0, 10).map((endpoint, index) => {
                        const maxCalls = report.topEndpoints[0].calls;
                        const widthPercent = (endpoint.calls / maxCalls) * 100;
                        
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground truncate flex-1">
                                        {endpoint.endpoint}
                                    </span>
                                    <span className="text-muted-foreground ml-4">
                                        {endpoint.calls.toLocaleString()} calls
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-primary-600 transition-all duration-500"
                                        style={{ width: `${widthPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
