/**
 * Procurement Stock Movement History API
 * Get stock movement history for inventory items
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementStockHistoryService } from '@/lib/services/procurement-stock-history.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const movementType = searchParams.get('movementType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let movements;

    if (itemId) {
      // Get history for specific item
      movements = await procurementStockHistoryService.getItemHistory(tenantId, itemId, {
        movementType: movementType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit,
        offset,
      });
    } else {
      // Get all movements
      movements = await procurementStockHistoryService.getAllMovements(tenantId, {
        itemId: itemId || undefined,
        movementType: movementType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      success: true,
      movements,
      total: movements.length,
    });
  } catch (error: any) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

