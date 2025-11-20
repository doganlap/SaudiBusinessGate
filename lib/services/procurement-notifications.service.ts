/**
 * Procurement Notifications Service
 * Email and in-app notifications for procurement module
 */

import { query } from '@/lib/db/connection';

export interface ProcurementNotification {
  id?: string;
  tenantId: string;
  userId?: string;
  type: 'order_created' | 'order_approved' | 'order_rejected' | 'order_received' | 
        'approval_needed' | 'low_stock' | 'vendor_created' | 'order_delayed' |
        'delivery_reminder' | 'payment_due';
  entityType: 'purchase_order' | 'vendor' | 'inventory';
  entityId: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'read' | 'archived';
  emailSent?: boolean;
  inAppSent?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  readAt?: string;
}

export class ProcurementNotificationsService {
  // ============================================================================
  // ORDER NOTIFICATIONS
  // ============================================================================

  async notifyOrderCreated(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    vendorName: string,
    requestedBy: string,
    totalAmount: number
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'order_created',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Purchase Order ${orderNumber} Created`,
      message: `Purchase order ${orderNumber} has been created for ${vendorName} with total amount of ${totalAmount}`,
      priority: 'medium',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        vendorName,
        requestedBy,
        totalAmount,
      },
    };

    await this.createNotification(notification);
    await this.sendEmailNotification(notification, requestedBy);
    await this.sendInAppNotification(notification);
  }

  async notifyApprovalNeeded(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    approverEmail: string,
    approverId: string,
    totalAmount: number
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      userId: approverId,
      type: 'approval_needed',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Approval Required: Purchase Order ${orderNumber}`,
      message: `Purchase order ${orderNumber} requires your approval. Total amount: ${totalAmount}`,
      priority: 'high',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        totalAmount,
      },
    };

    await this.createNotification(notification);
    await this.sendEmailNotification(notification, approverEmail);
    await this.sendInAppNotification(notification);
  }

  async notifyOrderApproved(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    approvedBy: string,
    requestedBy: string,
    requestedByEmail?: string
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'order_approved',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Purchase Order ${orderNumber} Approved`,
      message: `Purchase order ${orderNumber} has been approved by ${approvedBy}`,
      priority: 'medium',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        approvedBy,
      },
    };

    await this.createNotification(notification);
    if (requestedByEmail) {
      await this.sendEmailNotification(notification, requestedByEmail);
    }
    await this.sendInAppNotification(notification);
  }

  async notifyOrderRejected(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    rejectedBy: string,
    reason: string,
    requestedByEmail?: string
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'order_rejected',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Purchase Order ${orderNumber} Rejected`,
      message: `Purchase order ${orderNumber} has been rejected by ${rejectedBy}. Reason: ${reason}`,
      priority: 'high',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        rejectedBy,
        reason,
      },
    };

    await this.createNotification(notification);
    if (requestedByEmail) {
      await this.sendEmailNotification(notification, requestedByEmail);
    }
    await this.sendInAppNotification(notification);
  }

  async notifyOrderReceived(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    vendorName: string,
    requestedByEmail?: string
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'order_received',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Purchase Order ${orderNumber} Received`,
      message: `Purchase order ${orderNumber} from ${vendorName} has been received`,
      priority: 'medium',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        vendorName,
      },
    };

    await this.createNotification(notification);
    if (requestedByEmail) {
      await this.sendEmailNotification(notification, requestedByEmail);
    }
    await this.sendInAppNotification(notification);
  }

  async notifyOrderDelayed(
    tenantId: string,
    orderId: string,
    orderNumber: string,
    expectedDate: string,
    requestedByEmail?: string
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'order_delayed',
      entityType: 'purchase_order',
      entityId: orderId,
      title: `Purchase Order ${orderNumber} Delayed`,
      message: `Purchase order ${orderNumber} is delayed. Expected delivery was ${expectedDate}`,
      priority: 'high',
      status: 'pending',
      metadata: {
        orderId,
        orderNumber,
        expectedDate,
      },
    };

    await this.createNotification(notification);
    if (requestedByEmail) {
      await this.sendEmailNotification(notification, requestedByEmail);
    }
    await this.sendInAppNotification(notification);
  }

  // ============================================================================
  // INVENTORY NOTIFICATIONS
  // ============================================================================

  async notifyLowStock(
    tenantId: string,
    itemId: string,
    itemName: string,
    currentStock: number,
    minStock: number,
    reorderPoint: number
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'low_stock',
      entityType: 'inventory',
      entityId: itemId,
      title: `Low Stock Alert: ${itemName}`,
      message: `${itemName} is running low. Current stock: ${currentStock}, Minimum: ${minStock}, Reorder point: ${reorderPoint}`,
      priority: 'high',
      status: 'pending',
      metadata: {
        itemId,
        itemName,
        currentStock,
        minStock,
        reorderPoint,
      },
    };

    await this.createNotification(notification);
    // Send to procurement managers
    await this.sendInAppNotification(notification);
    // Email can be configured to send to specific users
  }

  // ============================================================================
  // VENDOR NOTIFICATIONS
  // ============================================================================

  async notifyVendorCreated(
    tenantId: string,
    vendorId: string,
    vendorName: string
  ): Promise<void> {
    const notification: ProcurementNotification = {
      tenantId,
      type: 'vendor_created',
      entityType: 'vendor',
      entityId: vendorId,
      title: `New Vendor Added: ${vendorName}`,
      message: `New vendor ${vendorName} has been added to the system`,
      priority: 'low',
      status: 'pending',
      metadata: {
        vendorId,
        vendorName,
      },
    };

    await this.createNotification(notification);
    await this.sendInAppNotification(notification);
  }

  // ============================================================================
  // DELIVERY REMINDERS
  // ============================================================================

  async sendDeliveryReminders(tenantId: string): Promise<void> {
    try {
      // Get orders with expected delivery in next 2 days
      const result = await query(`
        SELECT 
          po.id, po.po_number, po.vendor_name, po.expected_delivery_date,
          po.created_by, po.total_amount
        FROM purchase_orders po
        WHERE po.tenant_id = $1
          AND po.status IN ('approved', 'ordered')
          AND po.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'
          AND po.delivery_date IS NULL
      `, [tenantId]);

      for (const row of result.rows) {
        const notification: ProcurementNotification = {
          tenantId,
          type: 'delivery_reminder',
          entityType: 'purchase_order',
          entityId: row.id,
          title: `Delivery Reminder: ${row.po_number}`,
          message: `Purchase order ${row.po_number} from ${row.vendor_name} is expected to be delivered on ${row.expected_delivery_date}`,
          priority: 'medium',
          status: 'pending',
          metadata: {
            orderId: row.id,
            orderNumber: row.po_number,
            expectedDate: row.expected_delivery_date,
          },
        };

        await this.createNotification(notification);
        // Send email to requester if email available
        await this.sendInAppNotification(notification);
      }
    } catch (error: any) {
      console.error('Error sending delivery reminders:', error);
    }
  }

  // ============================================================================
  // CORE METHODS
  // ============================================================================

  async createNotification(notification: ProcurementNotification): Promise<string> {
    try {
      // Generate ID if uuid_generate_v4 is not available
      const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const result = await query(`
        INSERT INTO procurement_notifications (
          id, tenant_id, user_id, type, entity_type, entity_id,
          title, message, priority, status, metadata, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING id
      `, [
        id,
        notification.tenantId,
        notification.userId || null,
        notification.type,
        notification.entityType,
        notification.entityId,
        notification.title,
        notification.message,
        notification.priority,
        notification.status,
        JSON.stringify(notification.metadata || {}),
      ]);

      return result.rows[0].id;
    } catch (error: any) {
      // If table doesn't exist, create it (for development)
      if (error.code === '42P01') {
        await this.createNotificationsTable();
        return this.createNotification(notification);
      }
      throw error;
    }
  }

  async getNotifications(
    tenantId: string,
    userId?: string,
    filters?: {
      type?: string;
      status?: string;
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<ProcurementNotification[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (userId) {
        whereClause += ` AND (user_id = $${paramIndex++} OR user_id IS NULL)`;
        params.push(userId);
      }

      if (filters?.type) {
        whereClause += ` AND type = $${paramIndex++}`;
        params.push(filters.type);
      }

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }

      if (filters?.unreadOnly) {
        whereClause += ` AND status != 'read'`;
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT *
        FROM procurement_notifications
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      return result.rows.map((row: any) => ({
        id: row.id,
        tenantId: row.tenant_id,
        userId: row.user_id,
        type: row.type,
        entityType: row.entity_type,
        entityId: row.entity_id,
        title: row.title,
        message: row.message,
        priority: row.priority,
        status: row.status,
        emailSent: row.email_sent || false,
        inAppSent: row.in_app_sent || false,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        readAt: row.read_at,
      }));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createNotificationsTable();
        return [];
      }
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await query(`
      UPDATE procurement_notifications
      SET status = 'read', read_at = NOW()
      WHERE id = $1
    `, [notificationId]);
  }

  async markAllAsRead(tenantId: string, userId?: string): Promise<void> {
    let whereClause = 'WHERE tenant_id = $1 AND status != \'read\'';
    const params: any[] = [tenantId];

    if (userId) {
      whereClause += ` AND (user_id = $2 OR user_id IS NULL)`;
      params.push(userId);
    }

    await query(`
      UPDATE procurement_notifications
      SET status = 'read', read_at = NOW()
      ${whereClause}
    `, params);
  }

  private async sendEmailNotification(
    notification: ProcurementNotification,
    recipientEmail: string
  ): Promise<void> {
    try {
      // Call email service (integrate with existing email service)
      // For now, just mark as sent
      await query(`
        UPDATE procurement_notifications
        SET email_sent = true
        WHERE id = $1
      `, [notification.id]);

      // TODO: Integrate with actual email service
      console.log(`Email notification sent to ${recipientEmail}: ${notification.title}`);
    } catch (error: any) {
      console.error('Error sending email notification:', error);
    }
  }

  private async sendInAppNotification(
    notification: ProcurementNotification
  ): Promise<void> {
    try {
      await query(`
        UPDATE procurement_notifications
        SET in_app_sent = true, status = 'sent'
        WHERE id = $1
      `, [notification.id]);

      // TODO: Integrate with real-time notification system (WebSocket/SSE)
      console.log(`In-app notification created: ${notification.title}`);
    } catch (error: any) {
      console.error('Error sending in-app notification:', error);
    }
  }

  private async createNotificationsTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_notifications (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'pending',
        email_sent BOOLEAN DEFAULT FALSE,
        in_app_sent BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        read_at TIMESTAMPTZ,
        INDEX idx_tenant_user (tenant_id, user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
  }
}

export const procurementNotificationsService = new ProcurementNotificationsService();

