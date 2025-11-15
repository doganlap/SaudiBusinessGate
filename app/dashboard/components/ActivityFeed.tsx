'use client';

/**
 * Activity Feed Component
 * Module: Dashboard
 * API: /api/dashboard/activity
 */

import { useState, useEffect } from 'react';

interface ActivityFeedProps {
    tenantId?: string;
}

export default function ActivityFeed({ tenantId }: ActivityFeedProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/activity')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [tenantId]);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 rounded h-32"></div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Feed
            </h3>
            <div className="text-gray-600">
                {data ? (
                    <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
}
