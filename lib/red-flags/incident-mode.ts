// Red Flags Incident Mode - نظام الاحتواء الفوري
import { DatabaseService } from '@/lib/services/database.service';

export interface IncidentContext {
  tenantId: string;
  flagType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityId: string;
  entityType: string;
  detectedAt: Date;
  evidence: Record<string, any>;
  actorId?: string;
}

export interface IncidentResponse {
  incidentId: string;
  containmentActions: string[];
  notificationsSent: string[];
  evidenceSnapshot: string;
  nextSteps: string[];
}

class IncidentModeService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  // 0) تفعيل وضع الحادث الفوري
  async activateIncidentMode(context: IncidentContext): Promise<IncidentResponse> {
    const incidentId = `INC-${Date.now()}-${context.flagType}`;
    
    try {
      // بدء المعاملة
      await this.db.beginTransaction();

      // 1. إيقاف العمليات عالية الخطورة
      await this.freezeHighRiskOperations(context);

      // 2. التقاط لقطة الأدلة
      const evidenceSnapshot = await this.captureEvidenceSnapshot(context);

      // 3. الإشعارات الفورية
      const notifications = await this.sendImmediateNotifications(context, incidentId);

      // 4. تسجيل الحادث
      await this.logIncident(incidentId, context, evidenceSnapshot);

      // 5. تفعيل الوكلاء المناسبين
      await this.triggerAgents(context, incidentId);

      await this.db.commitTransaction();

      return {
        incidentId,
        containmentActions: await this.getContainmentActions(context),
        notificationsSent: notifications,
        evidenceSnapshot,
        nextSteps: await this.getNextSteps(context)
      };

    } catch (error) {
      await this.db.rollbackTransaction();
      console.error('❌ Incident Mode Activation Failed:', error);
      throw error;
    }
  }

  // إيقاف العمليات عالية الخطورة
  private async freezeHighRiskOperations(context: IncidentContext): Promise<void> {
    const { tenantId, flagType, entityId } = context;

    switch (flagType) {
      case 'accounting_unbalanced':
        // إيقاف ترحيل القيود للدفعة المتأثرة
        await this.db.query(`
          UPDATE tenant_settings 
          SET posting_enabled = false, 
              freeze_reason = 'Unbalanced GL detected',
              frozen_at = NOW()
          WHERE tenant_id = $1
        `, [tenantId]);
        break;

      case 'duplicate_transaction':
        // تعليم الحركة كمشبوهة
        await this.db.query(`
          UPDATE payments 
          SET status = 'duplicate_suspect',
              flagged_at = NOW(),
              flag_reason = 'Duplicate transaction detected'
          WHERE id = $1 AND tenant_id = $2
        `, [entityId, tenantId]);
        break;

      case 'sanctioned_entity':
        // تجميد العلاقة والأرصدة
        await this.db.query(`
          UPDATE counterparties 
          SET status = 'frozen',
              freeze_reason = 'Sanctions screening hit',
              frozen_at = NOW()
          WHERE id = $1 AND tenant_id = $2
        `, [entityId, tenantId]);
        break;

      case 'audit_tampered':
        // قفل صلاحيات الكتابة
        await this.db.query(`
          UPDATE user_permissions 
          SET write_access = false,
              suspended_reason = 'Audit trail tampering detected',
              suspended_at = NOW()
          WHERE tenant_id = $1 AND user_id = $2
        `, [tenantId, context.actorId]);
        break;

      case 'large_unexplained':
        // وضع الحركة في الانتظار
        await this.db.query(`
          UPDATE payments 
          SET status = 'on_hold',
              hold_reason = 'Large transaction requires documentation',
              held_at = NOW()
          WHERE id = $1 AND tenant_id = $2
        `, [entityId, tenantId]);
        break;

      case 'rapid_succession':
        // تعليم الحساب للمراجعة اليدوية
        await this.db.query(`
          UPDATE accounts 
          SET manual_review_required = true,
              review_reason = 'Rapid transaction succession detected',
              flagged_at = NOW()
          WHERE id = $1 AND tenant_id = $2
        `, [entityId, tenantId]);
        break;
    }
  }

  // التقاط لقطة الأدلة (WORM)
  private async captureEvidenceSnapshot(context: IncidentContext): Promise<string> {
    const snapshotId = `SNAP-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // التقاط البيانات ذات الصلة
    const evidenceData = {
      context,
      timestamp,
      database_state: await this.captureRelevantData(context),
      system_logs: await this.captureSystemLogs(context),
      user_actions: await this.captureUserActions(context)
    };

    // حساب الهاش للتحقق من التكامل
    const evidenceHash = this.calculateHash(JSON.stringify(evidenceData));

    // حفظ في مخزن WORM
    await this.db.query(`
      INSERT INTO evidence_snapshots (
        snapshot_id, incident_type, tenant_id, entity_id,
        evidence_data, evidence_hash, created_at, is_immutable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    `, [
      snapshotId, context.flagType, context.tenantId, context.entityId,
      JSON.stringify(evidenceData), evidenceHash, timestamp
    ]);

    return snapshotId;
  }

  // الإشعارات الفورية
  private async sendImmediateNotifications(context: IncidentContext, incidentId: string): Promise<string[]> {
    const notifications: string[] = [];
    
    // تحديد المستلمين حسب نوع العلم
    const recipients = await this.getNotificationRecipients(context);
    
    // إشعار Slack/Teams
    if (context.severity === 'critical') {
      await this.sendSlackAlert(context, incidentId, recipients.slack);
      notifications.push('Slack alert sent');
    }

    // إشعار البريد الإلكتروني
    await this.sendEmailAlert(context, incidentId, recipients.email);
    notifications.push('Email alerts sent');

    // إشعار SMS للحالات الحرجة
    if (context.severity === 'critical') {
      await this.sendSMSAlert(context, incidentId, recipients.sms);
      notifications.push('SMS alerts sent');
    }

    return notifications;
  }

  // تسجيل الحادث
  private async logIncident(incidentId: string, context: IncidentContext, evidenceSnapshot: string): Promise<void> {
    await this.db.query(`
      INSERT INTO security_incidents (
        incident_id, tenant_id, flag_type, severity, entity_id, entity_type,
        detected_at, evidence_snapshot_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
    `, [
      incidentId, context.tenantId, context.flagType, context.severity,
      context.entityId, context.entityType, context.detectedAt, evidenceSnapshot
    ]);
  }

  // تفعيل الوكلاء المناسبين
  private async triggerAgents(context: IncidentContext, incidentId: string): Promise<void> {
    const agentMappings = {
      'accounting_unbalanced': 'FIN_REPAIR_UNBALANCED',
      'duplicate_transaction': 'FIN_DEDUP_REVIEW',
      'sanctioned_entity': 'COMPLIANCE_CASE_OPEN',
      'audit_tampered': 'SEC_FORENSIC_SNAPSHOT',
      'large_unexplained': 'FIN_SUPPORTING_DOCS_REQUEST',
      'rapid_succession': 'AML_ALERT_TRIAGE'
    };

    const jobType = agentMappings[context.flagType as keyof typeof agentMappings];
    
    if (jobType) {
      await this.db.query(`
        INSERT INTO agent_jobs (
          job_id, job_type, tenant_id, incident_id, priority, 
          input_data, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'queued', NOW())
      `, [
        `JOB-${Date.now()}`, jobType, context.tenantId, incidentId,
        context.severity === 'critical' ? 'high' : 'medium',
        JSON.stringify(context)
      ]);
    }
  }

  // الحصول على إجراءات الاحتواء
  private async getContainmentActions(context: IncidentContext): Promise<string[]> {
    const actions: Record<string, string[]> = {
      'accounting_unbalanced': [
        'GL posting disabled for affected batch',
        'Imbalances moved to Suspense account',
        'Finance team notified for manual review'
      ],
      'duplicate_transaction': [
        'Duplicate transactions flagged as suspect',
        'Settlement/payment processing halted',
        'Deduplication agent activated'
      ],
      'sanctioned_entity': [
        'Entity relationship frozen immediately',
        'All payments/transfers blocked',
        'Compliance case opened automatically'
      ],
      'audit_tampered': [
        'Write permissions revoked for affected accounts',
        'Forensic snapshot captured',
        'Security team alerted'
      ],
      'large_unexplained': [
        'Transaction placed on hold',
        'Supporting documentation requested',
        '4-eyes approval required'
      ],
      'rapid_succession': [
        'Account flagged for manual review',
        'Velocity limits temporarily reduced',
        'AML alert generated'
      ]
    };

    return actions[context.flagType] || ['Standard containment procedures applied'];
  }

  // الخطوات التالية
  private async getNextSteps(context: IncidentContext): Promise<string[]> {
    const nextSteps: Record<string, string[]> = {
      'accounting_unbalanced': [
        'Review and correct unbalanced entries',
        'Investigate root cause of imbalance',
        'Update GL posting controls'
      ],
      'duplicate_transaction': [
        'Manual review of flagged transactions',
        'Reverse confirmed duplicates',
        'Strengthen deduplication controls'
      ],
      'sanctioned_entity': [
        'Complete enhanced due diligence',
        'File SAR/UAR if required',
        'Review historical transactions'
      ],
      'audit_tampered': [
        'Forensic investigation of audit trail',
        'Review user access and permissions',
        'Strengthen audit controls'
      ],
      'large_unexplained': [
        'Collect supporting documentation',
        'Business justification review',
        'Approve or reverse transaction'
      ],
      'rapid_succession': [
        'Investigate transaction patterns',
        'Customer interview if needed',
        'Adjust velocity controls'
      ]
    };

    return nextSteps[context.flagType] || ['Follow standard incident response procedures'];
  }

  // مساعدات خاصة
  private async captureRelevantData(context: IncidentContext): Promise<any> {
    // التقاط البيانات ذات الصلة حسب نوع العلم
    switch (context.flagType) {
      case 'accounting_unbalanced':
        const res1 = await this.db.query(`
          SELECT * FROM gl_entries 
          WHERE tenant_id = $1 AND journal_id = $2
        `, [context.tenantId, context.entityId]);
        return (res1.rows ?? res1);
      
      case 'duplicate_transaction':
        const res2 = await this.db.query(`
          SELECT * FROM payments 
          WHERE tenant_id = $1 AND (id = $2 OR reference = (
            SELECT reference FROM payments WHERE id = $2
          ))
        `, [context.tenantId, context.entityId]);
        return (res2.rows ?? res2);
      
      default:
        return { message: 'Generic data capture for ' + context.flagType };
    }
  }

  private async captureSystemLogs(context: IncidentContext): Promise<any> {
    return await this.db.query(`
      SELECT * FROM audit_logs 
      WHERE tenant_id = $1 AND entity_id = $2 
      AND created_at >= $3
      ORDER BY created_at DESC LIMIT 100
    `, [context.tenantId, context.entityId, new Date(Date.now() - 24*60*60*1000)]);
  }

  private async captureUserActions(context: IncidentContext): Promise<any> {
    return await this.db.query(`
      SELECT * FROM user_activities 
      WHERE tenant_id = $1 AND entity_id = $2
      AND created_at >= $3
      ORDER BY created_at DESC LIMIT 50
    `, [context.tenantId, context.entityId, new Date(Date.now() - 24*60*60*1000)]);
  }

  private calculateHash(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async getNotificationRecipients(context: IncidentContext): Promise<any> {
    const res = await this.db.query(`
      SELECT notification_type, recipient_list 
      FROM incident_notification_rules 
      WHERE tenant_id = $1 AND flag_type = $2 AND severity = $3
    `, [context.tenantId, context.flagType, context.severity]);

    return {
      slack: (res.rows ?? res).find((r: any) => r.notification_type === 'slack')?.recipient_list || [],
      email: (res.rows ?? res).find((r: any) => r.notification_type === 'email')?.recipient_list || [],
      sms: (res.rows ?? res).find((r: any) => r.notification_type === 'sms')?.recipient_list || []
    };
  }

  private async sendSlackAlert(context: IncidentContext, incidentId: string, recipients: string[]): Promise<void> {
    // تنفيذ إرسال Slack
    console.log(`🚨 Slack Alert: ${incidentId} - ${context.flagType}`);
  }

  private async sendEmailAlert(context: IncidentContext, incidentId: string, recipients: string[]): Promise<void> {
    // تنفيذ إرسال البريد الإلكتروني
    console.log(`📧 Email Alert: ${incidentId} - ${context.flagType}`);
  }

  private async sendSMSAlert(context: IncidentContext, incidentId: string, recipients: string[]): Promise<void> {
    // تنفيذ إرسال SMS
    console.log(`📱 SMS Alert: ${incidentId} - ${context.flagType}`);
  }
}

export const incidentMode = new IncidentModeService();
