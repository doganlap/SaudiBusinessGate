# 🚀 دليل البدء السريع - Quick Start Guide

## **المتجر السعودي - Saudi Store**

---

## **✅ الخطوات السريعة للبدء**

### **1. إنشاء قاعدة البيانات**

```powershell
# Windows PowerShell
psql -U postgres -c "CREATE DATABASE saudi_store;"
```

أو

```sql
-- في psql
CREATE DATABASE saudi_store;
```

---

### **2. تشغيل جميع Schema Files بالترتيب**

```powershell
# 1. Platform Admin Tables
psql -U postgres -d saudi_store -f database/schema/09-platform-admin.sql

# 2. Tenant Registration Tables
psql -U postgres -d saudi_store -f database/schema/10-tenant-registration-tables.sql

# 3. Workflow Tables
psql -U postgres -d saudi_store -f database/schema/11-workflow-tables.sql

# 4. Red Flags Triggers (NEW!)
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql
```

---

### **3. تثبيت المكتبات**

```bash
npm install
```

---

### **4. تشغيل المشروع**

```bash
# تشغيل Next.js + WebSocket معاً
npm run dev:all
```

أو بشكل منفصل:

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: WebSocket
npm run ws
```

---

### **5. فتح المتصفح**

```
http://localhost:3050
```

---

### **6. اختبار Command Palette**

```
اضغط Ctrl/Cmd + K
```

---

## **🧪 اختبار Red Flags System**

### **اختبار سريع:**

```sql
-- الاتصال بقاعدة البيانات
psql -U postgres -d saudi_store

-- إدخال معاملة كبيرة (سيتم اكتشافها تلقائياً)
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
    150000,  -- مبلغ كبير > 100,000
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

-- معالجة الأحداث
SELECT * FROM process_pending_events();

-- التحقق من Workflow
SELECT * FROM ai_finance_workflows 
ORDER BY created_at DESC LIMIT 1;
```

---

## **📊 التحقق من التثبيت**

### **التحقق من Triggers:**

```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_detect_%'
ORDER BY trigger_name;
```

**النتيجة المتوقعة:** 6 triggers

---

### **التحقق من Functions:**

```sql
SELECT 
    proname as function_name,
    pronargs as arg_count
FROM pg_proc 
WHERE proname IN (
    'detect_large_transaction',
    'detect_duplicate_payment',
    'detect_round_amount',
    'detect_budget_overrun',
    'detect_unusual_time',
    'detect_rapid_transactions',
    'process_ai_finance_event',
    'process_pending_events',
    'archive_old_events'
)
ORDER BY proname;
```

**النتيجة المتوقعة:** 9 functions

---

## **🔄 إعداد Scheduler (اختياري)**

### **Windows Task Scheduler:**

```powershell
# إنشاء مهمة تعمل كل دقيقة
schtasks /create /tn "ProcessAIEvents" /tr "psql -U postgres -d saudi_store -c \"SELECT process_pending_events()\"" /sc minute /mo 1
```

### **Node.js Scheduler:**

```typescript
// إضافة في server/websocket.ts
setInterval(async () => {
  const result = await query('SELECT * FROM process_pending_events()');
  console.log('✅ Events processed:', result.rows[0]);
}, 60000);
```

---

## **📈 المراقبة**

### **Dashboard URL:**

```
http://localhost:3050/en/dashboard
```

### **عرض الأحداث:**

```sql
SELECT 
    event_type,
    severity,
    status,
    COUNT(*) as count
FROM ai_finance_events
GROUP BY event_type, severity, status
ORDER BY severity DESC, count DESC;
```

### **عرض Workflows:**

```sql
SELECT 
    workflow_type,
    status,
    priority,
    assigned_agent,
    COUNT(*) as count
FROM ai_finance_workflows
GROUP BY workflow_type, status, priority, assigned_agent
ORDER BY priority DESC, count DESC;
```

---

## **✅ قائمة التحقق السريعة**

- [ ] PostgreSQL مثبت ويعمل
- [ ] قاعدة البيانات `saudi_store` منشأة
- [ ] جميع Schema files تم تشغيلها (4 ملفات)
- [ ] `npm install` تم تشغيله
- [ ] `.env` تم إنشاؤه وتحديثه
- [ ] `npm run dev:all` يعمل
- [ ] المتصفح يفتح على localhost:3050
- [ ] Command Palette يعمل (Ctrl/K)
- [ ] Red Flags triggers نشطة (6 triggers)
- [ ] اختبار معاملة كبيرة نجح

---

## **🆘 مشاكل شائعة**

### **مشكلة: قاعدة البيانات غير موجودة**

```sql
CREATE DATABASE saudi_store;
```

### **مشكلة: الجداول غير موجودة**

```bash
# تشغيل جميع Schema files بالترتيب
psql -U postgres -d saudi_store -f database/schema/09-platform-admin.sql
psql -U postgres -d saudi_store -f database/schema/10-tenant-registration-tables.sql
psql -U postgres -d saudi_store -f database/schema/11-workflow-tables.sql
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql
```

### **مشكلة: Port 3050 مستخدم**

```bash
# تغيير Port في package.json
"dev": "next dev -p 3051"
```

### **مشكلة: WebSocket لا يتصل**

```bash
# تحقق من تشغيل WebSocket server
npm run ws

# تحقق من .env
NEXT_PUBLIC_WS_URL=http://localhost:3051
```

---

## **📚 الوثائق الكاملة**

- **COMPLETE_SETUP_GUIDE.md** - دليل الإعداد الشامل
- **ADVANCED_FEATURES_GUIDE.md** - دليل الميزات المتقدمة
- **RED_FLAGS_ACTIVATION_GUIDE.md** - دليل Red Flags
- **IMPLEMENTATION_SUMMARY.md** - ملخص التنفيذ

---

**🎉 كل شيء جاهز!**

**ابدأ الآن:**

```bash
npm run dev:all
```

**افتح المتصفح:**

```
http://localhost:3050
```

**🚀 المتجر السعودي - Saudi Store**
