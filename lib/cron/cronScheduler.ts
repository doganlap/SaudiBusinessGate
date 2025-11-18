/**
 * Cron Jobs Scheduler and Manager
 * Manages execution and monitoring of license management automation jobs
 */

import * as cron from 'node-cron';
import { LicenseJobsConfig } from './licenseJobsConfig';
import { DatabaseService } from '../services/database.service';
import { NotificationService } from '../services/notification.service';

interface JobExecution {
  jobName: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  error?: string;
  duration?: number;
}

export class CronScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobExecutions: Map<string, JobExecution> = new Map();
  private licenseJobsConfig: LicenseJobsConfig;
  private dbService: DatabaseService;
  private notificationService: NotificationService;
  private isInitialized = false;

  constructor() {
    this.licenseJobsConfig = new LicenseJobsConfig();
    this.dbService = new DatabaseService();
    this.notificationService = new NotificationService();
  }

  /**
   * Initialize and start all cron jobs
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Cron scheduler already initialized');
      return;
    }

    try {
      console.log('Initializing cron scheduler...');

      const cronJobs = this.licenseJobsConfig.getCronJobs();

      for (const jobConfig of cronJobs) {
        if (jobConfig.enabled) {
          await this.scheduleJob(jobConfig);
        }
      }

      // Schedule the monitoring job
      this.scheduleMonitoringJob();

      this.isInitialized = true;
      console.log(`Cron scheduler initialized with ${this.jobs.size} jobs`);

      // Log initialization
      await this.dbService.logSystemEvent({
        eventType: 'cron_scheduler_initialized',
        eventData: { 
          totalJobs: this.jobs.size,
          enabledJobs: cronJobs.filter(j => j.enabled).length
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Failed to initialize cron scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule a single cron job
   */
  private async scheduleJob(jobConfig: any): Promise<void> {
    try {
      const task = cron.schedule(
        jobConfig.schedule,
        async () => {
          await this.executeJob(jobConfig);
        },
        {
          timezone: process.env.CRON_TIMEZONE || 'UTC'
        }
      );

      this.jobs.set(jobConfig.name, task);
      task.start();

      console.log(`Scheduled job: ${jobConfig.name} with pattern: ${jobConfig.schedule}`);

      // Calculate next run time
      const nextRun = this.calculateNextRunTime(jobConfig.schedule);
      
      // Store job configuration in database
      await this.dbService.storeCronJobConfig({
        name: jobConfig.name,
        schedule: jobConfig.schedule,
        description: jobConfig.description,
        enabled: jobConfig.enabled,
        nextRun,
        createdAt: new Date()
      });

    } catch (error) {
      console.error(`Failed to schedule job ${jobConfig.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute a specific job with error handling and monitoring
   */
  private async executeJob(jobConfig: any): Promise<void> {
    const execution: JobExecution = {
      jobName: jobConfig.name,
      startTime: new Date(),
      status: 'running'
    };

    this.jobExecutions.set(jobConfig.name, execution);

    try {
      console.log(`Starting job execution: ${jobConfig.name}`);

      // Execute the job handler
      await jobConfig.handler();

      execution.endTime = new Date();
      execution.status = 'completed';
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

      console.log(`Job completed: ${jobConfig.name} (${execution.duration}ms)`);

      // Log successful execution
      await this.dbService.logJobExecution({
        jobName: jobConfig.name,
        status: 'completed',
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.duration,
        error: null
      });

    } catch (error) {
      execution.endTime = new Date();
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

      console.error(`Job failed: ${jobConfig.name}`, error);

      // Log failed execution
      await this.dbService.logJobExecution({
        jobName: jobConfig.name,
        status: 'failed',
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.duration,
        error: execution.error
      });

      // Send failure notification for critical jobs
      if (this.isCriticalJob(jobConfig.name)) {
        await this.notificationService.sendJobFailureAlert({
          jobName: jobConfig.name,
          error: execution.error,
          startTime: execution.startTime,
          endTime: execution.endTime
        });
      }
    }
  }

  /**
   * Schedule monitoring job that runs every 5 minutes
   */
  private scheduleMonitoringJob(): void {
    const monitoringTask = cron.schedule(
      '*/5 * * * *', // Every 5 minutes
      async () => {
        await this.monitorJobHealth();
      },
      {
          timezone: process.env.CRON_TIMEZONE || 'UTC'
        }
    );

    this.jobs.set('job-health-monitor', monitoringTask);
    console.log('Scheduled job health monitoring');
  }

  /**
   * Monitor job health and send alerts for issues
   */
  private async monitorJobHealth(): Promise<void> {
    try {
      const currentTime = new Date();
      const jobHealthChecks = [];

      for (const [jobName, execution] of this.jobExecutions) {
        // Check if job is running too long (more than 1 hour)
        if (execution.status === 'running') {
          const runningTime = currentTime.getTime() - execution.startTime.getTime();
          if (runningTime > 60 * 60 * 1000) { // 1 hour
            jobHealthChecks.push({
              jobName,
              issue: 'long_running',
              runningTime,
              startTime: execution.startTime
            });
          }
        }

        // Check for recent failures
        if (execution.status === 'failed' && execution.endTime) {
          const timeSinceFailure = currentTime.getTime() - execution.endTime.getTime();
          if (timeSinceFailure < 10 * 60 * 1000) { // Last 10 minutes
            jobHealthChecks.push({
              jobName,
              issue: 'recent_failure',
              error: execution.error,
              failureTime: execution.endTime
            });
          }
        }
      }

      // Process health check issues
      for (const healthCheck of jobHealthChecks) {
        await this.handleHealthCheckIssue(healthCheck);
      }

      // Store health check results
      await this.dbService.storeHealthCheckResult({
        checkTime: currentTime,
        totalJobs: this.jobs.size,
        issues: jobHealthChecks,
        status: jobHealthChecks.length === 0 ? 'healthy' : 'issues_detected'
      });

    } catch (error) {
      console.error('Error in job health monitoring:', error);
    }
  }

  /**
   * Handle specific health check issues
   */
  private async handleHealthCheckIssue(healthCheck: any): Promise<void> {
    switch (healthCheck.issue) {
      case 'long_running':
        await this.notificationService.sendJobLongRunningAlert({
          jobName: healthCheck.jobName,
          runningTime: healthCheck.runningTime,
          startTime: healthCheck.startTime
        });
        break;

      case 'recent_failure':
        await this.notificationService.sendJobRecentFailureAlert({
          jobName: healthCheck.jobName,
          error: healthCheck.error,
          failureTime: healthCheck.failureTime
        });
        break;
    }
  }

  /**
   * Get current job status and statistics
   */
  public getJobStatus(): any {
    const status = {
      totalJobs: this.jobs.size,
      runningJobs: Array.from(this.jobExecutions.values()).filter(j => j.status === 'running').length,
      isInitialized: this.isInitialized,
      jobs: Array.from(this.jobExecutions.entries()).map(([name, execution]) => ({
        name,
        status: execution.status,
        lastRun: execution.startTime,
        duration: execution.duration,
        error: execution.error
      }))
    };

    return status;
  }

  /**
   * Stop a specific job
   */
  public async stopJob(jobName: string): Promise<void> {
    const task = this.jobs.get(jobName);
    if (task) {
      task.stop();
      this.jobs.delete(jobName);
      
      await this.dbService.logJobEvent({
        jobName,
        eventType: 'job_stopped',
        timestamp: new Date()
      });
      
      console.log(`Stopped job: ${jobName}`);
    }
  }

  /**
   * Restart a specific job
   */
  public async restartJob(jobName: string): Promise<void> {
    // Stop existing job
    await this.stopJob(jobName);
    
    // Find job configuration and reschedule
    const cronJobs = this.licenseJobsConfig.getCronJobs();
    const jobConfig = cronJobs.find(job => job.name === jobName);
    
    if (jobConfig && jobConfig.enabled) {
      await this.scheduleJob(jobConfig);
      console.log(`Restarted job: ${jobName}`);
    }
  }

  /**
   * Shutdown all cron jobs gracefully
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down cron scheduler...');

    for (const [jobName, task] of this.jobs) {
      task.stop();
    }

    this.jobs.clear();
    this.jobExecutions.clear();
    this.isInitialized = false;

    await this.dbService.logSystemEvent({
      eventType: 'cron_scheduler_shutdown',
      eventData: { shutdownTime: new Date() },
      timestamp: new Date()
    });

    console.log('Cron scheduler shutdown complete');
  }

  /**
   * Utility methods
   */
  private isCriticalJob(jobName: string): boolean {
    const criticalJobs = [
      'license-expiry-check',
      'monthly-billing-cycle',
      'license-compliance-check',
      'license-status-sync'
    ];
    return criticalJobs.includes(jobName);
  }

  private calculateNextRunTime(schedule: string): Date {
    // This is a simplified calculation - in production use a proper cron parser
    const now = new Date();
    // Add 24 hours as a default approximation
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Manual job triggers for testing and emergency execution
   */
  public async triggerJob(jobName: string): Promise<void> {
    const cronJobs = this.licenseJobsConfig.getCronJobs();
    const jobConfig = cronJobs.find(job => job.name === jobName);
    
    if (!jobConfig) {
      throw new Error(`Job not found: ${jobName}`);
    }

    console.log(`Manually triggering job: ${jobName}`);
    await this.executeJob(jobConfig);
  }

  /**
   * Get detailed job execution history
   */
  public async getJobHistory(jobName: string, limit: number = 50): Promise<any[]> {
    return await this.dbService.getJobExecutionHistory(jobName, limit);
  }

  /**
   * Get system-wide cron job metrics
   */
  public async getJobMetrics(): Promise<any> {
    return await this.dbService.getCronJobMetrics();
  }
}

export default CronScheduler;