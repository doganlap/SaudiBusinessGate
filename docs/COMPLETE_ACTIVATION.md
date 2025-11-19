# 🚀 دليل التفعيل الشامل - Complete Activation Guide

## **المتجر السعودي - Saudi Store**

### **تفعيل جميع الأنظمة خطوة بخطوة**

---

## **📋 نظرة عامة**

هذا الدليل يوضح كيفية تفعيل جميع أنظمة المنصة من الصفر.

---

## **✅ الخطوة 1: إنشاء قاعدة البيانات**

### **Windows PowerShell:**

```powershell
# الاتصال بـ PostgreSQL
psql -U postgres

# إنشاء قاعدة البيانات
CREATE DATABASE saudi_store;

# الخروج
\q
```

### **أو مباشرة:**

```powershell
psql -U postgres -c "CREATE DATABASE saudi_store;"
```

---

## **✅ الخطوة 2: تشغيل Schema Files بالترتيب**

### **تشغيل جميع الملفات:**

```powershell
# الانتقال لمجلد المشروع
cd d:\Projects\DoganHubStore

# 1. Platform Admin Tables
psql -U postgres -d saudi_store -f database/schema/09-platform-admin.sql

# 2. Tenant Registration Tables
psql -U postgres -d saudi_store -f database/schema/10-tenant-registration-tables.sql

# 3. Workflow Tables
psql -U postgres -d saudi_store -f database/schema/11-workflow-tables.sql

# 4. Red Flags Triggers (NEW!)
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql

# 5. Licensing & Costs (NEW!)
psql -U postgres -d saudi_store -f database/schema/13-licensing-costs.sql
```

---

## **✅ الخطوة 3: التحقق من التثبيت**

### **التحقق من الجداول:**

```sql
psql -U postgres -d saudi_store

-- عرض جميع الجداول
\dt

-- يجب أن تظهر:
-- tenants
-- platform_users
-- workflow_instances
-- workflow_steps
-- ai_finance_events
-- ai_finance_workflows
-- license_types
-- user_licenses
-- license_costs
-- owner_permissions
-- وغيرها...

-- الخروج
\q
```

### **عد الجداول:**

```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**النتيجة المتوقعة:** 20+ جدول

---

## **✅ الخطوة 4: التحقق من Triggers**

```sql
-- عرض جميع Triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

**النتيجة المتوقعة:** 10+ triggers

---

## **✅ الخطوة 5: التحقق من Functions**

```sql
-- عرض جميع Functions
SELECT 
    proname as function_name,
    pronargs as arg_count
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;
```

**النتيجة المتوقعة:** 15+ functions

---

## **✅ الخطوة 6: إدخال بيانات تجريبية**

### **إنشاء Tenant:**

```sql
INSERT INTO tenants (
    tenant_code,
    tenant_name,
    tenant_name_ar,
    status,
    subscription_tier
) VALUES (
    'DEMO001',
    'Demo Company',
    'شركة تجريبية',
    'active',
    'professional'
) RETURNING id;
```

### **إنشاء User:**

```sql
INSERT INTO platform_users (
    tenant_id,
    email,
    full_name,
    role,
    status
) VALUES (
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    'owner@demo.com',
    'Demo Owner',
    'super_admin',
    'active'
) RETURNING id;
```

### **إنشاء Owner License:**

```sql
INSERT INTO user_licenses (
    user_id,
    tenant_id,
    license_type_id,
    license_key,
    status,
    is_owner,
    billing_cycle
) VALUES (
    (SELECT id FROM platform_users WHERE email = 'owner@demo.com'),
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    (SELECT id FROM license_types WHERE license_code = 'OWNER'),
    generate_license_key(
        (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
        (SELECT id FROM platform_users WHERE email = 'owner@demo.com')
    ),
    'active',
    true,
    'one-time'
);
```

### **إنشاء Owner Permissions:**

```sql
INSERT INTO owner_permissions (
    user_id,
    tenant_id,
    can_manage_licenses,
    can_view_costs,
    can_manage_billing,
    can_add_users,
    can_remove_users,
    can_assign_roles
) VALUES (
    (SELECT id FROM platform_users WHERE email = 'owner@demo.com'),
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    true, true, true, true, true, true
);
```

---

## **✅ الخطوة 7: اختبار Red Flags System**

### **إدخال معاملة كبيرة:**

```sql
-- إنشاء حساب مالي أولاً (إذا لم يكن موجوداً)
INSERT INTO financial_accounts (
    tenant_id,
    account_code,
    account_name,
    account_type,
    balance
) VALUES (
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    'ASSET-001',
    'Main Asset Account',
    'asset',
    0
),
(
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    'LIAB-001',
    'Main Liability Account',
    'liability',
    0
);

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
    (SELECT id FROM tenants WHERE tenant_code = 'DEMO001'),
    150000,  -- مبلغ كبير > 100,000
    'SAR',
    (SELECT id FROM financial_accounts WHERE account_code = 'ASSET-001' LIMIT 1),
    (SELECT id FROM financial_accounts WHERE account_code = 'LIAB-001' LIMIT 1),
    'Test Large Transaction',
    CURRENT_DATE,
    (SELECT id FROM platform_users WHERE email = 'owner@demo.com')
);
```

### **التحقق من Event:**

```sql
SELECT * FROM ai_finance_events 
WHERE event_type = 'large_transaction' 
ORDER BY created_at DESC LIMIT 1;
```

### **معالجة الأحداث:**

```sql
SELECT * FROM process_pending_events();
```

### **التحقق من Workflow:**

```sql
SELECT * FROM ai_finance_workflows 
ORDER BY created_at DESC LIMIT 1;
```

---

## **✅ الخطوة 8: تثبيت المكتبات**

```bash
cd d:\Projects\DoganHubStore
npm install
```

**المكتبات المطلوبة:**

- ✅ framer-motion
- ✅ cmdk
- ✅ socket.io
- ✅ concurrently
- ✅ lucide-react
- ✅ tailwindcss

---

## **✅ الخطوة 9: تكوين البيئة**

### **إنشاء ملف .env:**

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3050
NEXT_PUBLIC_WS_URL=http://localhost:3051

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=saudi_store
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_SSL=false
DB_POOL_MAX=20

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# WebSocket
WS_PORT=3051
```

---

## **✅ الخطوة 10: تشغيل المشروع**

### **تشغيل كل شيء معاً:**

```bash
npm run dev:all
```

### **أو بشكل منفصل:**

**Terminal 1 - Next.js:**

```bash
npm run dev
```

**Terminal 2 - WebSocket:**

```bash
npm run ws
```

---

## **✅ الخطوة 11: فتح المتصفح**

```
http://localhost:3050
```

### **الصفحات المتاحة:**

- `/en/dashboard` - لوحة القيادة
- `/ar/dashboard` - لوحة القيادة (عربي)
- `/en/login` - تسجيل الدخول
- `/en/register/complete` - التسجيل الكامل

---

## **✅ الخطوة 12: اختبار Command Palette**

```
اضغط Ctrl/Cmd + K
```

يجب أن يظهر Command Palette مع:

- قائمة التنقل
- الإجراءات السريعة
- البحث

---

## **📊 ملخص ما تم تفعيله**

### **✅ قاعدة البيانات:**

- ✅ 20+ جدول
- ✅ 10+ triggers
- ✅ 15+ functions
- ✅ 2+ views
- ✅ بيانات تجريبية

### **✅ الأنظمة:**

1. **Platform Admin** - إدارة المنصة
2. **Tenant Registration** - تسجيل العملاء
3. **Workflows** - سير العمل
4. **Red Flags Detection** - كشف الأنماط المشبوهة
5. **Licensing & Costs** - التراخيص والتكاليف

### **✅ الميزات:**

- ✅ Command Palette (Ctrl/K)
- ✅ Real-Time Workflow Timeline
- ✅ WebSocket Integration
- ✅ Red Flags Detection (6 types)
- ✅ AI Agents (5 agents)
- ✅ License Management (4 types)
- ✅ Owner Permissions
- ✅ Cost Tracking
- ✅ RBAC (6 roles)
- ✅ Multi-tenant
- ✅ Bilingual AR/EN

---

## **🔄 إعداد Scheduler (اختياري)**

### **Windows Task Scheduler:**

```powershell
# معالجة الأحداث كل دقيقة
schtasks /create /tn "ProcessAIEvents" /tr "psql -U postgres -d saudi_store -c \"SELECT process_pending_events()\"" /sc minute /mo 1

# أرشفة الأحداث يومياً
schtasks /create /tn "ArchiveOldEvents" /tr "psql -U postgres -d saudi_store -c \"SELECT archive_old_events()\"" /sc daily /st 02:00
```

### **Node.js Scheduler (موصى به):**

إضافة في `server/websocket.ts`:

```typescript
// معالجة الأحداث كل دقيقة
setInterval(async () => {
  try {
    const result = await query('SELECT * FROM process_pending_events()');
    console.log('✅ Events processed:', result.rows[0]);
  } catch (error) {
    console.error('❌ Event processing failed:', error);
  }
}, 60000);

// أرشفة الأحداث يومياً
setInterval(async () => {
  try {
    const result = await query('SELECT archive_old_events()');
    console.log('🗄️ Events archived:', result.rows[0]);
  } catch (error) {
    console.error('❌ Archive failed:', error);
  }
}, 86400000);
```

---

## **✅ قائمة التحقق النهائية**

- [ ] PostgreSQL مثبت ويعمل
- [ ] قاعدة البيانات `saudi_store` منشأة
- [ ] 5 Schema files تم تشغيلها
- [ ] 20+ جدول موجودة
- [ ] 10+ triggers نشطة
- [ ] 15+ functions موجودة
- [ ] بيانات تجريبية مدخلة
- [ ] اختبار Red Flags نجح
- [ ] `npm install` تم تشغيله
- [ ] `.env` تم إنشاؤه
- [ ] `npm run dev:all` يعمل
- [ ] المتصفح يفتح على localhost:3050
- [ ] Command Palette يعمل (Ctrl/K)
- [ ] Real-Time Timeline يعمل

---

## **🆘 استكشاف الأخطاء**

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
psql -U postgres -d saudi_store -f database/schema/13-licensing-costs.sql
```

### **مشكلة: Triggers لا تعمل**

```sql
-- التحقق من Triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- إعادة تشغيل Schema
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql
```

### **مشكلة: Port مستخدم**

```bash
# تغيير Port في package.json
"dev": "next dev -p 3051"
```

---

## **📚 الوثائق الكاملة**

1. **QUICK_START.md** - دليل البدء السريع
2. **COMPLETE_SETUP_GUIDE.md** - دليل الإعداد الشامل
3. **ADVANCED_FEATURES_GUIDE.md** - دليل الميزات المتقدمة
4. **RED_FLAGS_ACTIVATION_GUIDE.md** - دليل Red Flags
5. **LICENSING_SYSTEM_GUIDE.md** - دليل الترخيص
6. **IMPLEMENTATION_SUMMARY.md** - ملخص التنفيذ
7. **COMPLETE_ACTIVATION.md** - هذا الملف

---

**🎉 جميع الأنظمة جاهزة ومفعلة!**

**ابدأ الآن:**

```bash
# 1. إنشاء قاعدة البيانات
psql -U postgres -c "CREATE DATABASE saudi_store;"

# 2. تشغيل Schema files
cd d:\Projects\DoganHubStore
psql -U postgres -d saudi_store -f database/schema/09-platform-admin.sql
psql -U postgres -d saudi_store -f database/schema/10-tenant-registration-tables.sql
psql -U postgres -d saudi_store -f database/schema/11-workflow-tables.sql
psql -U postgres -d saudi_store -f database/schema/12-red-flags-triggers.sql
psql -U postgres -d saudi_store -f database/schema/13-licensing-costs.sql

# 3. تثبيت المكتبات
npm install

# 4. تشغيل المشروع
npm run dev:all

# 5. فتح المتصفح
# http://localhost:3050
```

**🚀 المتجر السعودي - Saudi Store**
