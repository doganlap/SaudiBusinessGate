/**
 * AUTONOMOUS LICENSE MIDDLEWARE
 * Automatically enforces licensing across all API endpoints
 *
 * Features:
 * - Automatic license validation
 * - Rate limiting
 * - Usage tracking
 * - Real-time upgrade recommendations
 * - Graceful degradation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { enterpriseAutonomyEngine } from '@/Services/License/EnterpriseAutonomyEngine';

export async function licenseMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // DEVELOPMENT BYPASS: Allow all routes in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 DEVELOPMENT MODE: License middleware bypassed for', pathname);
        return NextResponse.next({
            headers: {
                'X-License-Dev-Mode': 'true',
                'X-License-Tier': 'development',
                'X-License-Valid': 'true',
            },
        });
    }

    // Skip middleware for public routes
    const publicRoutes = [
        '/api/auth',
        '/api/billing/plans',
        '/api/health',
        '/_next',
        '/static',
    ];

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    try {
        // Get session
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
                { status: 401 }
            );
        }

        const tenantId = session.user.organizationId || 'default';
        const userId = session.user.id;

        // Validate license for this API endpoint
        const licenseCheck = await enterpriseAutonomyEngine.validateLicenseForAPI(
            tenantId,
            pathname,
            userId
        );

        if (!licenseCheck.allowed) {
            // Return detailed error with upgrade information
            return NextResponse.json(
                {
                    error: 'License Restriction',
                    code: 'LICENSE_REQUIRED',
                    message: licenseCheck.reason,
                    details: {
                        currentTier: licenseCheck.license?.license_code,
                        upgradeRequired: licenseCheck.upgradeRequired,
                        recommendedTier: licenseCheck.recommendedTier,
                        usageStats: licenseCheck.usageStats,
                        upgradeUrl: `/billing/upgrade?feature=${pathname}&current=${licenseCheck.license?.license_code}`,
                    },
                },
                {
                    status: 403,
                    headers: {
                        'X-License-Tier': licenseCheck.license?.license_code || 'none',
                        'X-Upgrade-Required': licenseCheck.upgradeRequired ? 'true' : 'false',
                        'X-Recommended-Tier': licenseCheck.recommendedTier || '',
                    }
                }
            );
        }

        // Add license context to request headers
        const response = NextResponse.next();
        response.headers.set('X-License-Tier', licenseCheck.license.license_code);
        response.headers.set('X-License-Valid', 'true');

        if (licenseCheck.usageStats) {
            response.headers.set(
                'X-Usage-Percent',
                licenseCheck.usageStats.percentUsed.toFixed(2)
            );
        }

        if (licenseCheck.recommendedTier) {
            response.headers.set('X-Recommended-Upgrade', licenseCheck.recommendedTier);
        }

        return response;
    } catch (error) {
        console.error('License middleware error:', error);

        // In case of error, allow request but log it
        return NextResponse.next({
            headers: {
                'X-License-Check-Error': 'true',
            },
        });
    }
}

/**
 * React Hook for License-Aware Components
 */
export function useLicenseEnforcement(apiEndpoint: string) {
    const [licenseStatus, setLicenseStatus] = React.useState<{
        allowed: boolean;
        loading: boolean;
        error: string | null;
        upgradeRequired: boolean;
        recommendedTier: string | null;
        usageStats: any;
    }>({
        allowed: true,
        loading: true,
        error: null,
        upgradeRequired: false,
        recommendedTier: null,
        usageStats: null,
    });

    React.useEffect(() => {
        // Check license status when component mounts
        checkLicense();
    }, [apiEndpoint]);

    const checkLicense = async () => {
        try {
            // This would be called from the client side
            // The actual check happens in the middleware
            // This hook just provides UI state management
            setLicenseStatus((prev) => ({ ...prev, loading: false }));
        } catch (error) {
            setLicenseStatus({
                allowed: false,
                loading: false,
                error: 'Failed to check license',
                upgradeRequired: true,
                recommendedTier: null,
                usageStats: null,
            });
        }
    };

    return licenseStatus;
}
