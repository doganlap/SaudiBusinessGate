/**
 * Procurement Notifications API
 * Get and manage procurement notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementNotificationsService } from '@/lib/services/procurement-notifications.service';
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

    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const notifications = await procurementNotificationsService.getNotifications(
      tenantId,
      userId,
      {
        type: type || undefined,
        status: status || undefined,
        unreadOnly,
        limit,
        offset,
      }
    );

    return NextResponse.json({
      success: true,
      notifications,
      total: notifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
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

    const { action, notificationId } = await request.json();

    if (action === 'mark_read' && notificationId) {
      const userId = (session.user as any).id;
      await procurementNotificationsService.markAsRead(notificationId, userId);
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (action === 'mark_all_read') {
      const tenantId =
        request.headers.get('x-tenant-id') ||
        (session.user as any).tenantId ||
        'default-tenant';
      const userId = (session.user as any).id;
      await procurementNotificationsService.markAllAsRead(tenantId, userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling notification action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process action' },
      { status: 500 }
    );
  }
};

