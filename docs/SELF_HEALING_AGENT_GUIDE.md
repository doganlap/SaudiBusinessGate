# 🤖 Self-Healing Agent Guide - Saudi Store

# دليل وكيل الإصلاح الذاتي - المتجر السعودي

## **نظرة عامة - Overview**

وكيل الإصلاح الذاتي هو نظام ذكي يراقب صحة التطبيق ويقوم بإصلاح المشاكل تلقائياً دون تدخل بشري.

The Self-Healing Agent is an intelligent system that monitors application health and automatically fixes issues without human intervention.

---

## **🚀 التشغيل السريع - Quick Start**

### **تشغيل الوكيل:**

```powershell
cd d:\Projects\DoganHubStore
.\scripts\start-self-healing.ps1
```

### **أو عبر API:**

```bash
# تشغيل الوكيل
curl -X POST http://localhost:3050/api/agents/self-healing \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# فحص الحالة
curl http://localhost:3050/api/agents/self-healing?action=status

# إصلاح فوري
curl -X POST http://localhost:3050/api/agents/self-healing \
  -H "Content-Type: application/json" \
  -d '{"action": "heal_now"}'
```

---

## **🔍 ما يراقبه الوكيل - What the Agent Monitors**

### **1. الخادم المحلي (Localhost Server):**

- **المراقبة:** فحص استجابة `http://localhost:3050/`
- **الإصلاح:** إعادة تشغيل `npm run dev`
- **الأولوية:** حرجة (Critical)

### **2. المكتبات (Dependencies):**

- **المراقبة:** وجود مجلد `node_modules`
- **الإصلاح:** تشغيل `npm install`
- **الأولوية:** عالية (High)

### **3. مشاكل إمكانية الوصول (Accessibility Issues):**

- **المراقبة:** فحص عناصر `<select>` بدون `aria-label`
- **الإصلاح:** تشغيل `fix-accessibility.ps1`
- **الأولوية:** متوسطة (Medium)

### **4. مشاكل CSS Inline:**

- **المراقبة:** فحص `style={}` في الملفات
- **الإصلاح:** تشغيل `fix-specific-issues.ps1`
- **الأولوية:** منخفضة (Low)

### **5. ملفات التكوين (Config Files):**

- **المراقبة:** وجود `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- **الإصلاح:** إنشاء الملفات المفقودة
- **الأولوية:** عالية (High)

### **6. نظام Red Flags:**

- **المراقبة:** وجود ملفات النظام الأساسية
- **الإصلاح:** تنبيه للمستخدم
- **الأولوية:** متوسطة (Medium)

---

## **⚙️ كيف يعمل الوكيل - How the Agent Works**

### **دورة الفحص (Check Cycle):**

```
كل 30 ثانية:
1. فحص صحة النظام
2. تحديد المشاكل
3. تطبيق الإصلاحات
4. تسجيل النتائج
5. إرسال التنبيهات
```

### **أولويات الإصلاح:**

1. **Critical** - إصلاح فوري
2. **High** - إصلاح خلال دقيقة
3. **Medium** - إصلاح خلال 5 دقائق
4. **Low** - إصلاح خلال 15 دقيقة

---

## **📊 مراقبة الوكيل - Agent Monitoring**

### **واجهة المراقبة:**

```powershell
# تشغيل مع مراقبة مباشرة
.\scripts\start-self-healing.ps1

# النتيجة:
[1] 14:30:15 - Agent Status: running
   Recent healing actions:
   ✅ [14:29:45] accessibility_issues
   ✅ [14:28:30] inline_css_issues
   ❌ [14:27:15] localhost_server

[2] 14:30:45 - Agent Status: running
🔍 Performing comprehensive health check...
✅ Manual healing completed
   Actions taken:
   ✅ node_modules
   ✅ config_files
```

### **API Endpoints:**

```typescript
// تشغيل الوكيل
POST /api/agents/self-healing
{
  "action": "start"
}

// إيقاف الوكيل
POST /api/agents/self-healing
{
  "action": "stop"
}

// فحص الحالة
GET /api/agents/self-healing?action=status

// إصلاح فوري
POST /api/agents/self-healing
{
  "action": "heal_now"
}

// الحصول على السجل
GET /api/agents/self-healing?action=log
```

---

## **🔧 تخصيص الوكيل - Customizing the Agent**

### **إضافة فحص جديد:**

```typescript
// في lib/agents/self-healing-agent.ts
{
  name: 'custom_check',
  type: 'file',
  priority: 'medium',
  description: 'Custom health check',
  check: async () => {
    // منطق الفحص
    return true; // أو false
  },
  heal: async () => {
    // منطق الإصلاح
    console.log('Healing custom issue...');
  }
}
```

### **تعديل فترة الفحص:**

```typescript
// تغيير من 30 ثانية إلى دقيقة
setInterval(async () => {
  await this.performHealthCheck();
}, 60000); // 60 ثانية
```

---

## **📝 سجل الإصلاحات - Healing Log**

### **بنية السجل:**

```typescript
interface HealingResult {
  success: boolean;      // نجح الإصلاح أم لا
  action: string;        // نوع الإصلاح
  details: string;       // تفاصيل الإصلاح
  timestamp: Date;       // وقت الإصلاح
}
```

### **مثال على السجل:**

```json
[
  {
    "success": true,
    "action": "accessibility_issues",
    "details": "Fix accessibility issues automatically",
    "timestamp": "2024-11-11T23:30:15.123Z"
  },
  {
    "success": false,
    "action": "localhost_server",
    "details": "Error: ECONNREFUSED",
    "timestamp": "2024-11-11T23:29:45.456Z"
  }
]
```

---

## **🚨 التنبيهات والإشعارات - Alerts & Notifications**

### **أنواع التنبيهات:**

- **✅ نجح الإصلاح** - تسجيل في السجل
- **❌ فشل الإصلاح** - تسجيل + تنبيه
- **⚠️ مشكلة متكررة** - تنبيه عاجل

### **قنوات التنبيه:**

```typescript
// يمكن إضافة تكامل مع:
- Slack
- Email
- SMS
- Discord
- Teams
```

---

## **🔒 الأمان - Security**

### **صلاحيات الوكيل:**

- **قراءة الملفات** - فحص وجود الملفات
- **كتابة الملفات** - إنشاء ملفات التكوين
- **تشغيل الأوامر** - npm install, PowerShell scripts
- **الوصول للشبكة** - فحص localhost

### **قيود الأمان:**

- لا يحذف ملفات المستخدم
- لا يعدل ملفات الكود المصدري
- لا يصل للملفات الحساسة
- يسجل جميع الإجراءات

---

## **📈 الأداء - Performance**

### **استهلاك الموارد:**

- **الذاكرة:** ~10-20 MB
- **المعالج:** <1% في المتوسط
- **الشبكة:** طلبات محلية فقط
- **القرص:** قراءة ملفات صغيرة

### **تحسين الأداء:**

```typescript
// تقليل تكرار الفحص للمشاكل المنخفضة الأولوية
if (check.priority === 'low' && Date.now() % 300000 !== 0) {
  continue; // تخطي الفحص إلا كل 5 دقائق
}
```

---

## **🧪 الاختبار - Testing**

### **اختبار الوكيل:**

```powershell
# اختبار تشغيل الوكيل
.\scripts\start-self-healing.ps1

# اختبار API
curl http://localhost:3050/api/agents/self-healing?action=status

# اختبار الإصلاح اليدوي
curl -X POST http://localhost:3050/api/agents/self-healing \
  -H "Content-Type: application/json" \
  -d '{"action": "heal_now"}'
```

### **محاكاة المشاكل:**

```powershell
# محاكاة مشكلة المكتبات
Remove-Item -Recurse -Force node_modules

# محاكاة مشكلة الخادم
taskkill /F /IM node.exe

# مراقبة الإصلاح التلقائي
# الوكيل سيكتشف ويصلح المشاكل تلقائياً
```

---

## **🔧 استكشاف الأخطاء - Troubleshooting**

### **مشاكل شائعة:**

#### **الوكيل لا يبدأ:**

```powershell
# فحص الخادم
Get-NetTCPConnection -LocalPort 3050 -State Listen

# إعادة تشغيل الخادم
npm run dev

# تشغيل الوكيل يدوياً
node -e "
const SelfHealingAgent = require('./lib/agents/self-healing-agent.ts');
const agent = new SelfHealingAgent();
agent.startSelfHealing();
"
```

#### **الإصلاحات لا تعمل:**

```powershell
# فحص الصلاحيات
Get-ExecutionPolicy

# تعيين صلاحيات PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# تشغيل كمدير
# انقر بزر الماوس الأيمن على PowerShell -> Run as Administrator
```

#### **API لا يستجيب:**

```powershell
# فحص الخادم
curl http://localhost:3050/api/agents/self-healing?action=status

# فحص السجلات
Get-Content logs/self-healing.log -Tail 20
```

---

## **📚 أمثلة متقدمة - Advanced Examples**

### **تكامل مع CI/CD:**

```yaml
# في GitHub Actions
- name: Start Self-Healing Agent
  run: |
    cd d:\Projects\DoganHubStore
    .\scripts\start-self-healing.ps1 &
    sleep 60
    curl http://localhost:3050/api/agents/self-healing?action=status
```

### **مراقبة مخصصة:**

```typescript
// مراقبة مخصصة للأداء
{
  name: 'performance_monitor',
  type: 'service',
  priority: 'low',
  description: 'Monitor application performance',
  check: async () => {
    const start = Date.now();
    await fetch('http://localhost:3050/');
    const responseTime = Date.now() - start;
    return responseTime < 1000; // أقل من ثانية
  },
  heal: async () => {
    // إعادة تشغيل الخادم إذا كان بطيئاً
    await execAsync('npm run dev');
  }
}
```

---

## **🎯 أفضل الممارسات - Best Practices**

### **للتطوير:**

- تشغيل الوكيل في بيئة التطوير
- مراقبة السجلات بانتظام
- اختبار الإصلاحات يدوياً أولاً

### **للإنتاج:**

- تقليل تكرار الفحص
- تفعيل التنبيهات
- نسخ احتياطي من السجلات

### **للفريق:**

- توثيق الإصلاحات المخصصة
- مشاركة السجلات المهمة
- تدريب الفريق على الوكيل

---

**🤖 Self-Healing Agent جاهز!**

**المتجر السعودي - DoganHubStore**
**وكيل ذكي للإصلاح التلقائي**

**🚀 للتشغيل الفوري:**

```powershell
cd d:\Projects\DoganHubStore
.\scripts\start-self-healing.ps1
```

**✅ الميزات:**

- 🔍 مراقبة مستمرة (كل 30 ثانية)
- 🔧 إصلاح تلقائي للمشاكل الشائعة
- 📊 سجل مفصل للإجراءات
- 🚨 تنبيهات فورية
- ⚙️ قابل للتخصيص والتوسيع
- 🔒 آمن ومحدود الصلاحيات

**🎉 لا مزيد من المشاكل اليدوية - الوكيل يهتم بكل شيء!**
