/**
 * Procurement Bulk Operations API
 * Bulk approve, delete, update, export
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { procurementService } from '@/lib/services/procurement.service';
import { procurementExportImportService } from '@/lib/services/procurement-export-import.service';
import { procurementNotificationsService } from '@/lib/services/procurement-notifications.service';
import { multiLayerCache } from '@/lib/services/multi-layer-cache.service';
import { withRateLimit, rateLimiter, getIdentifier } from '@/lib/middleware/rate-limit';

export const POST = async (request: NextRequest) => {
  const identifier = getIdentifier(request);
  const result = await rateLimiter.checkLimit(identifier, { windowMs: 60000, maxRequests: 20 });

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

    const body = await request.json();
    const { action, entity, ids, filters, options } = body;

    if (!action || !entity) {
      return NextResponse.json(
        { error: 'Action and entity are required' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id || (session.user as any).email || 'system';
    const results: any = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    switch (action) {
      case 'approve':
        if (entity === 'orders' && ids && Array.isArray(ids)) {
          for (const orderId of ids) {
            try {
              await procurementService.updatePurchaseOrder(tenantId, orderId, {
                status: 'approved',
                approvedBy: userId,
              });

              // Get order details for notification
              const order = await procurementService.getPurchaseOrder(tenantId, orderId);
              if (order.requestedBy) {
                await procurementNotificationsService.notifyOrderApproved(
                  tenantId,
                  orderId,
                  order.orderNumber || '',
                  userId,
                  order.requestedBy,
                  order.requestedBy
                );
              }

              results.success++;
            } catch (error: any) {
              results.failed++;
              results.errors.push(`Order ${orderId}: ${error.message}`);
            }
          }
        }
        break;

      case 'delete':
        if (ids && Array.isArray(ids)) {
          for (const id of ids) {
            try {
              if (entity === 'orders') {
                // Soft delete: set status to cancelled
                await procurementService.updatePurchaseOrder(tenantId, id, {
                  status: 'cancelled',
                });
              } else if (entity === 'vendors') {
                await procurementService.updateVendor(tenantId, id, {
                  status: 'inactive',
                });
              } else if (entity === 'inventory') {
                await procurementService.updateInventoryItem(tenantId, id, {
                  status: 'out-of-stock',
                  currentStock: 0,
                });
              }
              results.success++;
            } catch (error: any) {
              results.failed++;
              results.errors.push(`${entity} ${id}: ${error.message}`);
            }
          }
        }
        break;

      case 'update_status':
        if (ids && Array.isArray(ids) && options?.status) {
          for (const id of ids) {
            try {
              if (entity === 'orders') {
                await procurementService.updatePurchaseOrder(tenantId, id, {
                  status: options.status,
                });
              } else if (entity === 'vendors') {
                await procurementService.updateVendor(tenantId, id, {
                  status: options.status,
                });
              } else if (entity === 'inventory') {
                await procurementService.updateInventoryItem(tenantId, id, {
                  status: options.status,
                });
              }
              results.success++;
            } catch (error: any) {
              results.failed++;
              results.errors.push(`${entity} ${id}: ${error.message}`);
            }
          }
        }
        break;

      case 'export':
        if (filters && options?.format) {
          try {
            let fileBuffer: Buffer;

            if (entity === 'orders') {
              fileBuffer = await procurementExportImportService.exportPurchaseOrders(
                tenantId,
                { format: options.format, filters }
              );
            } else if (entity === 'vendors') {
              fileBuffer = await procurementExportImportService.exportVendors(
                tenantId,
                { format: options.format, filters }
              );
            } else if (entity === 'inventory') {
              fileBuffer = await procurementExportImportService.exportInventory(
                tenantId,
                { format: options.format, filters }
              );
            } else {
              throw new Error('Invalid entity for export');
            }

            const filename = `${entity}-bulk-export-${Date.now()}.${options.format === 'excel' ? 'xlsx' : options.format}`;
            const contentType =
              options.format === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : options.format === 'pdf'
                ? 'application/pdf'
                : 'text/csv';

            return new NextResponse(fileBuffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
              },
            });
          } catch (error: any) {
            return NextResponse.json(
              { success: false, error: error.message || 'Failed to export' },
              { status: 500 }
            );
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be approve, delete, update_status, or export' },
          { status: 400 }
        );
    }

    // Invalidate caches after bulk operations
    if (action !== 'export') {
      await multiLayerCache.invalidatePattern('proc:*');
    }

    const response = NextResponse.json({
      success: true,
      results,
      message: `Bulk ${action} completed: ${results.success} successful, ${results.failed} failed`,
    });

    response.headers.set('X-RateLimit-Limit', result.total.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());

    return response;
  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
};

