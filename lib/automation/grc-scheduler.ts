/**
 * GRC AI Scheduler & CCM Automation
 * Intelligent scheduling and continuous control monitoring
 */

export interface ScheduleRule {
  id: string;
  control_id: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'On-event';
  owner_id: string;
  next_due_date: Date;
  timezone: string;
  business_hours_only: boolean;
  exclude_holidays: boolean;
  load_balancing: boolean;
}

export interface CCMConnector {
  id: string;
  name: string;
  type: 'SIEM' | 'IAM' | 'Config_Mgmt' | 'Ticketing' | 'Database';
  connection_details: {
    endpoint: string;
    auth_type: 'api_key' | 'oauth' | 'basic';
    credentials: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error';
  last_sync: Date;
  health_check_interval: number;
}

export interface CCMRule {
  id: string;
  control_id: string;
  connector_id: string;
  rule_logic: {
    query: string;
    thresholds: {
      warning: number;
      critical: number;
    };
    aggregation: 'count' | 'sum' | 'avg' | 'max' | 'min';
    time_window: string; // e.g., '1h', '24h', '7d'
  };
  alert_frequency: 'immediate' | 'daily' | 'weekly';
  enabled: boolean;
}

export class GRCAIScheduler {
  private schedules: Map<string, ScheduleRule> = new Map();
  private holidays: Date[] = [];

  constructor() {
    this.loadHolidays();
  }

  /**
   * Generate intelligent schedule for control based on frequency and constraints
   */
  generateSchedule(
    controlId: string, 
    frequency: string, 
    ownerId: string, 
    startDate: Date = new Date()
  ): ScheduleRule {
    const rule: ScheduleRule = {
      id: `schedule-${controlId}-${Date.now()}`,
      control_id: controlId,
      frequency: frequency as any,
      owner_id: ownerId,
      next_due_date: this.calculateNextDueDate(frequency, startDate),
      timezone: 'Asia/Riyadh', // Default to Saudi timezone
      business_hours_only: true,
      exclude_holidays: true,
      load_balancing: true
    };

    this.schedules.set(rule.id, rule);
    return rule;
  }

  /**
   * Calculate next due date based on frequency with AI optimization
   */
  private calculateNextDueDate(frequency: string, fromDate: Date): Date {
    const date = new Date(fromDate);
    
    switch (frequency) {
      case 'Daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'Weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'Quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Annual':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setDate(date.getDate() + 30); // Default to monthly
    }

    // Apply business rules
    return this.optimizeScheduleDate(date);
  }

  /**
   * Optimize schedule date considering holidays, weekends, and load balancing
   */
  private optimizeScheduleDate(date: Date): Date {
    let optimizedDate = new Date(date);

    // Skip weekends (Friday-Saturday in Saudi Arabia)
    while (optimizedDate.getDay() === 5 || optimizedDate.getDay() === 6) {
      optimizedDate.setDate(optimizedDate.getDate() + 1);
    }

    // Skip holidays
    while (this.isHoliday(optimizedDate)) {
      optimizedDate.setDate(optimizedDate.getDate() + 1);
      // Re-check for weekends after holiday adjustment
      while (optimizedDate.getDay() === 5 || optimizedDate.getDay() === 6) {
        optimizedDate.setDate(optimizedDate.getDate() + 1);
      }
    }

    // Load balancing - spread tasks across the month
    optimizedDate = this.applyLoadBalancing(optimizedDate);

    return optimizedDate;
  }

  /**
   * Apply load balancing to distribute workload evenly
   */
  private applyLoadBalancing(date: Date): Date {
    // Get all schedules for the same month
    const monthSchedules = Array.from(this.schedules.values()).filter(s => 
      s.next_due_date.getMonth() === date.getMonth() &&
      s.next_due_date.getFullYear() === date.getFullYear()
    );

    // If too many tasks on the same day, spread them out
    const sameDay = monthSchedules.filter(s => 
      s.next_due_date.getDate() === date.getDate()
    );

    if (sameDay.length > 5) { // Max 5 tasks per day
      // Find the next available day with fewer tasks
      let adjustedDate = new Date(date);
      let attempts = 0;
      
      while (attempts < 10) { // Prevent infinite loop
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        const dayTasks = monthSchedules.filter(s => 
          s.next_due_date.getDate() === adjustedDate.getDate()
        );
        
        if (dayTasks.length < 5 && !this.isHoliday(adjustedDate) && 
            adjustedDate.getDay() !== 5 && adjustedDate.getDay() !== 6) {
          return adjustedDate;
        }
        attempts++;
      }
    }

    return date;
  }

  /**
   * Check if date is a holiday
   */
  private isHoliday(date: Date): boolean {
    return this.holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
    );
  }

  /**
   * Load Saudi holidays and Islamic calendar dates
   */
  private loadHolidays() {
    const currentYear = new Date().getFullYear();
    
    // Saudi National holidays (approximate dates)
    this.holidays = [
      new Date(currentYear, 8, 23), // National Day (Sept 23)
      new Date(currentYear, 1, 22), // Founding Day (Feb 22)
      // Islamic holidays would be calculated based on lunar calendar
      // This is a simplified version
    ];
  }

  /**
   * Get upcoming schedules for a specific owner
   */
  getOwnerSchedules(ownerId: string, days: number = 30): ScheduleRule[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return Array.from(this.schedules.values())
      .filter(s => s.owner_id === ownerId && s.next_due_date <= cutoffDate)
      .sort((a, b) => a.next_due_date.getTime() - b.next_due_date.getTime());
  }

  /**
   * Update schedule after task completion
   */
  updateScheduleAfterCompletion(scheduleId: string, completionDate: Date) {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.next_due_date = this.calculateNextDueDate(schedule.frequency, completionDate);
      this.schedules.set(scheduleId, schedule);
    }
  }
}

export class CCMAutomation {
  private connectors: Map<string, CCMConnector> = new Map();
  private rules: Map<string, CCMRule> = new Map();
  private alertQueue: any[] = [];

  /**
   * Register a new CCM connector
   */
  registerConnector(connector: CCMConnector): void {
    this.connectors.set(connector.id, connector);
    this.startHealthCheck(connector.id);
  }

  /**
   * Create a new CCM rule
   */
  createRule(rule: CCMRule): void {
    this.rules.set(rule.id, rule);
    if (rule.enabled) {
      this.startRuleMonitoring(rule.id);
    }
  }

  /**
   * Start health check for connector
   */
  private startHealthCheck(connectorId: string): void {
    const connector = this.connectors.get(connectorId);
    if (!connector) return;

    setInterval(async () => {
      try {
        const isHealthy = await this.checkConnectorHealth(connector);
        connector.status = isHealthy ? 'active' : 'error';
        connector.last_sync = new Date();
        this.connectors.set(connectorId, connector);
      } catch (error) {
        console.error(`Health check failed for connector ${connectorId}:`, error);
        connector.status = 'error';
        this.connectors.set(connectorId, connector);
      }
    }, connector.health_check_interval * 1000);
  }

  /**
   * Check connector health
   */
  private async checkConnectorHealth(connector: CCMConnector): Promise<boolean> {
    try {
      // Implement actual health check based on connector type
      switch (connector.type) {
        case 'SIEM':
          return await this.checkSIEMHealth(connector);
        case 'IAM':
          return await this.checkIAMHealth(connector);
        case 'Config_Mgmt':
          return await this.checkConfigMgmtHealth(connector);
        case 'Ticketing':
          return await this.checkTicketingHealth(connector);
        case 'Database':
          return await this.checkDatabaseHealth(connector);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Start monitoring for a specific rule
   */
  private startRuleMonitoring(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    const connector = this.connectors.get(rule.connector_id);
    if (!connector || connector.status !== 'active') return;

    // Set up monitoring interval based on rule requirements
    const interval = this.getMonitoringInterval(rule);
    
    setInterval(async () => {
      try {
        const result = await this.executeRule(rule, connector);
        if (result.shouldAlert) {
          this.generateAlert(rule, result);
        }
      } catch (error) {
        console.error(`Rule execution failed for ${ruleId}:`, error);
      }
    }, interval);
  }

  /**
   * Execute a CCM rule
   */
  private async executeRule(rule: CCMRule, connector: CCMConnector): Promise<any> {
    // Execute the rule logic against the connector
    const data = await this.queryConnector(connector, rule.rule_logic.query);
    const value = this.aggregateData(data, rule.rule_logic.aggregation);
    
    let alertLevel = 'info';
    let shouldAlert = false;

    if (value >= rule.rule_logic.thresholds.critical) {
      alertLevel = 'critical';
      shouldAlert = true;
    } else if (value >= rule.rule_logic.thresholds.warning) {
      alertLevel = 'warning';
      shouldAlert = rule.alert_frequency === 'immediate';
    }

    return {
      value,
      alertLevel,
      shouldAlert,
      timestamp: new Date(),
      data
    };
  }

  /**
   * Generate alert from rule execution
   */
  private generateAlert(rule: CCMRule, result: any): void {
    const alert = {
      id: `alert-${rule.id}-${Date.now()}`,
      rule_id: rule.id,
      control_id: rule.control_id,
      alert_type: result.alertLevel,
      alert_message_en: `Control monitoring alert: ${result.alertLevel} threshold exceeded`,
      alert_message_ar: `تنبيه مراقبة الضوابط: تم تجاوز حد ${result.alertLevel}`,
      alert_data: result.data,
      anomaly_score: this.calculateAnomalyScore(result.value, rule.rule_logic.thresholds),
      status: 'open',
      created_at: new Date()
    };

    this.alertQueue.push(alert);
    this.processAlertQueue();
  }

  /**
   * Process alert queue
   */
  private processAlertQueue(): void {
    // Process alerts based on frequency settings
    this.alertQueue.forEach(alert => {
      // Send to notification system
      this.sendAlert(alert);
    });
    
    // Clear processed alerts
    this.alertQueue = [];
  }

  /**
   * Send alert to notification system
   */
  private sendAlert(alert: any): void {
    // Implement actual alert sending (email, SMS, webhook, etc.)
    console.log('Alert generated:', alert);
  }

  /**
   * Calculate anomaly score
   */
  private calculateAnomalyScore(value: number, thresholds: any): number {
    if (value >= thresholds.critical) {
      return Math.min(100, (value / thresholds.critical) * 100);
    } else if (value >= thresholds.warning) {
      return Math.min(80, (value / thresholds.warning) * 80);
    }
    return 0;
  }

  // Connector-specific health check methods
  private async checkSIEMHealth(connector: CCMConnector): Promise<boolean> {
    // Implement SIEM-specific health check
    return true;
  }

  private async checkIAMHealth(connector: CCMConnector): Promise<boolean> {
    // Implement IAM-specific health check
    return true;
  }

  private async checkConfigMgmtHealth(connector: CCMConnector): Promise<boolean> {
    // Implement Config Management-specific health check
    return true;
  }

  private async checkTicketingHealth(connector: CCMConnector): Promise<boolean> {
    // Implement Ticketing system-specific health check
    return true;
  }

  private async checkDatabaseHealth(connector: CCMConnector): Promise<boolean> {
    // Implement Database-specific health check
    return true;
  }

  private async queryConnector(connector: CCMConnector, query: string): Promise<any> {
    // Implement actual connector querying
    return [];
  }

  private aggregateData(data: any[], aggregation: string): number {
    switch (aggregation) {
      case 'count':
        return data.length;
      case 'sum':
        return data.reduce((sum, item) => sum + (item.value || 0), 0);
      case 'avg':
        return data.length > 0 ? data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length : 0;
      case 'max':
        return Math.max(...data.map(item => item.value || 0));
      case 'min':
        return Math.min(...data.map(item => item.value || 0));
      default:
        return 0;
    }
  }

  private getMonitoringInterval(rule: CCMRule): number {
    // Return interval in milliseconds
    switch (rule.alert_frequency) {
      case 'immediate':
        return 60000; // 1 minute
      case 'daily':
        return 3600000; // 1 hour
      case 'weekly':
        return 86400000; // 1 day
      default:
        return 300000; // 5 minutes
    }
  }
}

// Export singleton instances
export const grcScheduler = new GRCAIScheduler();
export const ccmAutomation = new CCMAutomation();
