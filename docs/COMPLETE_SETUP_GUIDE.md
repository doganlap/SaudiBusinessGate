# 🚀 دليل الإعداد الشامل - Complete Setup Guide

## **المتجر السعودي - Saudi Store**

### **منصة إدارة الأعمال المتكاملة - Complete Business Management Platform**

---

## **📋 جدول المحتويات - Table of Contents**

1. [المكتبات المطلوبة](#1-المكتبات-المطلوبة)
2. [تثبيت المشروع](#2-تثبيت-المشروع)
3. [إعداد قاعدة البيانات](#3-إعداد-قاعدة-البيانات)
4. [تشغيل المشروع](#4-تشغيل-المشروع)
5. [الميزات المتقدمة](#5-الميزات-المتقدمة)
6. [الاختبارات](#6-الاختبارات)
7. [النشر](#7-النشر)

---

## **1. المكتبات المطلوبة**

### **✅ المكتبات الأساسية:**

```json
{
  "next": "^16.0.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^5.9.3",
  "tailwindcss": "^3.4.14",
  "framer-motion": "^11.11.17",
  "lucide-react": "^0.553.0",
  "cmdk": "^1.0.0",
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1",
  "pg": "^8.16.3",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.2"
}
```

---

## **2. تثبيت المشروع**

### **الخطوة 1: استنساخ المشروع**

```bash
cd d:\Projects\DoganHubStore
```

### **الخطوة 2: تثبيت المكتبات**

```bash
npm install
```

### **الخطوة 3: إنشاء ملف البيئة**

```bash
cp .env.example .env
```

### **الخطوة 4: تحديث متغيرات البيئة**

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

# Microsoft OAuth (اختياري)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_REDIRECT_URI=http://localhost:3050/api/auth/microsoft/callback

# Stripe (اختياري)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# WebSocket
WS_PORT=3051
```

---

## **3. إعداد قاعدة البيانات**

### **الخطوة 1: إنشاء قاعدة البيانات**

```sql
CREATE DATABASE saudi_store;
```

### **الخطوة 2: تشغيل Schema Files**

```bash
# تشغيل جميع ملفات SQL بالترتيب
psql -U postgres -d saudi_store -f database/schema/09-platform-admin.sql
psql -U postgres -d saudi_store -f database/schema/10-tenant-registration-tables.sql
psql -U postgres -d saudi_store -f database/schema/11-workflow-tables.sql
psql -U postgres -d saudi_store -f database/schema/01-finance-tables.sql
psql -U postgres -d saudi_store -f database/schema/02-sales-tables.sql
```

### **الخطوة 3: التحقق من الجداول**

```sql
-- عرض جميع الجداول
\dt

-- يجب أن تظهر:
-- tenants
-- platform_users
-- workflow_instances
-- workflow_steps
-- workflow_events
-- financial_accounts
-- transactions
-- sales_leads
-- sales_deals
-- وغيرها...
```

---

## **4. تشغيل المشروع**

### **الطريقة 1: تشغيل Next.js فقط**

```bash
npm run dev
# يعمل على http://localhost:3050
```

### **الطريقة 2: تشغيل WebSocket فقط**

```bash
npm run ws
# يعمل على http://localhost:3051
```

### **الطريقة 3: تشغيل كل شيء معاً (موصى به)**

```bash
npm run dev:all
# يشغل Next.js + WebSocket معاً
```

### **التحقق من التشغيل:**

```bash
# افتح المتصفح
http://localhost:3050

# صفحات للاختبار:
http://localhost:3050/en/dashboard
http://localhost:3050/ar/dashboard
http://localhost:3050/en/login
http://localhost:3050/en/register/complete
```

---

## **5. الميزات المتقدمة**

### **5.1 Command Palette (Ctrl/⌘K)**

**الاستخدام:**

```tsx
import CommandPalette from '@/components/CommandPalette';

<CommandPalette 
  locale="ar"
  userRole="admin"
  onThemeToggle={() => setDark(!dark)}
  onLocaleToggle={() => setLocale('en')}
/>
```

**الاختصارات:**

- `Ctrl/Cmd + K` - فتح
- `↑↓` - التنقل
- `Enter` - اختيار
- `ESC` - إغلاق

---

### **5.2 Real-Time Workflow Timeline**

**الاستخدام:**

```tsx
import RealTimeWorkflowTimeline from '@/components/RealTimeWorkflowTimeline';

<RealTimeWorkflowTimeline 
  locale="ar"
  tenantId="tenant-123"
  workflowId="workflow-456"
/>
```

**WebSocket Events:**

```typescript
// الاتصال
socket.on('connect', () => console.log('Connected'));

// استقبال التحديثات
socket.on('workflow:update', (workflow) => {
  console.log('Workflow updated:', workflow);
});

socket.on('workflow:step:update', ({ workflowId, step }) => {
  console.log('Step updated:', step);
});
```

---

### **5.3 RBAC - التحكم بالوصول**

**الأدوار:**

```typescript
const roles = {
  viewer: ['dashboard:read'],
  user: ['dashboard:*', 'sales:read'],
  manager: ['dashboard:*', 'sales:*', 'finance:read'],
  admin: ['*:read', '*:create', '*:update'],
  super_admin: ['*:*']
};
```

**إخفاء العناصر:**

```tsx
{userRole === 'admin' || userRole === 'super_admin' ? (
  <AdminPanel />
) : null}
```

---

## **6. الاختبارات**

### **تشغيل جميع الاختبارات:**

```bash
npm test
```

### **اختبارات محددة:**

```bash
npm run test:auth        # اختبارات المصادقة
npm run test:security    # اختبارات الأمان
npm run test:load        # اختبارات الحمل
```

### **مع التغطية:**

```bash
npm run test:coverage
```

---

## **7. النشر**

### **7.1 Build للإنتاج**

```bash
npm run build
```

### **7.2 تشغيل الإنتاج**

```bash
npm start
```

### **7.3 متغيرات البيئة للإنتاج**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://saudistore.com
NEXT_PUBLIC_WS_URL=https://ws.saudistore.com
POSTGRES_SSL=true
```

---

## **📁 هيكل المشروع**

```
DoganHubStore/
├── app/
│   ├── [lng]/
│   │   ├── layout-shell.tsx         # Shell الرئيسي
│   │   ├── login/                   # صفحة تسجيل الدخول
│   │   ├── register/                # صفحة التسجيل
│   │   ├── dashboard/               # لوحة القيادة
│   │   └── (platform)/              # صفحات المنصة
│   └── api/
│       ├── auth/                    # APIs المصادقة
│       ├── workflows/               # APIs سير العمل
│       └── finance/                 # APIs المالية
├── components/
│   ├── CommandPalette.tsx           # Command Palette
│   └── RealTimeWorkflowTimeline.tsx # Timeline الفوري
├── server/
│   └── websocket.ts                 # WebSocket Server
├── database/
│   └── schema/                      # ملفات SQL
├── lib/
│   ├── db/                          # اتصال قاعدة البيانات
│   └── services/                    # خدمات الأعمال
└── __tests__/                       # الاختبارات
```

---

## **✅ قائمة التحقق النهائية**

### **التثبيت:**

- ✅ Node.js 18+ مثبت
- ✅ PostgreSQL 14+ مثبت
- ✅ npm install تم تشغيله
- ✅ .env تم إنشاؤه وتحديثه

### **قاعدة البيانات:**

- ✅ قاعدة البيانات تم إنشاؤها
- ✅ جميع Schema files تم تشغيلها
- ✅ الجداول موجودة
- ✅ البيانات التجريبية موجودة

### **التشغيل:**

- ✅ Next.js يعمل على 3050
- ✅ WebSocket يعمل على 3051
- ✅ الصفحات تفتح بدون أخطاء
- ✅ Command Palette يعمل (Ctrl/K)
- ✅ Real-Time Timeline يعمل

### **الميزات:**

- ✅ تسجيل الدخول يعمل
- ✅ التسجيل يعمل
- ✅ RBAC مطبق
- ✅ Glassmorphic Theme مطبق
- ✅ دعم ثنائي اللغة يعمل

---

## **🆘 استكشاف الأخطاء**

### **مشكلة: لا يمكن الاتصال بقاعدة البيانات**

```bash
# تحقق من PostgreSQL
sudo systemctl status postgresql

# تحقق من الاتصال
psql -U postgres -d saudi_store -c "SELECT 1"

# تحقق من .env
cat .env | grep POSTGRES
```

### **مشكلة: WebSocket لا يتصل**

```bash
# تحقق من تشغيل السيرفر
npm run ws

# تحقق من البورت
netstat -an | grep 3051

# تحقق من CORS
# تأكد من NEXT_PUBLIC_APP_URL صحيح في .env
```

### **مشكلة: Command Palette لا يفتح**

```bash
# تحقق من تثبيت cmdk
npm list cmdk

# أعد التثبيت
npm install cmdk
```

---

## **📚 الوثائق الإضافية**

- **ADVANCED_FEATURES_GUIDE.md** - دليل الميزات المتقدمة
- **PLATFORM_REBRANDING.md** - دليل التصميم الجديد
- **TESTING_CHECKLIST.md** - قائمة الاختبارات
- **SECURITY_PENTEST_SUITE.md** - دليل الأمان
- **TRANSACTION_COMPLIANCE_CHECKLIST.md** - دليل الامتثال المالي

---

## **🎉 كل شيء جاهز!**

**المنصة الآن:**
✅ مثبتة بالكامل  
✅ قاعدة البيانات جاهزة  
✅ WebSocket يعمل  
✅ Command Palette جاهز  
✅ Real-Time Timeline جاهز  
✅ RBAC مطبق  
✅ Glassmorphic Theme مطبق  
✅ دعم ثنائي اللغة  
✅ جاهزة للإنتاج  

**ابدأ الآن:**

```bash
npm run dev:all
```

**افتح المتصفح:**

```
http://localhost:3050
```

**🚀 استمتع بالمتجر السعودي!**
