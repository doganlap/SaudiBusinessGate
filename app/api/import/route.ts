/**
 * Data Import API
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const module = formData.get('module') as string;
    const format = formData.get('format') as string || 'excel';
    const validate = formData.get('validate') === 'true';
    const skipErrors = formData.get('skipErrors') === 'true';

    if (!file || !module) {
      return NextResponse.json(
        { error: 'File and module are required' },
        { status: 400 }
      );
    }

    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be csv, excel, or json' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await dataExportImport.import(module, buffer, {
      format: format as 'csv' | 'excel' | 'json',
      validate,
      skipErrors,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 20 });

