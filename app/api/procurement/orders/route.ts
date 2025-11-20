/**
 * Purchase Orders API
 * Enhanced with caching, rate limiting, and request queuing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { requestQueue } from '@/lib/services/request-queue.service';
import { withRateLimit, rateLimiter, getIdentifier } from '@/lib/middleware/rate-limit';

/**
 * GET /api/procurement/orders
 * Get all purchase orders with optional filtering
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
        const vendorId = searchParams.get('vendorId');
        const category = searchParams.get('category');
        const priority = searchParams.get('priority');
        const requestedBy = searchParams.get('requestedBy');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        // Build cache key
        const cacheKey = `${CACHE_PREFIXES.PROCUREMENT || 'proc:'}orders:${tenantId}:${status || 'all'}:${vendorId || 'all'}:${category || 'all'}`;

        // Get or fetch with caching
        const { orders, summary } = await multiLayerCache.getOrFetch(
          cacheKey,
          async () => {
            return await procurementService.getPurchaseOrders(tenantId, {
              status: status || undefined,
              vendorId: vendorId || undefined,
              category: category || undefined,
              priority: priority || undefined,
              requestedBy: requestedBy || undefined,
              dateFrom: dateFrom || undefined,
              dateTo: dateTo || undefined,
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
          orders,
          total: orders.length,
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
        console.error('Error fetching purchase orders:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to fetch purchase orders' },
          { status: 500 }
        );
      }
    },
    { windowMs: 60000, maxRequests: 100 }
  );
}, { windowMs: 60000, maxRequests: 100 });

/**
 * POST /api/procurement/orders
 * Create new purchase order
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

    // Create purchase order using service
    const order = await procurementService.createPurchaseOrder(tenantId, {
      vendorId: body.vendor_id || body.vendorId,
      vendorName: body.vendor_name || body.vendorName,
      description: body.description,
      totalAmount: body.total_amount || body.totalAmount,
      status: body.status || 'draft',
      priority: body.priority || 'medium',
      requestedBy: body.requested_by || body.requestedBy || (session.user as any).email || 'system',
      approvedBy: body.approved_by || body.approvedBy,
      orderDate: body.order_date || body.orderDate,
      expectedDelivery: body.expected_delivery_date || body.expectedDelivery,
      category: body.category,
      currency: body.currency || 'SAR',
      paymentTerms: body.payment_terms || body.paymentTerms,
      notes: body.notes,
      items: body.items || [],
    });

    // Invalidate relevant caches
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}orders:*`);
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}kpis:*`);

    const response = NextResponse.json(
      {
        success: true,
        order,
        message: 'Purchase order created successfully',
      },
      { status: 201 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.total.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
