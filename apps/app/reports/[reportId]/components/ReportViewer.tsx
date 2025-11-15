'use client';

// =================================================================
// ENHANCED REPORT VIEWER COMPONENT
// =================================================================
// Enterprise-grade report viewer with auto-refresh and
// multiple visualization types.
// =================================================================

import { useState, useEffect } from 'react';

interface ReportViewerProps {
    reportId: number;
    config: any;
}

export default function ReportViewer({ reportId, config }: ReportViewerProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        executeReport();

        // Set up auto-refresh if configured
        if (config?.refreshInterval && autoRefresh) {
            const interval = setInterval(() => {
                executeReport();
            }, config.refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [reportId, autoRefresh]);

    const executeReport = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/reports/${reportId}/execute`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to execute report');
            }

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {data.columns?.map((col: string) => (
                                <th
                                    key={col}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.data?.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                {data.columns?.map((col: string) => (
                                    <td
                                        key={col}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    Showing {data.rowCount} rows • Executed in {data.executionTime}ms
                </p>
            </div>
        </div>
    );

    const renderBarChart = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Bar Chart Visualization</h3>
            <div className="space-y-2">
                {data.data?.slice(0, 10).map((row: any, idx: number) => {
                    const firstCol = data.columns[0];
                    const secondCol = data.columns[1];
                    const value = parseFloat(row[secondCol]) || 0;
                    const maxValue = Math.max(...data.data.map((r: any) => parseFloat(r[secondCol]) || 0));
                    const width = (value / maxValue) * 100;

                    return (
                        <div key={idx} className="flex items-center space-x-4">
                            <div className="w-32 text-sm font-medium text-gray-700 truncate">
                                {row[firstCol]}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                                <div
                                    className="bg-blue-600 h-8 rounded-full flex items-center justify-end px-3"
                                    style={{ width: `${width}%` }}
                                >
                                    <span className="text-white text-sm font-medium">
                                        {value.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderVisualization = () => {
        const vizType = config?.type || 'table';

        switch (vizType) {
            case 'bar':
                return renderBarChart();
            case 'table':
            default:
                return renderTable();
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Executing report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                    onClick={executeReport}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={executeReport}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh</span>
                            </>
                        )}
                    </button>

                    {config?.refreshInterval && (
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Auto-refresh every {config.refreshInterval}s
                            </span>
                        </label>
                    )}
                </div>

                <button
                    onClick={() => {
                        const csv = [
                            data.columns.join(','),
                            ...data.data.map((row: any) => data.columns.map((col: string) => row[col]).join(','))
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `report-${reportId}.csv`;
                        a.click();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export CSV</span>
                </button>
            </div>

            {data && renderVisualization()}
        </div>
    );
}
