/**
 * Procurement Document Download API
 * Download document files
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementDocumentsService } from '@/lib/services/procurement-documents.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId =
      request.headers.get('x-tenant-id') ||
      (session.user as any).tenantId ||
      'default-tenant';

    const documentId = params.id;

    const result = await procurementDocumentsService.downloadDocument(
      documentId,
      tenantId
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const { buffer, document } = result;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.originalFileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to download document' },
      { status: 500 }
    );
  }
}

