/**
 * Procurement Recurring Orders API
 * Manage recurring purchase orders
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
    const status = searchParams.get('status');

    const recurringOrders = await procurementTemplatesService.getRecurringOrders(tenantId, {
      status: status || undefined,
    });

    return NextResponse.json({
      success: true,
      recurringOrders,
    });
  } catch (error: any) {
    console.error('Error fetching recurring orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch recurring orders' },
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

    const recurringOrder = await procurementTemplatesService.createRecurringOrder(tenantId, {
      ...body,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      recurringOrder,
      message: 'Recurring order created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating recurring order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create recurring order' },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
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
    const { action, recurringOrderId } = body;

    if (action === 'process') {
      const result = await procurementTemplatesService.processRecurringOrders(tenantId);
      return NextResponse.json({
        success: true,
        result,
        message: `Processed ${result.processed} recurring orders`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing recurring orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process recurring orders' },
      { status: 500 }
    );
  }
};

