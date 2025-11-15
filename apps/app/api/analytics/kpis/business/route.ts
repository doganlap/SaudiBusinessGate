// =================================================================
// API ROUTE: GET BUSINESS KPIS (SECURED WITH AUTHORIZATION)
// =================================================================
// Endpoint: /api/analytics/kpis/business
// This endpoint is now secured and requires an active session and
// the 'reports.view' permission.
// =================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import RealTimeAnalyticsEngine from '@/Services/AI/apps/services/real-time-analytics-dashboard';
import { redisCachingService } from '@/Services/Performance/redis-caching-service';
import { authorizationService } from '@/Services/Security/AuthorizationService';

const realTimeAnalyticsDashboard = new RealTimeAnalyticsEngine();

const CACHE_KEY = 'kpis:business';
const CACHE_EXPIRATION_SECONDS = 300; // 5 minutes

export async function GET() {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authorization Check
    const user = session.user as any;
    const hasPermission = await authorizationService.hasPermission(user.id, user.organizationId, 'reports.view');

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 1. Check cache first
        const cachedKpis = await redisCachingService.get(CACHE_KEY);
        if (cachedKpis) {
            console.log('CACHE HIT: Returning cached business KPIs.');
            return NextResponse.json(cachedKpis);
        }

        // 2. If cache miss, fetch from the service
        console.log('CACHE MISS: Fetching business KPIs from service.');
        const kpis = await realTimeAnalyticsDashboard.getBusinessKpis();

        // 3. Store the result in the cache for future requests
        await redisCachingService.set(CACHE_KEY, kpis, CACHE_EXPIRATION_SECONDS);

        // 4. Return the fresh data
        return NextResponse.json(kpis);

    } catch (error) {
        console.error('Error fetching business KPIs:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching business KPIs.' },
            { status: 500 }
        );
    }
}
