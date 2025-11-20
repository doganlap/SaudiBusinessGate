/**
 * Procurement KPIs API
 * Real-time Key Performance Indicators for procurement module
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { multiLayerCache, CACHE_TTL, CACHE_PREFIXES } from '@/lib/services/multi-layer-cache.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build cache key
    const cacheKey = `${CACHE_PREFIXES.KPI}procurement:${tenantId}:${dateFrom || 'all'}:${dateTo || 'all'}`;

    // Get or fetch KPIs with caching
    const kpis = await multiLayerCache.getOrFetch(
      cacheKey,
      async () => {
        const data = await procurementService.getProcurementKPIs(tenantId, {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        // Format KPIs for frontend
        return [
          {
            id: 'total_orders',
            name: 'Total Orders',
            value: data.total_orders || 0,
            unit: 'orders',
            trend: 'up',
            change: 0,
            description: 'Total purchase orders',
          },
          {
            id: 'pending_orders',
            name: 'Pending Orders',
            value: data.pending_orders || 0,
            unit: 'orders',
            trend: 'stable',
            change: 0,
            description: 'Orders awaiting approval',
          },
          {
            id: 'total_spend',
            name: 'Total Spend',
            value: parseFloat(data.total_spend || '0'),
            unit: 'SAR',
            trend: 'up',
            change: 0,
            description: 'Total procurement spending',
          },
          {
            id: 'average_order_value',
            name: 'Average Order Value',
            value: parseFloat(data.average_order_value || '0'),
            unit: 'SAR',
            trend: 'up',
            change: 0,
            description: 'Average value per order',
          },
          {
            id: 'active_vendors',
            name: 'Active Vendors',
            value: data.active_vendors || 0,
            unit: 'vendors',
            trend: 'up',
            change: 0,
            description: 'Active vendor relationships',
          },
          {
            id: 'average_vendor_rating',
            name: 'Average Vendor Rating',
            value: parseFloat(data.average_vendor_rating || '0'),
            unit: '/5.0',
            trend: 'up',
            change: 0,
            description: 'Average vendor performance rating',
          },
          {
            id: 'total_items',
            name: 'Total Inventory Items',
            value: data.total_items || 0,
            unit: 'items',
            trend: 'up',
            change: 0,
            description: 'Total items in inventory',
          },
          {
            id: 'low_stock_items',
            name: 'Low Stock Items',
            value: data.low_stock_items || 0,
            unit: 'items',
            trend: 'down',
            change: 0,
            description: 'Items below minimum stock level',
          },
          {
            id: 'out_of_stock_items',
            name: 'Out of Stock Items',
            value: data.out_of_stock_items || 0,
            unit: 'items',
            trend: 'down',
            change: 0,
            description: 'Items with zero stock',
          },
          {
            id: 'total_inventory_value',
            name: 'Total Inventory Value',
            value: parseFloat(data.total_inventory_value || '0'),
            unit: 'SAR',
            trend: 'up',
            change: 0,
            description: 'Total value of inventory',
          },
          {
            id: 'average_delivery_days',
            name: 'Average Delivery Days',
            value: parseFloat(data.average_delivery_days || '0'),
            unit: 'days',
            trend: 'down',
            change: 0,
            description: 'Average delivery time',
          },
        ];
      },
      {
        ttl: CACHE_TTL.SHORT, // Short TTL for real-time KPIs
        module: 'procurement',
        staleWhileRevalidate: true,
      }
    );

    const response = NextResponse.json({
      success: true,
      kpis,
      module: 'procurement',
    });

    // Add cache headers
    multiLayerCache.addCacheHeaders(response, {
      maxAge: 60, // 1 minute for KPIs
      staleWhileRevalidate: 30,
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching procurement KPIs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch procurement KPIs' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

