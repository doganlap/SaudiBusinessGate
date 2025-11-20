/**
 * Procurement Documents API
 * Upload, download, and manage document attachments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementDocumentsService } from '@/lib/services/procurement-documents.service';
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
    const entityType = searchParams.get('entityType') as 'purchase_order' | 'vendor' | 'inventory';
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const documents = await procurementDocumentsService.getDocuments(
      tenantId,
      entityType,
      entityId
    );

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch documents' },
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'File, entityType, and entityId are required' },
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

    // Validate entity type
    if (!['purchase_order', 'vendor', 'inventory'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be purchase_order, vendor, or inventory' },
        { status: 400 }
      );
    }

    const uploadedBy = (session.user as any).email || (session.user as any).id || 'system';

    const document = await procurementDocumentsService.uploadDocument(
      tenantId,
      entityType as 'purchase_order' | 'vendor' | 'inventory',
      entityId,
      file,
      file.name,
      file.type,
      uploadedBy,
      description || undefined,
      category || undefined
    );

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
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
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    await procurementDocumentsService.deleteDocument(documentId, tenantId);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
};

