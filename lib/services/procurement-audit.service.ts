/**
 * Procurement Audit Trail Service
 * Track all changes and activities in procurement module
 */

import { query } from '@/lib/db/connection';

export interface AuditLog {
  id?: string;
  tenantId: string;
  userId: string;
  userEmail?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'import' | 'view';
  entityType: 'purchase_order' | 'vendor' | 'inventory' | 'template' | 'document';
  entityId: string;
  entityName?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

export class ProcurementAuditService {
  async log(
    tenantId: string,
    userId: string,
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    changes?: Record<string, { old: any; new: any }>,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const logId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      await query(`
        INSERT INTO procurement_audit_log (
          id, tenant_id, user_id, action, entity_type, entity_id,
          changes, metadata, ip_address, user_agent, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [
        logId,
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify(changes || {}),
        JSON.stringify(metadata || {}),
        ipAddress || null,
        userAgent || null,
      ]);
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createAuditTable();
        return this.log(tenantId, userId, action, entityType, entityId, changes, metadata, ipAddress, userAgent);
      }
      console.error('Error logging audit:', error);
      // Don't throw - audit logging should not break the application
    }
  }

  async getAuditLogs(
    tenantId: string,
    filters?: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLog[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.userId) {
        whereClause += ` AND user_id = $${paramIndex++}`;
        params.push(filters.userId);
      }

      if (filters?.action) {
        whereClause += ` AND action = $${paramIndex++}`;
        params.push(filters.action);
      }

      if (filters?.entityType) {
        whereClause += ` AND entity_type = $${paramIndex++}`;
        params.push(filters.entityType);
      }

      if (filters?.entityId) {
        whereClause += ` AND entity_id = $${paramIndex++}`;
        params.push(filters.entityId);
      }

      if (filters?.dateFrom) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(filters.dateFrom);
      }

      if (filters?.dateTo) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(filters.dateTo);
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT 
          al.*,
          u.email as user_email
        FROM procurement_audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      return result.rows.map((row: any) => ({
        id: row.id,
        tenantId: row.tenant_id,
        userId: row.user_id,
        userEmail: row.user_email,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        entityName: row.entity_name,
        changes: typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createAuditTable();
        return [];
      }
      throw error;
    }
  }

  async getEntityHistory(
    tenantId: string,
    entityType: AuditLog['entityType'],
    entityId: string
  ): Promise<AuditLog[]> {
    return this.getAuditLogs(tenantId, {
      entityType,
      entityId,
      limit: 100,
    });
  }

  private async createAuditTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_audit_log (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        entity_name VARCHAR(255),
        changes JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_tenant_entity (tenant_id, entity_type, entity_id),
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
  }
}

export const procurementAuditService = new ProcurementAuditService();

