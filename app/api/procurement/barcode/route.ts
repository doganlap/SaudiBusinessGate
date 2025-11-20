/**
 * Procurement Barcode API
 * Generate and scan barcodes for inventory items
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementBarcodeService } from '@/lib/services/procurement-barcode.service';
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
    const action = searchParams.get('action');
    const itemId = searchParams.get('itemId');
    const barcode = searchParams.get('barcode');

    if (action === 'generate' && itemId) {
      const result = await procurementBarcodeService.generateBarcode(tenantId, itemId);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (action === 'scan' && barcode) {
      const result = await procurementBarcodeService.scanBarcode(barcode, tenantId);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        item: result,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling barcode request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process barcode request' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 100 });

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const body = await request.json();
    const { action, itemIds } = body;

    if (action === 'generate_bulk' && itemIds && Array.isArray(itemIds)) {
      const results = await procurementBarcodeService.generateBulkBarcodes(tenantId, itemIds);
      return NextResponse.json({
        success: true,
        results,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing bulk barcode request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process bulk barcode request' },
      { status: 500 }
    );
  }
};

