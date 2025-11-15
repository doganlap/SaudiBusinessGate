/**
 * Comprehensive Audit Logging Service
 * Tracks all user actions for compliance and security
 */

import { Pool } from 'pg';

// =====================================================
// INTERFACES
// =====================================================

export interface AuditLogEntry {
  organizationId: number;
  userId: number;
  actionType: string;
  resourceType?: string;
  resourceId?: number;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  success?: boolean;
  errorMessage?: string;
}

export interface SecurityEvent {
  organizationId?: number;
  userId?: number;
  eventType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

// =====================================================
// AUDIT LOGGER SERVICE
// =====================================================

export class AuditLogger {
  private db: Pool;
  private batchQueue: AuditLogEntry[];
  private batchInterval: NodeJS.Timeout | null;
  private batchSize: number = 100;
  private batchTimeMs: number = 5000; // 5 seconds

  constructor(dbPool: Pool) {
    this.db = dbPool;
    this.batchQueue = [];
    this.batchInterval = null;
    this.startBatchProcessing();
  }

  // =====================================================
  // LOGGING METHODS
  // =====================================================

  async log(entry: AuditLogEntry): Promise<void> {
    // Add to batch queue for better performance
    this.batchQueue.push(entry);

    // If batch is full, process immediately
    if (this.batchQueue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  async logSync(entry: AuditLogEntry): Promise<number> {
    // Synchronous logging for critical events
    const query = `
      INSERT INTO audit_logs (
        organization_id, user_id, action_type, resource_type, resource_id,
        changes, ip_address, user_agent, request_id, success, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      entry.organizationId,
      entry.userId,
      entry.actionType,
      entry.resourceType,
      entry.resourceId,
      entry.changes ? JSON.stringify(entry.changes) : null,
      entry.ipAddress,
      entry.userAgent,
      entry.requestId,
      entry.success !== false,
      entry.errorMessage
    ];

    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  // =====================================================
  // SECURITY EVENTS
  // =====================================================

  async logSecurityEvent(event: SecurityEvent): Promise<number> {
    const query = `
      INSERT INTO security_events (
        organization_id, user_id, event_type, severity, description,
        ip_address, user_agent, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      event.organizationId,
      event.userId,
      event.eventType,
      event.severity,
      event.description,
      event.ipAddress,
      event.userAgent,
      event.metadata ? JSON.stringify(event.metadata) : null
    ];

    const result = await this.db.query(query, values);
    
    // Alert on critical/high severity
    if (event.severity === 'critical' || event.severity === 'high') {
      await this.alertSecurityTeam(event);
    }

    return result.rows[0].id;
  }

  // =====================================================
  // CONVENIENCE LOGGING METHODS
  // =====================================================

  async logAuthentication(
    userId: number,
    organizationId: number,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      userId,
      actionType: success ? 'auth.login.success' : 'auth.login.failed',
      ipAddress,
      userAgent,
      success
    });

    // Log security event for failed login
    if (!success) {
      await this.logSecurityEvent({
        organizationId,
        userId,
        eventType: 'failed_login',
        severity: 'medium',
        description: 'Failed login attempt',
        ipAddress,
        userAgent
      });
    }
  }

  async logDataAccess(
    userId: number,
    organizationId: number,
    resourceType: string,
    resourceId: number,
    action: 'read' | 'create' | 'update' | 'delete',
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      userId,
      actionType: `data.${action}`,
      resourceType,
      resourceId,
      ipAddress,
      success: true
    });
  }

  async logDataChange(
    userId: number,
    organizationId: number,
    resourceType: string,
    resourceId: number,
    oldData: any,
    newData: any,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      userId,
      actionType: 'data.update',
      resourceType,
      resourceId,
      changes: {
        before: oldData,
        after: newData
      },
      ipAddress,
      success: true
    });
  }

  async logPermissionCheck(
    userId: number,
    organizationId: number,
    permission: string,
    granted: boolean,
    ipAddress?: string
  ): Promise<void> {
    if (!granted) {
      // Only log denied permissions
      await this.logSecurityEvent({
        organizationId,
        userId,
        eventType: 'permission_denied',
        severity: 'low',
        description: `Permission denied: ${permission}`,
        ipAddress,
        metadata: { permission }
      });
    }
  }

  async logAPICall(
    userId: number,
    organizationId: number,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      userId,
      actionType: 'api.call',
      resourceType: 'api_endpoint',
      ipAddress,
      success: statusCode < 400,
      changes: {
        endpoint,
        method,
        statusCode,
        responseTime
      }
    });
  }

  // =====================================================
  // BATCH PROCESSING
  // =====================================================

  private startBatchProcessing(): void {
    this.batchInterval = setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.processBatch();
      }
    }, this.batchTimeMs);
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.batchSize);

    try {
      const query = `
        INSERT INTO audit_logs (
          organization_id, user_id, action_type, resource_type, resource_id,
          changes, ip_address, user_agent, request_id, success, error_message
        ) VALUES ${batch.map((_, i) => 
          `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, 
           $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`
        ).join(', ')}
      `;

      const values = batch.flatMap(entry => [
        entry.organizationId,
        entry.userId,
        entry.actionType,
        entry.resourceType,
        entry.resourceId,
        entry.changes ? JSON.stringify(entry.changes) : null,
        entry.ipAddress,
        entry.userAgent,
        entry.requestId,
        entry.success !== false,
        entry.errorMessage
      ]);

      await this.db.query(query, values);
    } catch (error) {
      console.error('Audit log batch insert failed:', error);
      // Re-queue failed items
      this.batchQueue.push(...batch);
    }
  }

  // =====================================================
  // QUERY METHODS
  // =====================================================

  async getAuditLogs(params: {
    organizationId?: number;
    userId?: number;
    actionType?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (params.organizationId) {
      query += ` AND organization_id = $${paramCount++}`;
      values.push(params.organizationId);
    }

    if (params.userId) {
      query += ` AND user_id = $${paramCount++}`;
      values.push(params.userId);
    }

    if (params.actionType) {
      query += ` AND action_type = $${paramCount++}`;
      values.push(params.actionType);
    }

    if (params.resourceType) {
      query += ` AND resource_type = $${paramCount++}`;
      values.push(params.resourceType);
    }

    if (params.startDate) {
      query += ` AND created_at >= $${paramCount++}`;
      values.push(params.startDate);
    }

    if (params.endDate) {
      query += ` AND created_at <= $${paramCount++}`;
      values.push(params.endDate);
    }

    query += ' ORDER BY created_at DESC';

    if (params.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(params.limit);
    }

    if (params.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(params.offset);
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  async getSecurityEvents(params: {
    organizationId?: number;
    severity?: string;
    resolved?: boolean;
    startDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    let query = 'SELECT * FROM security_events WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (params.organizationId) {
      query += ` AND organization_id = $${paramCount++}`;
      values.push(params.organizationId);
    }

    if (params.severity) {
      query += ` AND severity = $${paramCount++}`;
      values.push(params.severity);
    }

    if (params.resolved !== undefined) {
      query += ` AND resolved = $${paramCount++}`;
      values.push(params.resolved);
    }

    if (params.startDate) {
      query += ` AND created_at >= $${paramCount++}`;
      values.push(params.startDate);
    }

    query += ' ORDER BY created_at DESC';

    if (params.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(params.limit);
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  // =====================================================
  // SECURITY ALERTS
  // =====================================================

  private async alertSecurityTeam(event: SecurityEvent): Promise<void> {
    // In production, integrate with:
    // - PagerDuty for critical alerts
    // - Slack/Teams for notifications
    // - Email for security team
    console.error('SECURITY ALERT:', event);
    
    // TODO: Implement actual alerting mechanism
    // await sendEmail({
    //   to: 'security@company.com',
    //   subject: `[${event.severity.toUpperCase()}] Security Event: ${event.eventType}`,
    //   body: event.description
    // });
  }

  // =====================================================
  // CLEANUP & SHUTDOWN
  // =====================================================

  async shutdown(): Promise<void> {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }

    // Process remaining items in queue
    if (this.batchQueue.length > 0) {
      await this.processBatch();
    }
  }
}

// =====================================================
// EXPRESS MIDDLEWARE FOR AUTO-LOGGING
// =====================================================

export function createAuditMiddleware(auditLogger: AuditLogger) {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Capture original res.json
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      const responseTime = Date.now() - startTime;

      // Log API call
      if (req.user) {
        auditLogger.logAPICall(
          req.user.id,
          req.user.organizationId || req.headers['x-organization-id'],
          req.path,
          req.method,
          res.statusCode,
          responseTime,
          req.ip || req.connection.remoteAddress
        ).catch(err => console.error('Audit logging failed:', err));
      }

      return originalJson(data);
    };

    next();
  };
}

export default AuditLogger;

