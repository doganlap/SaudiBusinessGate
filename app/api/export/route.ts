/**
 * Data Export API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dataExportImport } from '@/lib/services/data-export-import.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { module, data, format = 'excel', fields, includeHeaders = true } = body;

    if (!module || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Module and data array are required' },
        { status: 400 }
      );
    }

    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be csv, excel, or json' },
        { status: 400 }
      );
    }

    const result = await dataExportImport.export(module, data, {
      format: format as 'csv' | 'excel' | 'json',
      fields,
      includeHeaders,
    });

    // Return file data
    const response = new NextResponse(
      result.data instanceof Buffer ? result.data : Buffer.from(result.data),
      {
        status: 200,
        headers: {
          'Content-Type': result.contentType,
          'Content-Disposition': `attachment; filename="${result.filename}"`,
        },
      }
    );

    return response;
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 50 });

