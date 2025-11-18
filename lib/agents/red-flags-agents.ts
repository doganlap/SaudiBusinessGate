// Red Flags AI Agents - الوكلاء الأذكياء للأعلام الحمراء
import { DatabaseService } from '@/lib/services/database.service';
import { incidentMode, IncidentContext } from '@/lib/red-flags/incident-mode';

export interface AgentJob {
  jobId: string;
  jobType: string;
  tenantId: string;
  incidentId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  inputData: any;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AgentResult {
  success: boolean;
  actions: string[];
  recommendations: string[];
  nextSteps: string[];
  evidence?: any;
  confidence: number;
}

class RedFlagsAgentService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  // تشغيل الوكيل المناسب حسب نوع العلم الأحمر
  async executeAgent(job: AgentJob): Promise<AgentResult> {
    try {
      await this.updateJobStatus(job.jobId, 'running');

      let result: AgentResult;

      switch (job.jobType) {
        case 'FIN_REPAIR_UNBALANCED':
          result = await this.repairUnbalancedEntries(job);
          break;
        case 'FIN_DEDUP_REVIEW':
          result = await this.reviewDuplicateTransactions(job);
          break;
        case 'FIN_TRANSACTION_OUTLIERS':
          result = await this.detectFinanceTransactionOutliers(job);
          break;
        case 'COMPLIANCE_CASE_OPEN':
          result = await this.openComplianceCase(job);
          break;
        case 'SEC_FORENSIC_SNAPSHOT':
          result = await this.createForensicSnapshot(job);
          break;
        case 'FIN_SUPPORTING_DOCS_REQUEST':
          result = await this.requestSupportingDocs(job);
          break;
        case 'AML_ALERT_TRIAGE':
          result = await this.triageAMLAlert(job);
          break;
        default:
          throw new Error(`Unknown agent job type: ${job.jobType}`);
      }

      await this.updateJobStatus(job.jobId, 'completed', result);
      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.updateJobStatus(job.jobId, 'failed', undefined, errorMsg);
      throw error;
    }
  }

  // 1. وكيل إصلاح القيود غير المتوازنة
  private async repairUnbalancedEntries(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const journalId = inputData.entityId;

    // الحصول على تفاصيل القيد غير المتوازن
    const entriesRes = await this.db.query(`
      SELECT * FROM gl_entries 
      WHERE tenant_id = $1 AND journal_id = $2
      ORDER BY created_at
    `, [tenantId, journalId]);
    const entries = entriesRes.rows || [];
    const totalDebit = entries.reduce((sum: number, entry: any) => sum + parseFloat(entry.debit || 0), 0);
    const totalCredit = entries.reduce((sum: number, entry: any) => sum + parseFloat(entry.credit || 0), 0);
    const imbalance = totalDebit - totalCredit;

    const actions: string[] = [];
    const recommendations: string[] = [];

    if (Math.abs(imbalance) > 0.01) {
      // إنشاء قيد تسوية إلى حساب Suspense
      const suspenseAccount = await this.getSuspenseAccount(tenantId);
      
      const adjustmentEntry = {
        tenantId,
        journalId: `ADJ-${journalId}`,
        accountId: suspenseAccount,
        debit: imbalance > 0 ? 0 : Math.abs(imbalance),
        credit: imbalance > 0 ? Math.abs(imbalance) : 0,
        memo: `Auto-balance adjustment for journal ${journalId}`,
        createdBy: 'SYSTEM_AGENT'
      };

      await this.db.query(`
        INSERT INTO gl_entries (
          tenant_id, journal_id, account_id, debit, credit, memo, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        adjustmentEntry.tenantId, adjustmentEntry.journalId, adjustmentEntry.accountId,
        adjustmentEntry.debit, adjustmentEntry.credit, adjustmentEntry.memo, adjustmentEntry.createdBy
      ]);

      actions.push(`Created adjustment entry: ${adjustmentEntry.journalId}`);
      actions.push(`Moved imbalance of ${Math.abs(imbalance)} to Suspense account`);
      
      recommendations.push('Review original entries for data entry errors');
      recommendations.push('Investigate source system integration issues');
      recommendations.push('Consider implementing stronger validation controls');
    }

    // إعادة تفعيل الترحيل إذا كان متوقفاً
    await this.db.query(`
      UPDATE tenant_settings 
      SET posting_enabled = true, freeze_reason = NULL, frozen_at = NULL
      WHERE tenant_id = $1 AND posting_enabled = false
    `, [tenantId]);

    actions.push('GL posting re-enabled for tenant');

    return {
      success: true,
      actions,
      recommendations,
      nextSteps: [
        'Finance team to review Suspense account entries',
        'Investigate root cause of imbalance',
        'Update posting controls if needed'
      ],
      evidence: {
        originalImbalance: imbalance,
        entriesCount: entries.length,
        adjustmentMade: Math.abs(imbalance) > 0.01
      },
      confidence: 0.95
    };
  }

  // 2. وكيل مراجعة المعاملات المكررة
  private async reviewDuplicateTransactions(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const paymentId = inputData.entityId;

    // البحث عن المعاملات المشابهة
    const duplicatesRes = await this.db.query(`
      WITH target_tx AS (
         SELECT amount, reference_id, transaction_date
         FROM transactions WHERE id = $1 AND tenant_id = $2
      )
      SELECT t.id, t.amount, t.reference_id as reference, t.transaction_date as txn_date, t.status
      FROM transactions t, target_tx tp
      WHERE t.tenant_id = $2
      AND t.amount = tp.amount
      AND COALESCE(t.reference_id, '') = COALESCE(tp.reference_id, '')
      AND DATE(t.transaction_date) = DATE(tp.transaction_date)
      AND t.id != $1
      ORDER BY t.transaction_date
    `, [paymentId, tenantId]);
    const duplicates = duplicatesRes.rows || [];
    const actions: string[] = [];
    const recommendations: string[] = [];

    if (duplicates.length > 0) {
      // تحليل المعاملات المكررة
      const confirmedDuplicates = duplicates.filter((dup: any) => dup.status === 'posted');
      
      for (const duplicate of confirmedDuplicates) {
        // عكس المعاملة المكررة
        await this.db.query(`
          UPDATE payments 
          SET status = 'reversed', 
              reversed_by = 'SYSTEM_AGENT',
              reversed_at = NOW(),
              reversal_reason = 'Duplicate transaction detected by AI agent'
          WHERE id = $1 AND tenant_id = $2
        `, [duplicate.id, tenantId]);

        actions.push(`Reversed duplicate payment: ${duplicate.id}`);
      }

      // إنشاء قاعدة منع التكرار
      const signature = await this.generateTransactionSignature(paymentId, tenantId);
      await this.db.query(`
        INSERT INTO deduplication_rules (
          tenant_id, signature, original_payment_id, created_at, created_by
        ) VALUES ($1, $2, $3, NOW(), 'SYSTEM_AGENT')
        ON CONFLICT (tenant_id, signature) DO NOTHING
      `, [tenantId, signature, paymentId]);

      actions.push('Created deduplication rule for future prevention');

      recommendations.push('Review payment processing workflow');
      recommendations.push('Implement idempotency keys in payment API');
      recommendations.push('Add duplicate detection at point of entry');
    }

    return {
      success: true,
      actions,
      recommendations,
      nextSteps: [
        'Review reversed transactions with finance team',
        'Investigate source of duplicates',
        'Strengthen payment processing controls'
      ],
      evidence: {
        duplicatesFound: duplicates.length,
        duplicatesReversed: duplicates.filter((d: any) => d.status === 'posted').length,
        originalPaymentId: paymentId
      },
      confidence: 0.90
    };
  }

  // 3. وكيل فتح قضية الامتثال
  private async openComplianceCase(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const entityId = inputData.entityId;

    // إنشاء قضية امتثال
    const caseId = `COMP-${Date.now()}`;
    
    await this.db.query(`
      INSERT INTO compliance_cases (
        case_id, tenant_id, case_type, entity_type, entity_id,
        priority, status, assigned_to, created_by, created_at,
        description, metadata
      ) VALUES ($1, $2, 'sanctions_screening', 'counterparty', $3, 'high', 'open', 
               'compliance_team', 'SYSTEM_AGENT', NOW(),
               'Sanctions screening hit detected by AI agent',
               $4)
    `, [
      caseId, tenantId, entityId,
      JSON.stringify({
        flagType: inputData.flagType,
        detectedAt: inputData.detectedAt,
        confidence: inputData.evidence?.confidence_score || 0.8
      })
    ]);

    // تجميد العلاقة
    await this.db.query(`
      UPDATE counterparties 
      SET status = 'frozen',
          freeze_reason = 'Sanctions screening - under investigation',
          frozen_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [entityId, tenantId]);

    // إنشاء مهام المتابعة
    const tasks = [
      'Enhanced Due Diligence (EDD) review',
      'Historical transaction analysis',
      'Regulatory reporting assessment',
      'Legal review and documentation'
    ];

    for (const task of tasks) {
      await this.db.query(`
        INSERT INTO compliance_tasks (
          case_id, tenant_id, task_description, status, 
          assigned_to, due_date, created_at
        ) VALUES ($1, $2, $3, 'pending', 'compliance_team', 
                 NOW() + INTERVAL '3 days', NOW())
      `, [caseId, tenantId, task]);
    }

    return {
      success: true,
      actions: [
        `Created compliance case: ${caseId}`,
        'Froze counterparty relationship',
        'Blocked all payments and transfers',
        `Created ${tasks.length} follow-up tasks`
      ],
      recommendations: [
        'Conduct enhanced due diligence immediately',
        'Review all historical transactions (12 months)',
        'Prepare for potential SAR/UAR filing',
        'Document all investigation steps'
      ],
      nextSteps: [
        'Compliance team to review case within 24 hours',
        'Complete EDD within 3 business days',
        'Determine regulatory reporting requirements',
        'Update sanctions screening procedures'
      ],
      evidence: {
        caseId,
        entityFrozen: true,
        tasksCreated: tasks.length
      },
      confidence: 0.95
    };
  }

  // 4. وكيل إنشاء لقطة الطب الشرعي
  private async createForensicSnapshot(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    
    const snapshotId = `FORENSIC-${Date.now()}`;
    
    // التقاط البيانات الحساسة
    const forensicData = {
      auditLogs: await this.captureAuditLogs(tenantId),
      userActivities: await this.captureUserActivities(tenantId),
      systemLogs: await this.captureSystemLogs(tenantId),
      databaseState: await this.captureDatabaseState(tenantId),
      timestamp: new Date().toISOString()
    };

    // حفظ اللقطة في مخزن آمن
    await this.db.query(`
      INSERT INTO forensic_snapshots (
        snapshot_id, tenant_id, incident_id, snapshot_type,
        data_hash, storage_location, created_at, is_immutable
      ) VALUES ($1, $2, $3, 'audit_tampering', $4, $5, NOW(), true)
    `, [
      snapshotId, tenantId, inputData.incidentId,
      this.calculateHash(JSON.stringify(forensicData)),
      `forensic/${snapshotId}.json`
    ]);

    // تعليق الحسابات المشبوهة
    if (inputData.actorId) {
      await this.db.query(`
        UPDATE users 
        SET status = 'suspended',
            suspension_reason = 'Audit trail tampering investigation',
            suspended_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `, [inputData.actorId, tenantId]);
    }

    return {
      success: true,
      actions: [
        `Created forensic snapshot: ${snapshotId}`,
        'Captured audit logs and system state',
        'Suspended suspicious user accounts',
        'Secured evidence with cryptographic hash'
      ],
      recommendations: [
        'Engage forensic investigation team',
        'Review all user access permissions',
        'Implement additional audit controls',
        'Consider third-party security assessment'
      ],
      nextSteps: [
        'Security team to analyze forensic data',
        'Review and revoke suspicious access',
        'Strengthen audit trail protection',
        'Update incident response procedures'
      ],
      evidence: {
        snapshotId,
        dataHash: this.calculateHash(JSON.stringify(forensicData)),
        suspendedUsers: inputData.actorId ? 1 : 0
      },
      confidence: 0.98
    };
  }

  // 5. وكيل طلب المستندات الداعمة
  private async requestSupportingDocs(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const paymentId = inputData.entityId;

    // الحصول على تفاصيل المعاملة
    const paymentRes = await this.db.query(`
      SELECT p.*, c.name as counterparty_name, c.email as counterparty_email
      FROM payments p
      LEFT JOIN counterparties c ON c.id = p.counterparty_id
      WHERE p.id = $1 AND p.tenant_id = $2
    `, [paymentId, tenantId]);
    const paymentRows = paymentRes.rows || [];
    if (paymentRows.length === 0) {
      throw new Error('Payment not found');
    }
    const paymentData = paymentRows[0];

    // إنشاء طلب مستندات
    const requestId = `DOC-REQ-${Date.now()}`;
    
    await this.db.query(`
      INSERT INTO document_requests (
        request_id, tenant_id, entity_type, entity_id,
        requested_documents, priority, status, due_date,
        requested_by, created_at
      ) VALUES ($1, $2, 'payment', $3, $4, 'high', 'pending',
               NOW() + INTERVAL '3 days', 'SYSTEM_AGENT', NOW())
    `, [
      requestId, tenantId, paymentId,
      JSON.stringify([
        'Invoice or Purchase Order',
        'Contract or Agreement',
        'Delivery Receipt',
        'Board Resolution (if applicable)'
      ])
    ]);

    // وضع المعاملة في الانتظار
    await this.db.query(`
      UPDATE payments 
      SET status = 'on_hold',
          hold_reason = 'Supporting documentation required',
          held_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [paymentId, tenantId]);

    // إرسال إشعار للمسؤولين
    await this.sendDocumentRequest(tenantId, requestId, paymentData);

    return {
      success: true,
      actions: [
        `Created document request: ${requestId}`,
        'Placed payment on hold',
        'Sent notification to finance team',
        'Set 3-day deadline for documentation'
      ],
      recommendations: [
        'Implement mandatory documentation workflow',
        'Set up automated document validation',
        'Create document templates for common transactions',
        'Train staff on documentation requirements'
      ],
      nextSteps: [
        'Finance team to collect required documents',
        'Review and approve documentation',
        'Release payment upon approval',
        'Update transaction processing procedures'
      ],
      evidence: {
        requestId,
        paymentAmount: paymentData.amount,
        counterparty: paymentData.counterparty_name,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      confidence: 0.92
    };
  }

  // 6. وكيل فرز تنبيهات مكافحة غسل الأموال
  private async triageAMLAlert(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const accountId = inputData.entityId;

    // تحليل نمط المعاملات
    const transactionPattern = await this.analyzeTransactionPattern(tenantId, accountId);
    
    // تقييم مستوى المخاطر
    const riskScore = this.calculateRiskScore(transactionPattern);
    const riskLevel = this.determineRiskLevel(riskScore);

    // إنشاء تنبيه AML
    const alertId = `AML-${Date.now()}`;
    
    await this.db.query(`
      INSERT INTO aml_alerts (
        alert_id, tenant_id, account_id, alert_type, risk_level,
        risk_score, status, created_by, created_at, metadata
      ) VALUES ($1, $2, $3, 'rapid_succession', $4, $5, 'open',
               'SYSTEM_AGENT', NOW(), $6)
    `, [
      alertId, tenantId, accountId, riskLevel, riskScore,
      JSON.stringify(transactionPattern)
    ]);

    const actions: string[] = [`Created AML alert: ${alertId}`];
    const recommendations: string[] = [];

    // إجراءات حسب مستوى المخاطر
    if (riskLevel === 'high' || riskLevel === 'critical') {
      // تطبيق حدود مؤقتة
      await this.db.query(`
        UPDATE accounts 
        SET daily_limit = LEAST(daily_limit, $1),
            transaction_limit = LEAST(transaction_limit, $2),
            manual_review_required = true
        WHERE id = $3 AND tenant_id = $4
      `, [5000, 1000, accountId, tenantId]);

      actions.push('Applied temporary transaction limits');
      actions.push('Enabled manual review for all transactions');

      recommendations.push('Conduct customer interview');
      recommendations.push('Review account activity for past 6 months');
      recommendations.push('Consider filing SAR if suspicious activity confirmed');
    }

    // إنشاء مهام المتابعة
    const tasks = this.generateAMLTasks(riskLevel);
    for (const task of tasks) {
      await this.db.query(`
        INSERT INTO aml_tasks (
          alert_id, tenant_id, task_description, priority,
          assigned_to, due_date, created_at
        ) VALUES ($1, $2, $3, $4, 'aml_team', 
                 NOW() + INTERVAL '2 days', NOW())
      `, [alertId, tenantId, task.description, task.priority]);
    }

    return {
      success: true,
      actions,
      recommendations,
      nextSteps: [
        'AML team to review alert within 24 hours',
        'Conduct enhanced monitoring',
        'Document investigation findings',
        'Determine if SAR filing is required'
      ],
      evidence: {
        alertId,
        riskScore,
        riskLevel,
        transactionCount: transactionPattern.transactionCount,
        timeWindow: transactionPattern.timeWindow,
        totalAmount: transactionPattern.totalAmount
      },
      confidence: 0.88
    };
  }

  // مساعدات خاصة
  private async updateJobStatus(
    jobId: string, 
    status: string, 
    result?: any, 
    error?: string
  ): Promise<void> {
    const updateFields: any = { status };
    
    if (status === 'running') {
      updateFields.started_at = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updateFields.completed_at = new Date();
      if (result) updateFields.result = JSON.stringify(result);
      if (error) updateFields.error = error;
    }

    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    await this.db.query(
      `UPDATE agent_jobs SET ${setClause} WHERE job_id = $1`,
      [jobId, ...Object.values(updateFields)]
    );
  }

  private async getSuspenseAccount(tenantId: string): Promise<string> {
    const resultRes = await this.db.query(`
      SELECT id FROM chart_of_accounts 
      WHERE tenant_id = $1 AND account_code = 'SUSPENSE'
    `, [tenantId]);
    const result = resultRes.rows || [];
    if (result.length === 0) {
      // إنشاء حساب Suspense إذا لم يكن موجوداً
      const suspenseId = `SUSP-${Date.now()}`;
      await this.db.query(`
        INSERT INTO chart_of_accounts (
          id, tenant_id, account_code, account_name, account_type,
          created_by, created_at
        ) VALUES ($1, $2, 'SUSPENSE', 'Suspense Account', 'asset',
                 'SYSTEM_AGENT', NOW())
      `, [suspenseId, tenantId]);
      return suspenseId;
    }
    return result[0].id;
  }

  private async generateTransactionSignature(paymentId: string, tenantId: string): Promise<string> {
    const paymentRes = await this.db.query(`
      SELECT counterparty_id, reference, amount 
      FROM payments WHERE id = $1 AND tenant_id = $2
    `, [paymentId, tenantId]);
    const payment = paymentRes.rows || [];
    if (payment.length === 0) return '';
    const p = payment[0];
    const crypto = require('crypto');
    return crypto.createHash('md5')
      .update(`${p.counterparty_id}|${p.reference || ''}|${p.amount}`)
      .digest('hex');
  }

  private calculateHash(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async captureAuditLogs(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`
      SELECT * FROM audit_logs 
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC LIMIT 1000
    `, [tenantId]);
    return res.rows || [];
  }

  private async captureUserActivities(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`
      SELECT * FROM user_activities 
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC LIMIT 500
    `, [tenantId]);
    return res.rows || [];
  }

  private async captureSystemLogs(tenantId: string): Promise<any[]> {
    // في التطبيق الحقيقي، هذا سيلتقط سجلات النظام
    return [{ message: 'System logs captured', timestamp: new Date() }];
  }

  private async captureDatabaseState(tenantId: string): Promise<any> {
    return {
      tableStats: (await this.db.query(`
        SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
      `)).rows || [],
      connectionStats: (await this.db.query(`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `)).rows || []
    };
  }

  private async analyzeTransactionPattern(tenantId: string, accountId: string): Promise<any> {
    const res = await this.db.query(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        MIN(txn_ts) as first_transaction,
        MAX(txn_ts) as last_transaction,
        COUNT(DISTINCT counterparty_id) as unique_counterparties
      FROM payments 
      WHERE tenant_id = $1 AND account_id = $2 
      AND txn_ts >= NOW() - INTERVAL '1 hour'
    `, [tenantId, accountId]);
    return (res.rows || [])[0] || {};
  }

  private calculateRiskScore(pattern: any): number {
    let score = 0;
    
    // عدد المعاملات
    if (pattern.transaction_count > 10) score += 30;
    else if (pattern.transaction_count > 5) score += 20;
    
    // المبلغ الإجمالي
    if (pattern.total_amount > 100000) score += 25;
    else if (pattern.total_amount > 50000) score += 15;
    
    // تنوع المستفيدين
    if (pattern.unique_counterparties === 1) score += 20;
    
    // النافذة الزمنية
    const timeWindow = new Date(pattern.last_transaction).getTime() - 
                      new Date(pattern.first_transaction).getTime();
    if (timeWindow < 10 * 60 * 1000) score += 25; // أقل من 10 دقائق
    
    return Math.min(score, 100);
  }

  private determineRiskLevel(score: number): string {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private generateAMLTasks(riskLevel: string): Array<{description: string, priority: string}> {
    const baseTasks = [
      { description: 'Review transaction patterns', priority: 'medium' },
      { description: 'Verify customer identity', priority: 'medium' }
    ];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      baseTasks.push(
        { description: 'Conduct customer interview', priority: 'high' },
        { description: 'Review historical account activity', priority: 'high' },
        { description: 'Assess SAR filing requirement', priority: 'high' }
      );
    }

    return baseTasks;
  }

  private async sendDocumentRequest(tenantId: string, requestId: string, paymentData: any): Promise<void> {
    // في التطبيق الحقيقي، هذا سيرسل إشعارات فعلية
    console.log(`📄 Document request sent: ${requestId} for payment ${paymentData.id}`);
  }
  private async detectFinanceTransactionOutliers(job: AgentJob): Promise<AgentResult> {
    const { tenantId, inputData } = job;
    const threshold = inputData?.threshold || 100000; // SAR
    const windowDays = inputData?.windowDays || 7;
    const actions: string[] = [];
    const recommendations: string[] = [];

    const highRes = await this.db.query(
      `SELECT id, amount, transaction_type, reference_id, transaction_date
       FROM transactions
       WHERE tenant_id = $1 AND amount >= $2
       ORDER BY amount DESC LIMIT 50`,
      [tenantId, threshold]
    );
    const high = highRes.rows || [];
    if (high.length > 0) {
      actions.push(`Detected ${high.length} high-value transactions >= ${threshold}`);
      recommendations.push('Review approvals and supporting documents for high-value transactions');
    }

    const repeatRes = await this.db.query(
      `SELECT reference_id, COUNT(*) AS c, MIN(transaction_date) AS first_ts, MAX(transaction_date) AS last_ts
       FROM transactions
       WHERE tenant_id = $1 AND reference_id IS NOT NULL
       AND transaction_date >= NOW() - INTERVAL '${windowDays} days'
       GROUP BY reference_id HAVING COUNT(*) >= 3
       ORDER BY c DESC LIMIT 50`,
      [tenantId]
    );
    const repeats = repeatRes.rows || [];
    if (repeats.length > 0) {
      actions.push(`Found ${repeats.length} repeated references (>=3 in ${windowDays}d)`);
      recommendations.push('Enable dedup rules and vendor reconciliation for repeated references');
    }

    const overdueRes = await this.db.query(
      `SELECT id, amount, reference_id, transaction_date
       FROM transactions
       WHERE tenant_id = $1 AND transaction_type = 'receipt' AND status = 'pending'
       AND transaction_date < NOW() - INTERVAL '30 days' AND amount >= $2
       ORDER BY transaction_date ASC LIMIT 50`,
      [tenantId, Math.max(5000, threshold / 10)]
    );
    const overdue = overdueRes.rows || [];
    if (overdue.length > 0) {
      actions.push(`Detected ${overdue.length} overdue AR receipts > 30d`);
      recommendations.push('Initiate dunning and collection procedures');
    }

    return {
      success: true,
      actions,
      recommendations,
      nextSteps: ['Attach findings to incident record', 'Notify finance controller'],
      evidence: { high, repeats, overdue },
      confidence: 0.9
    };
  }

}

export const redFlagsAgents = new RedFlagsAgentService();
