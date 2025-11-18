/**
 * Audit Logging Module
 * Tracks all operations for compliance and debugging
 */

/**
 * Audit Logger
 */
class AuditLogger {
  constructor(db) {
    this.db = db;
    this.enabled = process.env.AUDIT_LOGGING_ENABLED !== 'false';
  }

  /**
   * Log document operation
   */
  async logDocumentOperation(event, userId, documentId, details = {}) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: `document_${event}`,
        userId: userId || 'system',
        action: event.toUpperCase(),
        resource: 'document',
        resourceId: documentId,
        timestamp: new Date(),
        details,
        status: 'success'
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }

  /**
   * Log workflow execution
   */
  async logWorkflowExecution(workflowName, workflowId, executionId, status, duration, error = null) {
    if (!this.enabled) return;

    try {
      await this.db.collection('workflow_logs').insertOne({
        workflowId,
        workflowName,
        executionId,
        status,
        duration,
        timestamp: new Date(),
        error: error ? error.toString() : null
      });
    } catch (error) {
      console.error('Workflow log failed:', error);
    }
  }

  /**
   * Log authentication event
   */
  async logAuthentication(userId, method, success, ipAddress, userAgent) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: 'authentication',
        userId: userId || 'unknown',
        action: 'LOGIN',
        resource: 'auth',
        timestamp: new Date(),
        details: {
          method,
          ipAddress,
          userAgent,
          success
        },
        status: success ? 'success' : 'failure'
      });
    } catch (error) {
      console.error('Auth log failed:', error);
    }
  }

  /**
   * Log data access
   */
  async logDataAccess(userId, resource, action, accessDenied = false) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: `data_${action}`,
        userId: userId || 'system',
        action: action.toUpperCase(),
        resource,
        timestamp: new Date(),
        status: accessDenied ? 'denied' : 'success'
      });
    } catch (error) {
      console.error('Data access log failed:', error);
    }
  }

  /**
   * Log system event
   */
  async logSystemEvent(event, level = 'info', details = {}) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: `system_${event}`,
        userId: 'system',
        action: event.toUpperCase(),
        resource: 'system',
        timestamp: new Date(),
        details: {
          level,
          ...details
        },
        status: 'success'
      });
    } catch (error) {
      console.error('System log failed:', error);
    }
  }

  /**
   * Log error
   */
  async logError(error, context = {}) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: 'error_occurred',
        userId: context.userId || 'system',
        action: 'ERROR',
        resource: context.resource || 'unknown',
        timestamp: new Date(),
        details: {
          message: error.message,
          code: error.errorCode,
          stack: error.stack,
          context
        },
        status: 'failure'
      });
    } catch (logError) {
      console.error('Error log failed:', logError);
    }
  }

  /**
   * Log API call
   */
  async logApiCall(method, path, userId, statusCode, duration, details = {}) {
    if (!this.enabled) return;

    try {
      await this.db.collection('audit_log').insertOne({
        event: 'api_call',
        userId: userId || 'anonymous',
        action: method,
        resource: path,
        timestamp: new Date(),
        details: {
          statusCode,
          duration,
          ...details
        },
        status: statusCode >= 200 && statusCode < 400 ? 'success' : 'failure'
      });
    } catch (error) {
      console.error('API log failed:', error);
    }
  }

  /**
   * Get audit logs
   */
  async getLogs(filters = {}, page = 1, limit = 50) {
    if (!this.enabled) {
      return { logs: [], total: 0 };
    }

    try {
      const skip = (page - 1) * limit;
      const query = this.buildQuery(filters);

      const logs = await this.db.collection('audit_log')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await this.db.collection('audit_log').countDocuments(query);

      return {
        logs,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Failed to get logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Build MongoDB query from filters
   */
  buildQuery(filters = {}) {
    const query = {};

    if (filters.event) {
      query.event = filters.event;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.resource) {
      query.resource = filters.resource;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }

    if (filters.action) {
      query.action = filters.action;
    }

    return query;
  }

  /**
   * Cleanup old logs
   */
  async cleanup() {
    if (!this.enabled) return;

    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || 365);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await this.db.collection('audit_log').deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} audit logs older than ${retentionDays} days`);
      return result.deletedCount;
    } catch (error) {
      console.error('Audit log cleanup failed:', error);
    }
  }

  /**
   * Generate audit report
   */
  async generateReport(startDate, endDate) {
    try {
      const logs = await this.db.collection('audit_log')
        .find({
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
        .toArray();

      const report = {
        period: { startDate, endDate },
        totalEvents: logs.length,
        eventsByType: {},
        eventsByUser: {},
        eventsByResource: {},
        failureCount: 0,
        successCount: 0,
        generatedAt: new Date().toISOString()
      };

      logs.forEach(log => {
        // Count by event type
        report.eventsByType[log.event] = (report.eventsByType[log.event] || 0) + 1;

        // Count by user
        report.eventsByUser[log.userId] = (report.eventsByUser[log.userId] || 0) + 1;

        // Count by resource
        report.eventsByResource[log.resource] = (report.eventsByResource[log.resource] || 0) + 1;

        // Count success/failure
        if (log.status === 'success') {
          report.successCount++;
        } else {
          report.failureCount++;
        }
      });

      return report;
    } catch (error) {
      console.error('Audit report generation failed:', error);
      throw error;
    }
  }
}

/**
 * Express middleware for logging requests
 */
function auditMiddleware(auditLogger) {
  return (req, res, next) => {
    const startTime = Date.now();

    // Intercept response end
    const originalEnd = res.end;
    res.end = function() {
      const duration = Date.now() - startTime;

      // Log the API call
      auditLogger.logApiCall(
        req.method,
        req.path,
        req.user?.id,
        res.statusCode,
        duration,
        {
          query: req.query,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      ).catch(err => console.error('Failed to log API call:', err));

      // Call original end
      originalEnd.apply(res, arguments);
    };

    next();
  };
}

/**
 * Cleanup expired sessions periodically
 */
function startAuditCleanup(auditLogger, intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  setInterval(() => {
    auditLogger.cleanup().catch(error => {
      console.error('Audit cleanup error:', error);
    });
  }, intervalMs);

  console.log(`Audit log cleanup scheduled every ${intervalHours} hours`);
}

module.exports = {
  AuditLogger,
  auditMiddleware,
  startAuditCleanup
};