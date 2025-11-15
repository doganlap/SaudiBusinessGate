// =================================================================
// API ROUTE: GET ORGANIZATION THEME
// =================================================================
// Endpoint: /api/themes/[organizationId]
// =================================================================

import { NextRequest, NextResponse } from 'next/server';
import ThemeManagementService from '@/Services/WhiteLabel/theme-management-service';
import { redisCachingService } from '@/Services/Performance/redis-caching-service';

import dbPool from '@/db';

const themeManagementService = new ThemeManagementService(dbPool);

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    const { organizationId: orgIdStr } = await params;
    const organizationId = parseInt(orgIdStr, 10);

    if (isNaN(organizationId)) {
        return NextResponse.json({ error: 'Invalid organization ID.' }, { status: 400 });
    }

    const CACHE_KEY = `theme:org:${organizationId}`;

    try {
        // 1. Check cache first
        const cachedTheme = await redisCachingService.get(CACHE_KEY);
        if (cachedTheme) {
            console.log(`CACHE HIT: Returning cached theme for organization ${organizationId}.`);
            return NextResponse.json(cachedTheme);
        }

        // 2. If cache miss, fetch from the service
        console.log(`CACHE MISS: Fetching theme for organization ${organizationId} from service.`);
        const theme = await themeManagementService.getTheme(organizationId);

        if (!theme) {
            return NextResponse.json({ error: 'Theme not found.' }, { status: 404 });
        }

        // 3. Store the result in the cache
        await redisCachingService.set(CACHE_KEY, theme, CACHE_EXPIRATION_SECONDS);

        // 4. Return the fresh data
        return NextResponse.json(theme);

    } catch (error) {
        console.error(`Error fetching theme for organization ${organizationId}:`, error);
        return NextResponse.json(
            { error: 'An error occurred while fetching the theme.' },
            { status: 500 }
        );
    }
}
