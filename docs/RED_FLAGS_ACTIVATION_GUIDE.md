# 🚨 دليل تفعيل نظام Red Flags - Red Flags Activation Guide

## **المتجر السعودي - Saudi Store**
### **نظام الكشف التلقائي والذكاء الاصطناعي**

---

## **📋 نظرة عامة - Overview**

نظام Red Flags هو نظام متكامل للكشف التلقائي عن الأنماط المشبوهة في المعاملات المالية وتوجيهها تلقائياً إلى وكلاء الذكاء الاصطناعي للمراجعة والمعالجة.

---

## **🎯 الميزات الرئيسية**

### **✅ 6 أنواع من الكشف التلقائي:**
1. **Large Transactions** - المعاملات الكبيرة (≥ 100,000 ريال)
2. **Duplicate Payments** - الدفعات المكررة (خلال 24 ساعة)
3. **Round Amounts** - المبالغ المدورة (تجزئة محتملة)
4. **Budget Overruns** - تجاوز الميزانية
5. **Unusual Times** - معاملات خارج أوقات العمل
6. **Rapid Transactions** - معاملات سريعة متتالية (>10 في الساعة)

### **✅ 5 وكلاء ذكاء اصطناعي:**
1. **Compliance Agent** - وكيل الامتثال
2. **Fraud Detection Agent** - وكيل كشف الاحتيال
3. **AML Agent** - وكيل مكافحة غسل الأموال
4. **Budget Monitor Agent** - وكيل مراقبة الميزانية
5. **Security Agent** - وكيل الأمان

---

## **📦 الملفات المطلوبة**

```
DoganHubStore/
├── database/schema/
│   └── 12-red-flags-triggers.sql      # SQL Triggers & Functions
├── config/
│   └── ai-workflow-config.yaml        # YAML Configuration
└── scripts/
    └── activate-red-flags.sh          # Activation Script
```

---

## **🚀 التفعيل السريع - Quick Start**

### **الطريقة 1: باستخدام السكريبت (موصى به)**

```bash
# إعطاء صلاحيات التنفيذ
chmod +x scripts/activate-red-flags.sh

# تشغيل السكريبت
./scripts/activate-red-flags.sh
```

### **الطريقة 2: يدوياً**

```bash
# تشغيل SQL Schema
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql

# التحقق من التفعيل
psql -U postgres -d saudi_store -c "
    SELECT COUNT(*) as trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name LIKE 'trg_detect_%'
"
```

---

## **📊 كيف يعمل النظام**

### **1. الكشف التلقائي (Automatic Detection)**

```sql
-- عند إدخال معاملة جديدة
INSERT INTO transactions (amount, ...) VALUES (150000, ...);

-- ↓ يتم تشغيل Trigger تلقائياً

-- ↓ يتم إنشاء حدث في ai_finance_events
INSERT INTO ai_finance_events (
    event_type = 'large_transaction',
    severity = 'high',
    status = 'pending'
);
```

### **2. معالجة الأحداث (Event Processing)**

```sql
-- يتم استدعاء الدالة دورياً (كل دقيقة)
SELECT process_pending_events();

-- ↓ يتم إنشاء Workflow تلقائياً

-- ↓ يتم تعيين الوكيل المناسب
INSERT INTO ai_finance_workflows (
    workflow_type = 'compliance_review',
    assigned_agent = 'compliance-agent',
    priority = 'high'
);
```

### **3. إشعارات فورية (Real-time Notifications)**

```sql
-- للأحداث عالية الخطورة
PERFORM pg_notify('high_severity_event', event_data);

-- ↓ يتم إرسال إشعار فوري

-- ↓ WebSocket يبث التحديث
socket.emit('workflow:created', workflow_data);
```

---

## **⚙️ التكوين - Configuration**

### **ملف YAML: `config/ai-workflow-config.yaml`**

#### **تعديل العتبات (Thresholds):**

```yaml
event_mappings:
  large_transaction:
    priority: "high"
    sla_hours: 4
    escalation_rules:
      - condition: "amount > 500000"
        escalate_to: "super_admin"
        escalate_after_hours: 2
```

#### **تعديل الوكلاء (Agents):**

```yaml
agents:
  compliance-agent:
    max_concurrent_workflows: 10
    working_hours:
      start: "08:00"
      end: "17:00"
      timezone: "Asia/Riyadh"
```

#### **تعديل الإشعارات (Notifications):**

```yaml
notification_templates:
  large_transaction:
    email:
      subject:
        en: "🚨 Large Transaction Alert: {amount} SAR"
        ar: "🚨 تنبيه معاملة كبيرة: {amount} ريال"
```

---

## **🔄 الجدولة التلقائية - Scheduling**

### **الطريقة 1: Cron (Linux/Mac)**

```bash
# فتح crontab
crontab -e

# إضافة الأسطر التالية:

# معالجة الأحداث كل دقيقة
* * * * * psql -d saudi_store -c "SELECT process_pending_events()"

# أرشفة الأحداث القديمة يومياً الساعة 2 صباحاً
0 2 * * * psql -d saudi_store -c "SELECT archive_old_events()"
```

### **الطريقة 2: pg_cron (PostgreSQL Extension)**

```sql
-- تثبيت pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- جدولة معالجة الأحداث
SELECT cron.schedule(
    'process-ai-events',
    '* * * * *',  -- كل دقيقة
    'SELECT process_pending_events()'
);

-- جدولة الأرشفة
SELECT cron.schedule(
    'archive-old-events',
    '0 2 * * *',  -- يومياً الساعة 2 صباحاً
    'SELECT archive_old_events()'
);
```

### **الطريقة 3: Node.js Scheduler**

```typescript
// server/scheduler.ts
import { query } from '../lib/db/connection';

// معالجة الأحداث كل دقيقة
setInterval(async () => {
  try {
    const result = await query('SELECT * FROM process_pending_events()');
    console.log('✅ Events processed:', result.rows[0]);
  } catch (error) {
    console.error('❌ Event processing failed:', error);
  }
}, 60000); // 60 seconds

// أرشفة الأحداث يومياً
setInterval(async () => {
  try {
    const result = await query('SELECT archive_old_events()');
    console.log('🗄️ Events archived:', result.rows[0]);
  } catch (error) {
    console.error('❌ Archive failed:', error);
  }
}, 86400000); // 24 hours
```

---

## **📊 المراقبة والتقارير - Monitoring**

### **عرض الأحداث النشطة:**

```sql
-- جميع الأحداث المعلقة
SELECT 
    event_type,
    severity,
    COUNT(*) as count
FROM ai_finance_events
WHERE status = 'pending'
GROUP BY event_type, severity
ORDER BY severity DESC, count DESC;
```

### **عرض Workflows النشطة:**

```sql
-- جميع Workflows الجارية
SELECT 
    workflow_type,
    assigned_agent,
    priority,
    COUNT(*) as count
FROM ai_finance_workflows
WHERE status IN ('pending', 'running')
GROUP BY workflow_type, assigned_agent, priority
ORDER BY priority DESC, count DESC;
```

### **إحصائيات الأداء:**

```sql
-- معدل المعالجة
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as avg_processing_seconds
FROM ai_finance_events
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## **🧪 الاختبار - Testing**

### **اختبار 1: معاملة كبيرة**

```sql
INSERT INTO transactions (
    tenant_id,
    amount,
    currency,
    debit_account_id,
    credit_account_id,
    description,
    transaction_date,
    created_by
) VALUES (
    (SELECT id FROM tenants LIMIT 1),
    150000,  -- مبلغ كبير
    'SAR',
    (SELECT id FROM financial_accounts WHERE account_type = 'asset' LIMIT 1),
    (SELECT id FROM financial_accounts WHERE account_type = 'liability' LIMIT 1),
    'Test Large Transaction',
    CURRENT_DATE,
    (SELECT id FROM platform_users LIMIT 1)
);

-- التحقق من إنشاء الحدث
SELECT * FROM ai_finance_events 
WHERE event_type = 'large_transaction' 
ORDER BY created_at DESC LIMIT 1;
```

### **اختبار 2: دفعة مكررة**

```sql
-- إدخال دفعة
INSERT INTO transactions (tenant_id, amount, credit_account_id, ...) 
VALUES (..., 5000, 'account-123', ...);

-- إدخال نفس الدفعة مرة أخرى
INSERT INTO transactions (tenant_id, amount, credit_account_id, ...) 
VALUES (..., 5000, 'account-123', ...);

-- التحقق
SELECT * FROM ai_finance_events 
WHERE event_type = 'duplicate_payment' 
ORDER BY created_at DESC LIMIT 1;
```

### **اختبار 3: معالجة الأحداث**

```sql
-- معالجة الأحداث المعلقة
SELECT * FROM process_pending_events();

-- التحقق من إنشاء Workflows
SELECT * FROM ai_finance_workflows 
ORDER BY created_at DESC LIMIT 5;
```

---

## **🔐 RBAC - الصلاحيات**

### **الأدوار والصلاحيات:**

```yaml
roles:
  viewer:
    can_view_events: true
    can_approve: false
    
  manager:
    can_view_events: true
    can_approve: true
    approval_limit: 100000
    
  compliance_officer:
    can_view_events: true
    can_approve: true
    approval_limit: 1000000
    special_permissions:
      - close_compliance_workflows
      - override_decisions
```

---

## **📈 التكامل مع WebSocket**

### **استقبال التحديثات الفورية:**

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3051', {
  query: { tenantId: 'tenant-123' }
});

// استقبال أحداث جديدة
socket.on('workflow:created', (workflow) => {
  console.log('🆕 New Workflow:', workflow);
  // تحديث UI
});

// استقبال تحديثات الخطوات
socket.on('workflow:step:update', ({ workflowId, step }) => {
  console.log('🔄 Step Updated:', step);
  // تحديث Progress
});
```

---

## **✅ قائمة التحقق - Checklist**

### **قبل التفعيل:**
- [ ] قاعدة البيانات جاهزة
- [ ] جداول Finance موجودة
- [ ] جداول AI Agents موجودة
- [ ] ملف YAML تم تحديثه

### **بعد التفعيل:**
- [ ] 6 Triggers نشطة
- [ ] 9 Functions موجودة
- [ ] اختبار معاملة كبيرة نجح
- [ ] حدث تم إنشاؤه
- [ ] Workflow تم إنشاؤه
- [ ] Scheduler تم تكوينه

---

## **🆘 استكشاف الأخطاء**

### **مشكلة: Triggers لا تعمل**

```sql
-- التحقق من Triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_detect_%';

-- إعادة إنشاء Trigger
DROP TRIGGER IF EXISTS trg_detect_large_transaction ON transactions;
CREATE TRIGGER trg_detect_large_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION detect_large_transaction();
```

### **مشكلة: الأحداث لا تتم معالجتها**

```sql
-- التحقق من الأحداث المعلقة
SELECT COUNT(*) FROM ai_finance_events WHERE status = 'pending';

-- معالجة يدوية
SELECT * FROM process_pending_events();
```

### **مشكلة: Workflows لا يتم إنشاؤها**

```sql
-- التحقق من جدول Workflows
SELECT COUNT(*) FROM ai_finance_workflows;

-- معالجة حدث محدد
SELECT process_ai_finance_event('event-id-here');
```

---

## **📚 الوثائق الإضافية**

- **ADVANCED_FEATURES_GUIDE.md** - دليل الميزات المتقدمة
- **COMPLETE_SETUP_GUIDE.md** - دليل الإعداد الشامل
- **TRANSACTION_COMPLIANCE_CHECKLIST.md** - دليل الامتثال المالي

---

**🎉 نظام Red Flags جاهز للعمل!**

**الميزات:**
✅ 6 أنواع كشف تلقائي  
✅ 5 وكلاء ذكاء اصطناعي  
✅ معالجة تلقائية للأحداث  
✅ إشعارات فورية  
✅ تكامل WebSocket  
✅ RBAC كامل  
✅ Multi-tenant  

**ابدأ الآن:**
```bash
./scripts/activate-red-flags.sh
```

**🚀 المتجر السعودي - Saudi Store**
