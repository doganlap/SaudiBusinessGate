// =================================================================
// API ROUTE: SALES FORECAST (SECURED)
// =================================================================
// Endpoint: /api/analytics/forecast/sales
// =================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { aiAnalyticsEngine } from '@/app/api/analytics/services/ai-analytics-mock';
import { authorizationService } from '@/app/api/analytics/services/authorization-mock';
import { redisCachingService } from '@/app/api/analytics/services/redis-caching-mock';

export async function GET(request: Request) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Authorization Check
    const hasPermission = await authorizationService.hasPermission(
        user.id,
        user.organizationId,
        'module.ai_analytics'
    );

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const periods = parseInt(searchParams.get('periods') || '6', 10);

        const cacheKey = `forecast:sales:${user.organizationId}:${periods}`;
        
        // Check cache
        const cachedForecast = await redisCachingService.get(cacheKey);
        if (cachedForecast) {
            console.log('CACHE HIT: Returning cached sales forecast.');
            return NextResponse.json(cachedForecast);
        }

        // Generate forecast
        console.log('CACHE MISS: Generating sales forecast...');
        const result = await aiAnalyticsEngine.getSalesForecast(user.organizationId, periods);

        // Cache for 1 hour
        await redisCachingService.set(cacheKey, result, 3600);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error generating sales forecast:', error);
        return NextResponse.json(
            { error: 'An error occurred while generating the forecast.' },
            { status: 500 }
        );
    }
}
