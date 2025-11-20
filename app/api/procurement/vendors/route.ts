/**
 * Vendors API
 * Enhanced with caching, rate limiting, and request queuing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { requestQueue } from '@/lib/services/request-queue.service';
import { withRateLimit, rateLimiter, getIdentifier } from '@/lib/middleware/rate-limit';

/**
 * GET /api/procurement/vendors
 * Get all vendors with optional filtering
 * Enhanced with caching and rate limiting
 */
export const GET = withRateLimit(async (request: NextRequest) => {
  return requestQueue.processRequest(
    request,
    async (req) => {
      try {
        // Authentication
        const session = await getServerSession();
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get tenant ID
        const tenantId =
          req.headers.get('x-tenant-id') ||
          (session.user as any).tenantId ||
          'default-tenant';

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const vendorType = searchParams.get('vendorType');
        const search = searchParams.get('search');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        // Build cache key
        const cacheKey = `${CACHE_PREFIXES.PROCUREMENT || 'proc:'}vendors:${tenantId}:${status || 'all'}:${category || 'all'}:${vendorType || 'all'}`;

        // Get or fetch with caching
        const { vendors, summary } = await multiLayerCache.getOrFetch(
          cacheKey,
          async () => {
            return await procurementService.getVendors(tenantId, {
              status: status || undefined,
              category: category || undefined,
              vendorType: vendorType || undefined,
              search: search || undefined,
              limit,
              offset,
            });
          },
          {
            ttl: CACHE_TTL.MEDIUM,
            module: 'procurement',
            staleWhileRevalidate: true,
          }
        );

        // Return HTTP response with cache headers
        const response = NextResponse.json({
          success: true,
          vendors,
          total: vendors.length,
          summary,
          source: 'database',
        });

        // Add cache headers
        multiLayerCache.addCacheHeaders(response, {
          maxAge: 300, // 5 minutes
          staleWhileRevalidate: 60,
        });

        return response;
      } catch (error: any) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to fetch vendors' },
          { status: 500 }
        );
      }
    },
    { windowMs: 60000, maxRequests: 100 }
  );
}, { windowMs: 60000, maxRequests: 100 });

/**
 * POST /api/procurement/vendors
 * Create new vendor
 * Enhanced with cache invalidation and rate limiting
 */
export async function POST(request: NextRequest) {
  // Manual rate limiting for POST requests
  const identifier = getIdentifier(request);
  const result = await rateLimiter.checkLimit(identifier, { windowMs: 60000, maxRequests: 50 });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.total.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    // Parse and validate request body
    const body = await request.json();

    // Create vendor using service
    const vendor = await procurementService.createVendor(tenantId, {
      name: body.name || body.vendor_name,
      nameAr: body.nameAr || body.vendor_name_ar,
      contactPerson: body.contactPerson || body.contact_person,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      country: body.country,
      category: body.category,
      vendorType: body.vendorType || body.vendor_type,
      status: body.status || 'pending',
      rating: body.rating || 0,
      paymentTerms: body.paymentTerms || body.payment_terms,
      notes: body.notes,
      taxId: body.taxId || body.tax_id,
      commercialRegistration: body.commercialRegistration || body.commercial_registration,
    });

    // Invalidate relevant caches
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}vendors:*`);
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}kpis:*`);

    const response = NextResponse.json(
      {
        success: true,
        vendor,
        message: 'Vendor created successfully',
      },
      { status: 201 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.total.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
