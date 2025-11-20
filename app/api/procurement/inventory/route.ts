/**
 * Inventory API
 * Enhanced with caching, rate limiting, and request queuing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { requestQueue } from '@/lib/services/request-queue.service';
import { withRateLimit, rateLimiter, getIdentifier } from '@/lib/middleware/rate-limit';

/**
 * GET /api/procurement/inventory
 * Get all inventory items with optional filtering
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
        const subcategory = searchParams.get('subcategory');
        const vendorId = searchParams.get('vendorId');
        const lowStock = searchParams.get('lowStock') === 'true';
        const search = searchParams.get('search');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        // Build cache key
        const cacheKey = `${CACHE_PREFIXES.PROCUREMENT || 'proc:'}inventory:${tenantId}:${status || 'all'}:${category || 'all'}:${lowStock}`;

        // Get or fetch with caching
        const { inventory, summary } = await multiLayerCache.getOrFetch(
          cacheKey,
          async () => {
            return await procurementService.getInventory(tenantId, {
              status: status || undefined,
              category: category || undefined,
              subcategory: subcategory || undefined,
              vendorId: vendorId || undefined,
              lowStock: lowStock || undefined,
              search: search || undefined,
              limit,
              offset,
            });
          },
          {
            ttl: CACHE_TTL.SHORT, // Shorter cache for inventory (changes frequently)
            module: 'procurement',
            staleWhileRevalidate: true,
          }
        );

        // Return HTTP response with cache headers
        const response = NextResponse.json({
          success: true,
          inventory,
          total: inventory.length,
          summary,
          source: 'database',
        });

        // Add cache headers
        multiLayerCache.addCacheHeaders(response, {
          maxAge: 180, // 3 minutes (shorter for inventory)
          staleWhileRevalidate: 60,
        });

        return response;
      } catch (error: any) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to fetch inventory' },
          { status: 500 }
        );
      }
    },
    { windowMs: 60000, maxRequests: 100 }
  );
}, { windowMs: 60000, maxRequests: 100 });

/**
 * POST /api/procurement/inventory
 * Create new inventory item
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

    // Create inventory item using service
    const item = await procurementService.createInventoryItem(tenantId, {
      name: body.name || body.item_name,
      nameAr: body.nameAr || body.item_name_ar,
      category: body.category,
      subcategory: body.subcategory,
      description: body.description,
      sku: body.sku,
      barcode: body.barcode,
      currentStock: body.currentStock || body.current_stock || 0,
      minStock: body.minStock || body.min_stock_level || 0,
      maxStock: body.maxStock || body.max_stock_level || 1000,
      reorderPoint: body.reorderPoint || body.reorder_point,
      unitPrice: body.unitPrice || body.unit_cost || 0,
      location: body.location,
      vendorId: body.vendorId || body.vendor_id,
      unitOfMeasure: body.unitOfMeasure || body.unit_of_measure || 'unit',
      currency: body.currency || 'SAR',
      status: body.status,
    });

    // Invalidate relevant caches
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}inventory:*`);
    await multiLayerCache.invalidatePattern(`${CACHE_PREFIXES.PROCUREMENT || 'proc:'}kpis:*`);

    const response = NextResponse.json(
      {
        success: true,
        item,
        message: 'Inventory item created successfully',
      },
      { status: 201 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.total.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
