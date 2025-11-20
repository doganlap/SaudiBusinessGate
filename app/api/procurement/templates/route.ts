/**
 * Procurement Templates API
 * Manage purchase order templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementTemplatesService } from '@/lib/services/procurement-templates.service';
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
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendorId');

    const templates = await procurementTemplatesService.getTemplates(tenantId, {
      category: category || undefined,
      vendorId: vendorId || undefined,
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch templates' },
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
    const createdBy = (session.user as any).email || (session.user as any).id || 'system';

    const template = await procurementTemplatesService.createTemplate(tenantId, {
      ...body,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
};

