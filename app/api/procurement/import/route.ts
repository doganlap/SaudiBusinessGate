/**
 * Procurement Import API
 * Bulk import vendors and inventory from Excel/CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementExportImportService } from '@/lib/services/procurement-export-import.service';
import { withRateLimit, rateLimiter, getIdentifier } from '@/lib/middleware/rate-limit';

export const POST = async (request: NextRequest) => {
  const identifier = getIdentifier(request);
  const result = await rateLimiter.checkLimit(identifier, { windowMs: 60000, maxRequests: 10 });

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
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entity = formData.get('entity') as string; // vendors, inventory
    const format = formData.get('format') as 'excel' | 'csv';

    if (!file || !entity || !format) {
      return NextResponse.json(
        { error: 'File, entity, and format are required' },
        { status: 400 }
      );
    }

    if (!['vendors', 'inventory'].includes(entity)) {
      return NextResponse.json(
        { error: 'Invalid entity. Must be vendors or inventory' },
        { status: 400 }
      );
    }

    if (!['excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be excel or csv' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let importResult: { success: number; errors: string[] };

    if (entity === 'vendors') {
      importResult = await procurementExportImportService.importVendors(
        tenantId,
        fileBuffer,
        format
      );
    } else if (entity === 'inventory') {
      importResult = await procurementExportImportService.importInventory(
        tenantId,
        fileBuffer,
        format
      );
    } else {
      return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      result: {
        imported: importResult.success,
        failed: importResult.errors.length,
        errors: importResult.errors.slice(0, 10), // Limit errors shown
        totalErrors: importResult.errors.length,
      },
      message: `Successfully imported ${importResult.success} ${entity}`,
    });

    response.headers.set('X-RateLimit-Limit', result.total.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());

    return response;
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import data' },
      { status: 500 }
    );
  }
};

