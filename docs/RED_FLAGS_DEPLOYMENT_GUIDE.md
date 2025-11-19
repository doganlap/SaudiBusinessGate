# 🚨 Red Flags Immediate Action System - دليل النشر والتشغيل

## **نظام الإجراءات الفورية للأعلام الحمراء**

### **Comprehensive Incident Response & AI Agents Integration**

---

## **🎯 نظرة عامة - Overview**

تم تطوير نظام شامل للكشف الفوري عن الأعلام الحمراء المالية والاستجابة التلقائية مع:

- **6 أنواع من Red Flags** مع كشف تلقائي
- **وضع الحادث الفوري** مع احتواء تلقائي
- **6 وكلاء ذكية** للاستجابة والإصلاح
- **نظام إشعارات متعدد القنوات** (Slack/Email/SMS)
- **لوحات مراقبة في الوقت الفعلي**

A comprehensive system for immediate detection and response to financial red flags with:

- **6 Red Flag Types** with automatic detection
- **Immediate Incident Mode** with automatic containment
- **6 AI Agents** for response and remediation
- **Multi-channel Notification System** (Slack/Email/SMS)
- **Real-time Monitoring Dashboards**

---

## **📁 الملفات المنشأة - Created Files**

### **🔧 Core System Files:**

```
lib/
├── red-flags/
│   └── incident-mode.ts          # نظام وضع الحادث الفوري
├── agents/
│   └── red-flags-agents.ts       # الوكلاء الأذكياء للاستجابة
└── db/
    └── connection.ts             # اتصال قاعدة البيانات

database/
└── red-flags/
    └── detection-rules.sql       # قواعد SQL للكشف والـ Triggers

config/
└── red-flags-playbook.yaml      # تكوين شامل للنظام

app/api/
└── red-flags/
    └── incident/
        └── route.ts              # API endpoints للتحكم
```

---

## **🚀 التثبيت والإعداد - Installation & Setup**

### **1. تثبيت المكتبات المطلوبة:**

```bash
# المكتبات الأساسية
npm install pg @types/pg
npm install nodemailer @types/nodemailer
npm install twilio
npm install yaml js-yaml @types/js-yaml

# مكتبات التشفير والأمان
npm install crypto-js @types/crypto-js
npm install jsonwebtoken @types/jsonwebtoken
```

### **2. إعداد قاعدة البيانات:**

```bash
# تشغيل سكريبت إنشاء الجداول والـ Functions
psql -U postgres -d your_database -f database/red-flags/detection-rules.sql

# إنشاء الجداول المطلوبة
CREATE TABLE IF NOT EXISTS red_flags (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  flag_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  description TEXT,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_incidents (
  incident_id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  flag_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  detected_at TIMESTAMP NOT NULL,
  evidence_snapshot_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_jobs (
  job_id VARCHAR(100) PRIMARY KEY,
  job_type VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  incident_id VARCHAR(100),
  priority VARCHAR(20) NOT NULL,
  input_data JSONB,
  status VARCHAR(20) DEFAULT 'queued',
  result JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### **3. تكوين متغيرات البيئة:**

```bash
# إضافة إلى .env
# Red Flags Configuration
RED_FLAGS_ENABLED=true
INCIDENT_MODE_AUTO_ACTIVATE=true
MATERIALITY_THRESHOLD=10000

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@yourcompany.com
SMTP_PASSWORD=your_app_password

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Critical Contact Numbers
CRITICAL_SMS_NUMBERS=+966501234567,+966507654321
```

---

## **🔍 أنواع Red Flags المدعومة - Supported Red Flag Types**

### **1. Accounting Equation Not Balanced (المعادلة المحاسبية غير متوازنة)**

```sql
-- الكشف التلقائي
SELECT journal_id, SUM(debit) - SUM(credit) AS imbalance
FROM gl_entries 
WHERE tenant_id = 'your_tenant'
GROUP BY journal_id
HAVING ABS(SUM(debit) - SUM(credit)) > 0.01;

-- الاحتواء الفوري
UPDATE tenant_settings SET posting_enabled = false WHERE tenant_id = 'your_tenant';
```

**الإجراءات التلقائية:**

- ✅ إيقاف ترحيل القيود فوراً
- ✅ نقل الفروقات إلى حساب Suspense
- ✅ إشعار فريق المالية
- ✅ تفعيل وكيل الإصلاح التلقائي

### **2. Duplicate Transaction (المعاملات المكررة)**

```sql
-- الكشف بالتوقيع الرقمي
WITH signatures AS (
  SELECT md5(counterparty_id || '|' || reference || '|' || amount::text) as sig,
         COUNT(*) as duplicates
  FROM payments 
  WHERE tenant_id = 'your_tenant' AND txn_date >= NOW() - INTERVAL '24 hours'
  GROUP BY sig
  HAVING COUNT(*) > 1
)
```

**الإجراءات التلقائية:**

- ✅ تعليم المعاملات المشبوهة
- ✅ إيقاف التسوية مؤقتاً
- ✅ مراجعة تلقائية بالوكيل الذكي
- ✅ عكس المكررات المؤكدة

### **3. Sanctioned Entity (الجهات المحظورة)**

```sql
-- فحص قوائم العقوبات مع Fuzzy Matching
SELECT c.name, sw.list_name, similarity(c.name, sw.name) as confidence
FROM counterparties c, sanctions_watchlist sw
WHERE similarity(c.name, sw.name) > 0.7
```

**الإجراءات التلقائية:**

- 🚨 تجميد العلاقة فوراً
- 🚨 منع جميع المدفوعات
- 🚨 فتح قضية امتثال
- 🚨 إشعار فوري للامتثال والإدارة

### **4. Audit Trail Tampered (تلاعب بسجل التدقيق)**

```sql
-- كشف الفجوات في التسلسل
SELECT seq_no, LAG(seq_no) OVER (ORDER BY seq_no) as prev_seq
FROM audit_logs 
WHERE seq_no != COALESCE(LAG(seq_no) OVER (ORDER BY seq_no), seq_no-1) + 1
```

**الإجراءات التلقائية:**

- 🔒 إلغاء صلاحيات الكتابة فوراً
- 📸 التقاط لقطة طب شرعي
- 🔐 تعليق الحسابات المشبوهة
- 📋 إشعار فريق الأمان

### **5. Large Unexplained Transaction (معاملات كبيرة غير مفسرة)**

```sql
-- المعاملات الكبيرة بدون مستندات
SELECT p.id, p.amount, p.txn_date
FROM payments p
LEFT JOIN documents d ON d.entity_id = p.id::text
WHERE p.amount >= 10000 AND d.id IS NULL
```

**الإجراءات التلقائية:**

- ⏸️ وضع المعاملة في الانتظار
- 📄 طلب المستندات الداعمة
- ⏰ تحديد مهلة 3 أيام
- 👥 مراجعة 4-eyes مطلوبة

### **6. Rapid Succession Transactions (تتابع سريع للمعاملات)**

```sql
-- كشف الأنماط المشبوهة
SELECT account_id, COUNT(*) as txn_count,
       MIN(txn_ts) as first_txn, MAX(txn_ts) as last_txn
FROM payments 
WHERE txn_ts >= NOW() - INTERVAL '10 minutes'
GROUP BY account_id
HAVING COUNT(*) >= 5
```

**الإجراءات التلقائية:**

- 🚩 تعليم الحساب للمراجعة
- 📉 تقليل الحدود مؤقتاً
- 🔍 تفعيل المراقبة المعززة
- 📊 تحليل AML تلقائي

---

## **🤖 الوكلاء الأذكياء - AI Agents**

### **1. FIN_REPAIR_UNBALANCED (وكيل إصلاح القيود)**

```typescript
// تشغيل تلقائي عند كشف عدم التوازن
const result = await redFlagsAgents.executeAgent({
  jobType: 'FIN_REPAIR_UNBALANCED',
  tenantId: 'tenant_123',
  inputData: { journalId: 'J-2024-001', imbalance: 150.00 }
});

// النتائج المتوقعة
{
  success: true,
  actions: [
    'Created adjustment entry: ADJ-J-2024-001',
    'Moved imbalance of 150.00 to Suspense account',
    'GL posting re-enabled for tenant'
  ],
  confidence: 0.95
}
```

### **2. FIN_DEDUP_REVIEW (وكيل مراجعة المكررات)**

```typescript
// مراجعة وحل المعاملات المكررة
const result = await redFlagsAgents.executeAgent({
  jobType: 'FIN_DEDUP_REVIEW',
  tenantId: 'tenant_123',
  inputData: { paymentId: 'PAY-2024-456' }
});

// الإجراءات التلقائية
- تحليل التوقيعات الرقمية
- عكس المكررات المؤكدة
- إنشاء قواعد منع التكرار
- تحديث ضوابط المعالجة
```

### **3. COMPLIANCE_CASE_OPEN (وكيل الامتثال)**

```typescript
// فتح قضية امتثال للجهات المحظورة
const result = await redFlagsAgents.executeAgent({
  jobType: 'COMPLIANCE_CASE_OPEN',
  tenantId: 'tenant_123',
  inputData: { 
    entityId: 'COUNTERPARTY-789',
    sanctionsHit: { confidence: 0.95, listName: 'OFAC' }
  }
});

// المهام التلقائية
- Enhanced Due Diligence (EDD)
- مراجعة المعاملات التاريخية
- تقييم التبليغ التنظيمي
- المراجعة القانونية
```

### **4. SEC_FORENSIC_SNAPSHOT (وكيل الطب الشرعي)**

```typescript
// التقاط لقطة طب شرعي للتحقيق
const result = await redFlagsAgents.executeAgent({
  jobType: 'SEC_FORENSIC_SNAPSHOT',
  tenantId: 'tenant_123',
  inputData: { 
    suspiciousActivity: 'audit_trail_tampering',
    affectedTables: ['audit_logs', 'gl_entries']
  }
});

// البيانات المحفوظة
- سجلات التدقيق (24 ساعة)
- أنشطة المستخدمين
- حالة قاعدة البيانات
- سجلات النظام
- Hash cryptographic للتحقق
```

### **5. FIN_SUPPORTING_DOCS_REQUEST (وكيل طلب المستندات)**

```typescript
// طلب المستندات الداعمة للمعاملات الكبيرة
const result = await redFlagsAgents.executeAgent({
  jobType: 'FIN_SUPPORTING_DOCS_REQUEST',
  tenantId: 'tenant_123',
  inputData: { 
    paymentId: 'PAY-2024-789',
    amount: 50000,
    counterparty: 'VENDOR-ABC'
  }
});

// المستندات المطلوبة
- فاتورة أو أمر شراء
- عقد أو اتفاقية
- إيصال استلام
- قرار مجلس إدارة (إن أمكن)
```

### **6. AML_ALERT_TRIAGE (وكيل فرز AML)**

```typescript
// تحليل وفرز تنبيهات مكافحة غسل الأموال
const result = await redFlagsAgents.executeAgent({
  jobType: 'AML_ALERT_TRIAGE',
  tenantId: 'tenant_123',
  inputData: { 
    accountId: 'ACC-2024-123',
    transactionPattern: {
      count: 8,
      timeWindow: '5 minutes',
      totalAmount: 45000
    }
  }
});

// التقييم والإجراءات
- حساب نقاط المخاطر
- تطبيق حدود مؤقتة
- تفعيل المراقبة المعززة
- تحديد متطلبات SAR
```

---

## **📊 لوحات المراقبة - Monitoring Dashboards**

### **1. Finance Guard Dashboard**

```typescript
// الوصول: /api/red-flags/dashboard/finance-guard
{
  "unbalanced_entries": 3,
  "suspense_balance": 2500.00,
  "recent_duplicates": [
    {
      "signature": "abc123",
      "count": 2,
      "amount": 1500.00,
      "detected_at": "2024-11-11T10:30:00Z"
    }
  ],
  "gl_posting_status": "enabled",
  "last_updated": "2024-11-11T10:35:00Z"
}
```

### **2. AML/Anti-Fraud Monitor**

```typescript
// الوصول: /api/red-flags/dashboard/aml-monitor
{
  "sanctions_hits": 1,
  "velocity_alerts": [
    {
      "date": "2024-11-11",
      "count": 5,
      "severity": "medium"
    }
  ],
  "high_risk_accounts": 3,
  "pending_investigations": 2,
  "last_updated": "2024-11-11T10:35:00Z"
}
```

### **3. Audit Integrity Monitor**

```typescript
// الوصول: /api/red-flags/dashboard/audit-integrity
{
  "hash_chain_health": "healthy",
  "sequence_gaps": 0,
  "privileged_actions": 15,
  "forensic_snapshots": 2,
  "audit_trail_status": "intact",
  "last_updated": "2024-11-11T10:35:00Z"
}
```

---

## **🔔 نظام الإشعارات - Notification System**

### **Slack Integration:**

```javascript
// إعداد Webhook
const slackAlert = {
  channel: "#incidents-critical",
  username: "Red Flags Bot",
  icon_emoji: ":rotating_light:",
  attachments: [{
    color: "danger",
    title: "🚨 CRITICAL: Sanctions Screening Hit",
    text: "Entity 'SUSPICIOUS COMPANY' matched OFAC list with 95% confidence",
    fields: [
      { title: "Tenant", value: "ACME Corp", short: true },
      { title: "Incident ID", value: "INC-2024-001", short: true },
      { title: "Actions Taken", value: "Entity frozen, payments blocked", short: false }
    ],
    footer: "Saudi Store Red Flags System",
    ts: Math.floor(Date.now() / 1000)
  }]
};
```

### **Email Alerts:**

```html
<!-- قالب البريد الإلكتروني -->
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #dc3545;">🚨 Red Flag Alert: Sanctions Hit</h2>
  
  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
    <p><strong>Incident ID:</strong> INC-2024-001</p>
    <p><strong>Type:</strong> Sanctioned Entity</p>
    <p><strong>Severity:</strong> CRITICAL</p>
    <p><strong>Entity:</strong> SUSPICIOUS COMPANY</p>
    <p><strong>Confidence:</strong> 95%</p>
  </div>
  
  <h3>Immediate Actions Taken:</h3>
  <ul>
    <li>✅ Entity relationship frozen</li>
    <li>✅ All payments blocked</li>
    <li>✅ Compliance case opened</li>
    <li>✅ Enhanced monitoring activated</li>
  </ul>
  
  <p><a href="https://platform.saudistore.com/incidents/INC-2024-001" 
         style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    View Incident Details
  </a></p>
</div>
```

### **SMS Alerts (Critical Only):**

```
🚨 URGENT: Red Flag Alert
Type: Sanctions Hit
Entity: SUSPICIOUS CO
Confidence: 95%
Actions: Frozen & Blocked
Incident: INC-2024-001
Review immediately.
```

---

## **🧪 الاختبار والتحقق - Testing & Validation**

### **1. اختبار الكشف التلقائي:**

```bash
# اختبار القيود غير المتوازنة
curl -X POST http://localhost:3050/api/red-flags/test \
  -H "Content-Type: application/json" \
  -d '{
    "test_type": "unbalanced_entry",
    "tenant_id": "test_tenant",
    "journal_id": "TEST-J001",
    "imbalance": 150.00
  }'

# النتيجة المتوقعة
{
  "success": true,
  "red_flag_created": true,
  "incident_activated": true,
  "agent_triggered": "FIN_REPAIR_UNBALANCED"
}
```

### **2. اختبار الوكلاء:**

```bash
# تشغيل وكيل الإصلاح
curl -X POST http://localhost:3050/api/red-flags/incident \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute_agent",
    "jobType": "FIN_REPAIR_UNBALANCED",
    "tenantId": "test_tenant",
    "inputData": {
      "entityId": "TEST-J001",
      "imbalance": 150.00
    }
  }'
```

### **3. اختبار الإشعارات:**

```bash
# اختبار إشعار Slack
curl -X POST http://localhost:3050/api/red-flags/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "slack",
    "severity": "critical",
    "message": "Test sanctions hit alert"
  }'
```

---

## **📈 المراقبة والأداء - Monitoring & Performance**

### **Key Performance Indicators (KPIs):**

```sql
-- معدل الكشف في الساعة
SELECT COUNT(*) as red_flags_per_hour
FROM red_flags 
WHERE detected_at >= NOW() - INTERVAL '1 hour';

-- معدل نجاح الوكلاء
SELECT 
  (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*)) as success_rate
FROM agent_jobs 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- متوسط وقت الاستجابة
SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/60) as avg_response_minutes
FROM red_flags 
WHERE resolved_at IS NOT NULL 
AND detected_at >= NOW() - INTERVAL '24 hours';
```

### **Health Checks:**

```bash
# فحص صحة النظام
curl http://localhost:3050/api/red-flags/health

# النتيجة المتوقعة
{
  "status": "healthy",
  "database": "connected",
  "agents": "running",
  "notifications": "configured",
  "last_check": "2024-11-11T10:35:00Z"
}
```

---

## **🔒 الأمان والامتثال - Security & Compliance**

### **Data Protection:**

- 🔐 تشفير جميع البيانات الحساسة
- 🔒 Hash cryptographic للأدلة
- 📋 سجلات تدقيق شاملة
- ⏰ احتفاظ بالبيانات 7 سنوات

### **Regulatory Compliance:**

- ✅ إطار الأمن السيبراني SAMA
- ✅ قانون مكافحة غسل الأموال KSA
- ✅ نظام حماية البيانات
- ✅ متطلبات التبليغ التنظيمي

### **Access Control:**

- 👤 مصادقة متعددة العوامل
- 🔑 أذونات قائمة على الأدوار
- 📊 مراقبة الوصول المميز
- 🚫 مبدأ أقل امتياز

---

## **🚀 النشر في الإنتاج - Production Deployment**

### **1. متطلبات البنية التحتية:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  red-flags-system:
    image: saudi-store/red-flags:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    ports:
      - "3050:3050"
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: red_flags_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
```

### **2. إعداد المراقبة:**

```yaml
# monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
```

### **3. النسخ الاحتياطي:**

```bash
#!/bin/bash
# backup-script.sh

# نسخ احتياطي لقاعدة البيانات
pg_dump -h localhost -U postgres red_flags_db > backup_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي للأدلة الطب شرعية
tar -czf forensic_backup_$(date +%Y%m%d).tar.gz /app/forensic_data/

# رفع إلى التخزين السحابي
aws s3 cp backup_*.sql s3://red-flags-backups/
aws s3 cp forensic_backup_*.tar.gz s3://red-flags-forensic/
```

---

## **📞 الدعم والصيانة - Support & Maintenance**

### **Log Files:**

```bash
# سجلات النظام
tail -f /app/logs/red-flags.log
tail -f /app/logs/agents.log
tail -f /app/logs/incidents.log

# سجلات قاعدة البيانات
tail -f /var/log/postgresql/postgresql.log
```

### **Common Issues:**

```bash
# مشكلة: الوكيل لا يستجيب
# الحل: إعادة تشغيل خدمة الوكلاء
systemctl restart red-flags-agents

# مشكلة: فشل الإشعارات
# الحل: فحص إعدادات Slack/Email
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test message"}'

# مشكلة: بطء الكشف
# الحل: فحص فهارس قاعدة البيانات
EXPLAIN ANALYZE SELECT * FROM red_flags WHERE tenant_id = 'test';
```

### **Emergency Contacts:**

- **Technical Support:** <support@saudistore.com>
- **Security Team:** <security@saudistore.com>
- **Compliance Officer:** <compliance@saudistore.com>
- **24/7 Hotline:** +966-11-REDFLAGS

---

## **✅ قائمة التحقق النهائية - Final Checklist**

### **قبل النشر:**

- [ ] تثبيت جميع المكتبات المطلوبة
- [ ] إنشاء جداول قاعدة البيانات
- [ ] تكوين متغيرات البيئة
- [ ] اختبار جميع أنواع Red Flags
- [ ] تحقق من عمل الوكلاء الأذكياء
- [ ] اختبار نظام الإشعارات
- [ ] إعداد لوحات المراقبة
- [ ] تكوين النسخ الاحتياطي

### **بعد النشر:**

- [ ] مراقبة الأداء لمدة 24 ساعة
- [ ] تحقق من سجلات النظام
- [ ] اختبار سيناريوهات الطوارئ
- [ ] تدريب الفريق على النظام
- [ ] توثيق الإجراءات التشغيلية
- [ ] جدولة المراجعات الدورية

---

**🎉 نظام Red Flags جاهز للتشغيل!**

**المتجر السعودي - Saudi Store**
**نظام الإجراءات الفورية للأعلام الحمراء**

**✅ كشف تلقائي + احتواء فوري + وكلاء أذكياء + إشعارات متعددة القنوات**

```bash
# للبدء
npm run dev
# النظام متاح على: http://localhost:3050/api/red-flags/
```

**🔥 جاهز للإنتاج مع حماية شاملة ضد المخاطر المالية!**
