/**
 * Database Service for License Management
 * Handles database operations for cron jobs and license management
 */

export interface JobExecutionLog {
  jobName: string;
  status: 'completed' | 'failed';
  startTime: Date;
  endTime: Date;
  duration: number;
  error: string | null;
}

export interface LicenseEvent {
  licenseId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
}

export interface SystemEvent {
  eventType: string;
  eventData: any;
  timestamp: Date;
}

export interface CronJobConfig {
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  nextRun: Date;
  createdAt: Date;
}

export interface UsageAggregation {
  tenantId: string;
  date: Date;
  usageData: any;
  createdAt: Date;
}

export interface ComplianceCheck {
  licenseId: string;
  tenantId: string;
  checkDate: Date;
  compliant: boolean;
  violations: string[];
}

export interface BillingEvent {
  tenantId: string;
  eventType: string;
  data?: any;
  timestamp?: Date;
}

export interface HealthCheckResult {
  checkTime: Date;
  totalJobs: number;
  issues: any[];
  status: 'healthy' | 'issues_detected';
}

export interface JobEvent {
  jobName: string;
  eventType: string;
  timestamp: Date;
}

export class DatabaseService {
  private pool: any = null;

  /**
   * Get connection pool (lazy initialization)
   */
  private getPoolInstance(): any {
    if (!this.pool) {
      // Import the real database connection
      const { getPool } = require('@/lib/db/connection');
      this.pool = getPool();
    }
    return this.pool;
  }

  /**
   * Execute database query
   */
  public async query(sql: string, params?: any[]): Promise<any> {
    const pool = this.getPoolInstance();
    return pool.query(sql, params);
  }

  /**
   * Begin transaction
   */
  public async beginTransaction(): Promise<void> {
    const pool = this.getPoolInstance();
    await pool.query('BEGIN');
  }

  /**
   * Commit transaction
   */
  public async commitTransaction(): Promise<void> {
    const pool = this.getPoolInstance();
    await pool.query('COMMIT');
  }

  /**
   * Rollback transaction
   */
  public async rollbackTransaction(): Promise<void> {
    const pool = this.getPoolInstance();
    await pool.query('ROLLBACK');
  }

  /**
   * Log job execution
   */
  public async logJobExecution(execution: JobExecutionLog): Promise<void> {
    try {
      const query = `
        INSERT INTO cron_job_executions (
          job_name, status, start_time, end_time, duration_ms, error_message, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const values = [
        execution.jobName,
        execution.status,
        execution.startTime,
        execution.endTime,
        execution.duration,
        execution.error,
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged job execution: ${execution.jobName} - ${execution.status}`);
    } catch (error) {
      console.error('Failed to log job execution:', error);
      throw error;
    }
  }

  /**
   * Log license events
   */
  public async logLicenseEvent(event: LicenseEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO license_events (
          license_id, event_type, event_data, timestamp, created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        event.licenseId,
        event.eventType,
        JSON.stringify(event.eventData),
        event.timestamp,
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged license event: ${event.eventType} for license ${event.licenseId}`);
    } catch (error) {
      console.error('Failed to log license event:', error);
      throw error;
    }
  }

  /**
   * Log system events
   */
  public async logSystemEvent(event: SystemEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO system_events (
          event_type, event_data, timestamp, created_at
        ) VALUES ($1, $2, $3, $4)
      `;

      const values = [
        event.eventType,
        JSON.stringify(event.eventData),
        event.timestamp,
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged system event: ${event.eventType}`);
    } catch (error) {
      console.error('Failed to log system event:', error);
      throw error;
    }
  }

  /**
   * Store cron job configuration
   */
  public async storeCronJobConfig(config: CronJobConfig): Promise<void> {
    try {
      const query = `
        INSERT INTO cron_job_configs (
          name, schedule, description, enabled, next_run, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
          schedule = EXCLUDED.schedule,
          description = EXCLUDED.description,
          enabled = EXCLUDED.enabled,
          next_run = EXCLUDED.next_run,
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        config.name,
        config.schedule,
        config.description,
        config.enabled,
        config.nextRun,
        config.createdAt
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Stored cron job config: ${config.name}`);
    } catch (error) {
      console.error('Failed to store cron job config:', error);
      throw error;
    }
  }

  /**
   * Store daily usage aggregation
   */
  public async storeDailyUsageAggregation(aggregation: UsageAggregation): Promise<void> {
    try {
      const query = `
        INSERT INTO daily_usage_aggregations (
          tenant_id, usage_date, usage_data, created_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (tenant_id, usage_date) DO UPDATE SET
          usage_data = EXCLUDED.usage_data,
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        aggregation.tenantId,
        aggregation.date,
        JSON.stringify(aggregation.usageData),
        aggregation.createdAt
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Stored usage aggregation for tenant ${aggregation.tenantId}`);
    } catch (error) {
      console.error('Failed to store usage aggregation:', error);
      throw error;
    }
  }

  /**
   * Update reminder status
   */
  public async updateReminderStatus(licenseId: string, reminderType: string, sentAt: Date): Promise<void> {
    try {
      const query = `
        INSERT INTO renewal_reminders (
          license_id, reminder_type, sent_at, created_at
        ) VALUES ($1, $2, $3, $4)
      `;

      const values = [licenseId, reminderType, sentAt, new Date()];

      await this.getPoolInstance().query(query, values);
      console.log(`Updated reminder status for license ${licenseId}: ${reminderType}`);
    } catch (error) {
      console.error('Failed to update reminder status:', error);
      throw error;
    }
  }

  /**
   * Log compliance check
   */
  public async logComplianceCheck(check: ComplianceCheck): Promise<void> {
    try {
      const query = `
        INSERT INTO license_compliance_checks (
          license_id, tenant_id, check_date, compliant, violations, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const values = [
        check.licenseId,
        check.tenantId,
        check.checkDate,
        check.compliant,
        JSON.stringify(check.violations),
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged compliance check for license ${check.licenseId}`);
    } catch (error) {
      console.error('Failed to log compliance check:', error);
      throw error;
    }
  }

  /**
   * Store weekly report
   */
  public async storeWeeklyReport(report: any): Promise<void> {
    try {
      const query = `
        INSERT INTO weekly_usage_reports (
          report_period_start, report_period_end, report_data, generated_at, created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        report.reportPeriod.start,
        report.reportPeriod.end,
        JSON.stringify(report),
        report.generatedAt,
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log('Stored weekly usage report');
    } catch (error) {
      console.error('Failed to store weekly report:', error);
      throw error;
    }
  }

  /**
   * Log billing event
   */
  public async logBillingEvent(event: BillingEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO billing_events (
          tenant_id, event_type, event_data, created_at
        ) VALUES ($1, $2, $3, $4)
      `;

      const values = [
        event.tenantId,
        event.eventType,
        JSON.stringify(event.data || {}),
        event.timestamp || new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged billing event for tenant ${event.tenantId}: ${event.eventType}`);
    } catch (error) {
      console.error('Failed to log billing event:', error);
      throw error;
    }
  }

  /**
   * Store health check result
   */
  public async storeHealthCheckResult(result: HealthCheckResult): Promise<void> {
    try {
      const query = `
        INSERT INTO cron_health_checks (
          check_time, total_jobs, issues_detected, status_summary, created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        result.checkTime,
        result.totalJobs,
        JSON.stringify(result.issues),
        result.status,
        new Date()
      ];

      await this.getPoolInstance().query(query, values);
      console.log('Stored health check result');
    } catch (error) {
      console.error('Failed to store health check result:', error);
      throw error;
    }
  }

  /**
   * Log job event
   */
  public async logJobEvent(event: JobEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO cron_job_events (
          job_name, event_type, timestamp, created_at
        ) VALUES ($1, $2, $3, $4)
      `;

      const values = [event.jobName, event.eventType, event.timestamp, new Date()];

      await this.getPoolInstance().query(query, values);
      console.log(`Logged job event: ${event.eventType} for ${event.jobName}`);
    } catch (error) {
      console.error('Failed to log job event:', error);
      throw error;
    }
  }

  /**
   * Get job execution history
   */
  public async getJobExecutionHistory(jobName: string, limit: number = 50): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM cron_job_executions 
        WHERE job_name = $1 
        ORDER BY start_time DESC 
        LIMIT $2
      `;

      const result = await this.getPoolInstance().query(query, [jobName, limit]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get job execution history:', error);
      return [];
    }
  }

  /**
   * Get cron job metrics
   */
  public async getCronJobMetrics(): Promise<any> {
    try {
      const metricsQuery = `
        SELECT 
          COUNT(*) as total_executions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_executions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
          AVG(duration_ms) as avg_duration_ms,
          MAX(duration_ms) as max_duration_ms,
          MIN(duration_ms) as min_duration_ms
        FROM cron_job_executions 
        WHERE start_time >= NOW() - INTERVAL '24 hours'
      `;

      const result = await this.getPoolInstance().query(metricsQuery);
      return result.rows[0] || {};
    } catch (error) {
      console.error('Failed to get cron job metrics:', error);
      return {};
    }
  }

  /**
   * Cleanup old records
   */
  public async cleanupOldRecords(): Promise<void> {
    try {
      // Clean up old job execution records (older than 30 days)
      const cleanupQueries = [
        {
          name: 'job_executions',
          query: `DELETE FROM cron_job_executions WHERE start_time < NOW() - INTERVAL '30 days'`
        },
        {
          name: 'license_events',
          query: `DELETE FROM license_events WHERE timestamp < NOW() - INTERVAL '90 days'`
        },
        {
          name: 'system_events',
          query: `DELETE FROM system_events WHERE timestamp < NOW() - INTERVAL '90 days'`
        },
        {
          name: 'health_checks',
          query: `DELETE FROM cron_health_checks WHERE check_time < NOW() - INTERVAL '30 days'`
        }
      ];

      for (const cleanup of cleanupQueries) {
        const result = await this.getPoolInstance().query(cleanup.query);
        console.log(`Cleaned up ${result.rowCount} old records from ${cleanup.name}`);
      }

    } catch (error) {
      console.error('Failed to cleanup old records:', error);
      throw error;
    }
  }

  /**
   * Get database connection status
   */
  public async getConnectionStatus(): Promise<boolean> {
    try {
      await this.getPoolInstance().query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      if (this.pool && this.pool.end) {
        await this.pool.end();
      }
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Failed to close database connection:', error);
      throw error;
    }
  }

  /**
   * Get Stripe customer
   */
  public async getStripeCustomer(tenantId: string): Promise<any> {
    try {
      const query = `SELECT * FROM stripe_customers WHERE tenant_id = $1`;
      const result = await this.getPoolInstance().query(query, [tenantId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Get tenant
   */
  public async getTenant(tenantId: string): Promise<any> {
    try {
      const query = `SELECT * FROM tenants WHERE id = $1`;
      const result = await this.getPoolInstance().query(query, [tenantId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get tenant:', error);
      throw error;
    }
  }

  /**
   * Save Stripe customer
   */
  public async saveStripeCustomer(tenantId: string, customerId: string): Promise<void> {
    try {
      const pool = this.getPoolInstance();
      const query = `
        INSERT INTO stripe_customers (tenant_id, customer_id, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id) DO UPDATE SET
          customer_id = EXCLUDED.customer_id,
          updated_at = CURRENT_TIMESTAMP
      `;
      await pool.query(query, [tenantId, customerId, new Date()]);
      console.log(`Saved Stripe customer for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to save Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Static method to get connection pool
   */
  public static getPool(): any {
    const { getPool } = require('@/lib/db/connection');
    return getPool();
  }

  /**
   * Static method to close connection pool
   */
  public static async closePool(): Promise<void> {
    console.log('Database connection pool closed');
  }

  public static async testConnection(): Promise<boolean> {
    const { testConnection } = require('@/lib/db/connection');
    return testConnection();
  }

  public static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const { transaction } = require('@/lib/db/connection');
    return transaction(callback);
  }

  /**
   * Get current license for tenant
   */
  public async getCurrentLicense(tenantId: string): Promise<any> {
    try {
      const query = `
        SELECT l.*, p.name as plan_name, p.monthly_price 
        FROM licenses l 
        JOIN license_plans p ON l.plan_id = p.id 
        WHERE l.tenant_id = $1 AND l.status = 'active'
        ORDER BY l.created_at DESC 
        LIMIT 1
      `;
      const result = await this.getPoolInstance().query(query, [tenantId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get current license:', error);
      throw error;
    }
  }

  /**
   * Get usage for period
   */
  public async getUsageForPeriod(tenantId: string, period: { start: Date; end: Date }): Promise<any> {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(user_count), 0) as total_users,
          COALESCE(SUM(storage_gb), 0) as total_storage,
          COALESCE(SUM(api_calls), 0) as total_api_calls
        FROM daily_usage_aggregations 
        WHERE tenant_id = $1 AND usage_date >= $2 AND usage_date <= $3
      `;
      const result = await this.getPoolInstance().query(query, [tenantId, period.start, period.end]);
      return result.rows[0] || { total_users: 0, total_storage: 0, total_api_calls: 0 };
    } catch (error) {
      console.error('Failed to get usage for period:', error);
      throw error;
    }
  }
}

export default DatabaseService;
