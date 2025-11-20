/**
 * Procurement Export API
 * Export purchase orders, vendors, inventory to Excel, PDF, CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementExportImportService } from '@/lib/services/procurement-export-import.service';
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
    const entity = searchParams.get('entity'); // orders, vendors, inventory
    const format = searchParams.get('format') as 'excel' | 'pdf' | 'csv';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    if (!entity || !format) {
      return NextResponse.json(
        { error: 'Entity and format are required' },
        { status: 400 }
      );
    }

    if (!['orders', 'vendors', 'inventory'].includes(entity)) {
      return NextResponse.json(
        { error: 'Invalid entity. Must be orders, vendors, or inventory' },
        { status: 400 }
      );
    }

    if (!['excel', 'pdf', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be excel, pdf, or csv' },
        { status: 400 }
      );
    }

    let fileBuffer: Buffer;
    let filename: string;
    let contentType: string;

    const filters: any = {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status || undefined,
      category: category || undefined,
    };

    switch (entity) {
      case 'orders':
        fileBuffer = await procurementExportImportService.exportPurchaseOrders(
          tenantId,
          { format, filters }
        );
        filename = `purchase-orders-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        contentType =
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : format === 'pdf'
            ? 'application/pdf'
            : 'text/csv';
        break;

      case 'vendors':
        fileBuffer = await procurementExportImportService.exportVendors(
          tenantId,
          { format, filters }
        );
        filename = `vendors-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        contentType =
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : format === 'pdf'
            ? 'application/pdf'
            : 'text/csv';
        break;

      case 'inventory':
        fileBuffer = await procurementExportImportService.exportInventory(
          tenantId,
          { format, filters }
        );
        filename = `inventory-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        contentType =
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : format === 'pdf'
            ? 'application/pdf'
            : 'text/csv';
        break;

      default:
        return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 20 });

