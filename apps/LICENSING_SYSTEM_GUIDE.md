# 💳 دليل نظام الترخيص والتكاليف - Licensing & Cost System Guide

## **المتجر السعودي - Saudi Store**
### **نظام إدارة التراخيص والتكاليف للمستخدمين والمالكين**

---

## **📋 نظرة عامة - Overview**

نظام متكامل لإدارة تراخيص المستخدمين، تتبع التكاليف، صلاحيات المالكين، وإدارة الاشتراكات.

---

## **🎯 الميزات الرئيسية**

### **✅ 4 أنواع تراخيص:**
1. **Basic License** - ترخيص أساسي (99 ريال/شهر)
2. **Professional License** - ترخيص احترافي (299 ريال/شهر)
3. **Enterprise License** - ترخيص مؤسسي (999 ريال/شهر)
4. **Owner License** - ترخيص المالك (مجاني)

### **✅ إدارة التكاليف:**
- تتبع تكاليف التراخيص
- رسوم الإعداد
- رسوم التجاوز
- رسوم الدعم
- فواتير تلقائية

### **✅ صلاحيات المالك:**
- إدارة التراخيص
- عرض التكاليف
- إدارة الفواتير
- إضافة/حذف المستخدمين
- تعيين الأدوار
- تصدير البيانات

---

## **📊 الجداول الرئيسية**

### **1. license_types - أنواع التراخيص**
```sql
- license_code: كود الترخيص (BASIC, PROFESSIONAL, ENTERPRISE, OWNER)
- license_name: اسم الترخيص
- monthly_cost: التكلفة الشهرية
- annual_cost: التكلفة السنوية
- setup_fee: رسوم الإعداد
- features: الميزات (JSON)
- max_users: الحد الأقصى للمستخدمين
- max_storage_gb: الحد الأقصى للتخزين
- max_transactions_per_month: الحد الأقصى للمعاملات
```

### **2. user_licenses - تراخيص المستخدمين**
```sql
- user_id: معرف المستخدم
- tenant_id: معرف العميل
- license_type_id: نوع الترخيص
- license_key: مفتاح الترخيص الفريد
- status: الحالة (active, suspended, expired, cancelled, trial)
- start_date: تاريخ البدء
- end_date: تاريخ الانتهاء
- billing_cycle: دورة الفوترة (monthly, annual)
- is_owner: هل هو مالك
- current_users: عدد المستخدمين الحالي
- current_storage_gb: التخزين المستخدم
- current_transactions: عدد المعاملات
```

### **3. license_costs - تكاليف التراخيص**
```sql
- user_license_id: معرف الترخيص
- tenant_id: معرف العميل
- cost_type: نوع التكلفة (license_fee, setup_fee, overage_fee, support_fee)
- amount: المبلغ
- billing_period_start: بداية فترة الفوترة
- billing_period_end: نهاية فترة الفوترة
- payment_status: حالة الدفع (pending, paid, overdue, cancelled, refunded)
- invoice_number: رقم الفاتورة
```

### **4. owner_permissions - صلاحيات المالك**
```sql
- user_id: معرف المالك
- tenant_id: معرف العميل
- can_manage_licenses: إدارة التراخيص
- can_view_costs: عرض التكاليف
- can_manage_billing: إدارة الفواتير
- can_add_users: إضافة مستخدمين
- can_assign_roles: تعيين الأدوار
- max_users_can_add: الحد الأقصى للمستخدمين
- max_cost_approval_limit: حد الموافقة على التكاليف
```

---

## **🚀 التفعيل**

### **تشغيل Schema:**
```bash
psql -U postgres -d saudi_store -f database/schema/13-licensing-costs.sql
```

---

## **💼 أمثلة الاستخدام**

### **1. إنشاء ترخيص لمستخدم:**

```sql
-- إنشاء ترخيص احترافي
INSERT INTO user_licenses (
    user_id,
    tenant_id,
    license_type_id,
    license_key,
    status,
    start_date,
    end_date,
    billing_cycle,
    is_owner
) VALUES (
    'user-uuid-here',
    'tenant-uuid-here',
    (SELECT id FROM license_types WHERE license_code = 'PROFESSIONAL'),
    generate_license_key('tenant-uuid-here', 'user-uuid-here'),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'monthly',
    false
);
```

### **2. إنشاء ترخيص مالك:**

```sql
-- إنشاء ترخيص مالك (مجاني)
INSERT INTO user_licenses (
    user_id,
    tenant_id,
    license_type_id,
    license_key,
    status,
    is_owner,
    billing_cycle
) VALUES (
    'owner-uuid-here',
    'tenant-uuid-here',
    (SELECT id FROM license_types WHERE license_code = 'OWNER'),
    generate_license_key('tenant-uuid-here', 'owner-uuid-here'),
    'active',
    true,
    'one-time'
);

-- إضافة صلاحيات المالك
INSERT INTO owner_permissions (
    user_id,
    tenant_id,
    can_manage_licenses,
    can_view_costs,
    can_manage_billing,
    can_add_users,
    can_remove_users,
    can_assign_roles,
    max_users_can_add,
    max_cost_approval_limit
) VALUES (
    'owner-uuid-here',
    'tenant-uuid-here',
    true,
    true,
    true,
    true,
    true,
    true,
    NULL,  -- unlimited
    NULL   -- unlimited
);
```

### **3. تسجيل تكلفة شهرية:**

```sql
INSERT INTO license_costs (
    user_license_id,
    tenant_id,
    cost_type,
    amount,
    currency,
    billing_period_start,
    billing_period_end,
    payment_status,
    description,
    description_ar
) VALUES (
    'license-uuid-here',
    'tenant-uuid-here',
    'license_fee',
    299.00,
    'SAR',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    'pending',
    'Monthly Professional License Fee',
    'رسوم الترخيص الاحترافي الشهرية'
);
```

### **4. التحقق من صلاحية الترخيص:**

```sql
-- التحقق من ترخيص محدد
SELECT check_license_validity('license-uuid-here');

-- عرض جميع التراخيص النشطة
SELECT * FROM v_active_licenses
WHERE tenant_id = 'tenant-uuid-here';
```

### **5. حساب التكلفة الشهرية:**

```sql
-- حساب إجمالي التكلفة الشهرية للعميل
SELECT calculate_monthly_cost('tenant-uuid-here');

-- عرض ملخص التكاليف
SELECT * FROM v_tenant_costs
WHERE tenant_id = 'tenant-uuid-here'
ORDER BY billing_month DESC;
```

### **6. تسجيل استخدام الترخيص:**

```sql
-- تسجيل معاملة
SELECT log_license_usage(
    'license-uuid-here',
    'transaction',
    1,
    '{"transaction_id": "txn-123", "amount": 5000}'::jsonb
);

-- تسجيل تسجيل دخول
SELECT log_license_usage(
    'license-uuid-here',
    'login',
    1,
    '{"ip": "192.168.1.1", "device": "Chrome"}'::jsonb
);
```

---

## **📊 التقارير والاستعلامات**

### **عرض التراخيص النشطة:**

```sql
SELECT 
    user_name,
    user_email,
    license_name,
    status,
    is_owner,
    start_date,
    end_date,
    monthly_cost,
    current_users,
    max_users
FROM v_active_licenses
WHERE tenant_id = 'tenant-uuid-here'
ORDER BY is_owner DESC, start_date DESC;
```

### **عرض التكاليف الشهرية:**

```sql
SELECT 
    billing_month,
    total_cost,
    paid_amount,
    pending_amount,
    overdue_amount
FROM v_tenant_costs
WHERE tenant_id = 'tenant-uuid-here'
ORDER BY billing_month DESC
LIMIT 12;
```

### **عرض استخدام الترخيص:**

```sql
SELECT 
    usage_type,
    COUNT(*) as usage_count,
    DATE(logged_at) as usage_date
FROM license_usage_logs
WHERE tenant_id = 'tenant-uuid-here'
    AND logged_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY usage_type, DATE(logged_at)
ORDER BY usage_date DESC, usage_count DESC;
```

### **التراخيص القريبة من الانتهاء:**

```sql
SELECT 
    ul.license_key,
    u.full_name,
    u.email,
    lt.license_name,
    ul.end_date,
    ul.end_date - CURRENT_DATE as days_remaining
FROM user_licenses ul
JOIN platform_users u ON ul.user_id = u.id
JOIN license_types lt ON ul.license_type_id = lt.id
WHERE ul.tenant_id = 'tenant-uuid-here'
    AND ul.status = 'active'
    AND ul.end_date IS NOT NULL
    AND ul.end_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY ul.end_date ASC;
```

---

## **🔐 RBAC - التحكم بالوصول**

### **صلاحيات المالك:**

```typescript
interface OwnerPermissions {
  can_manage_licenses: boolean;
  can_view_costs: boolean;
  can_manage_billing: boolean;
  can_add_users: boolean;
  can_remove_users: boolean;
  can_assign_roles: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  can_manage_integrations: boolean;
  can_configure_settings: boolean;
  max_users_can_add?: number;
  max_cost_approval_limit?: number;
}
```

### **التحقق من الصلاحيات:**

```sql
-- التحقق من صلاحية المالك
SELECT 
    can_manage_licenses,
    can_view_costs,
    can_add_users,
    max_users_can_add,
    max_cost_approval_limit
FROM owner_permissions
WHERE user_id = 'owner-uuid-here'
    AND tenant_id = 'tenant-uuid-here';
```

---

## **💰 أنواع التراخيص والأسعار**

### **1. Basic License - ترخيص أساسي**
- **السعر:** 99 ريال/شهر أو 990 ريال/سنة
- **المستخدمون:** حتى 5 مستخدمين
- **التخزين:** 10 GB
- **المعاملات:** 1,000 معاملة/شهر
- **الميزات:**
  - الوصول للوحة القيادة
  - تقارير أساسية
  - دعم عبر البريد الإلكتروني
- **تجربة مجانية:** 14 يوم

### **2. Professional License - ترخيص احترافي**
- **السعر:** 299 ريال/شهر أو 2,990 ريال/سنة
- **رسوم الإعداد:** 500 ريال (مرة واحدة)
- **المستخدمون:** حتى 25 مستخدم
- **التخزين:** 100 GB
- **المعاملات:** 10,000 معاملة/شهر
- **الميزات:**
  - لوحة قيادة كاملة
  - تقارير متقدمة
  - الوصول لـ API
  - دعم ذو أولوية
  - سير عمل مخصص
- **تجربة مجانية:** 30 يوم

### **3. Enterprise License - ترخيص مؤسسي**
- **السعر:** 999 ريال/شهر أو 9,990 ريال/سنة
- **رسوم الإعداد:** 2,000 ريال (مرة واحدة)
- **المستخدمون:** غير محدود
- **التخزين:** غير محدود
- **المعاملات:** غير محدود
- **الميزات:**
  - جميع الميزات
  - White Label
  - دعم مخصص
  - تطوير مخصص
  - ضمان SLA

### **4. Owner License - ترخيص المالك**
- **السعر:** مجاني
- **الميزات:**
  - وصول كامل
  - جميع الصلاحيات
  - إدارة التكاليف
  - إدارة المستخدمين
  - التحكم بالفواتير

---

## **🔄 دورة حياة الترخيص**

```
1. إنشاء الترخيص (Create)
   ↓
2. تفعيل (Active/Trial)
   ↓
3. استخدام (Usage Tracking)
   ↓
4. تجديد (Renewal) أو
5. إيقاف (Suspended) أو
6. انتهاء (Expired) أو
7. إلغاء (Cancelled)
```

---

## **📧 إشعارات تلقائية**

### **إشعارات مقترحة:**

1. **قبل انتهاء الترخيص (30 يوم)**
2. **قبل انتهاء الترخيص (7 أيام)**
3. **انتهاء الترخيص**
4. **تجاوز حد الاستخدام (80%)**
5. **تجاوز حد الاستخدام (100%)**
6. **فاتورة جديدة**
7. **دفع ناجح**
8. **دفع فاشل**

---

## **✅ قائمة التحقق**

- [ ] Schema تم تشغيله
- [ ] أنواع التراخيص موجودة (4 أنواع)
- [ ] Functions تعمل
- [ ] Views منشأة
- [ ] Triggers نشطة
- [ ] اختبار إنشاء ترخيص نجح
- [ ] اختبار التحقق من الصلاحية نجح
- [ ] اختبار حساب التكلفة نجح

---

**🎉 نظام الترخيص والتكاليف جاهز!**

**الميزات:**
✅ 4 أنواع تراخيص  
✅ تتبع التكاليف  
✅ صلاحيات المالك  
✅ تسجيل الاستخدام  
✅ فواتير تلقائية  
✅ تقارير شاملة  
✅ Multi-tenant  

**ابدأ الآن:**
```bash
psql -U postgres -d saudi_store -f database/schema/13-licensing-costs.sql
```

**🚀 المتجر السعودي - Saudi Store**
