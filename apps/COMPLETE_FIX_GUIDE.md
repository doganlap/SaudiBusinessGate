# 🛠️ Complete Fix Guide - DoganHubStore
# دليل الإصلاحات الشامل - المتجر السعودي

## **نظرة عامة - Overview**

هذا الدليل يحتوي على جميع الحلول للمشاكل الشائعة في مشروع DoganHubStore، بما في ذلك:
- مشاكل الاتصال المحلي (ERR_CONNECTION_REFUSED)
- مشاكل إمكانية الوصول (Accessibility Issues)
- مشاكل التصميم والـ CSS
- مشاكل الأمان والامتثال

This guide contains all solutions for common DoganHubStore project issues, including:
- Localhost connection issues (ERR_CONNECTION_REFUSED)
- Accessibility issues
- CSS and design issues
- Security and compliance issues

---

## **🚀 الإصلاح السريع - Quick Fix**

### **تشغيل جميع الإصلاحات تلقائياً:**
```powershell
# في PowerShell (كمدير)
cd d:\Projects\DoganHubStore

# 1. إصلاح مشاكل الاتصال المحلي
.\scripts\fix-localhost.ps1

# 2. إصلاح مشاكل إمكانية الوصول
.\scripts\fix-accessibility.ps1

# 3. إصلاح المشاكل المحددة
.\scripts\fix-specific-issues.ps1

# 4. تشغيل الخادم
npm run dev
```

### **أو تشغيل التشخيص السريع:**
```powershell
# تشخيص سريع للمشاكل
.\scripts\quick-diagnose.ps1
```

---

## **📋 قائمة المشاكل والحلول - Issues & Solutions**

### **🔴 مشاكل الاتصال المحلي - Connection Issues**

#### **المشكلة:** `ERR_CONNECTION_REFUSED`
```
This site can't be reached
localhost refused to connect
```

#### **الحل السريع:**
```powershell
# قتل العمليات المتضاربة
Get-NetTCPConnection -LocalPort 3050 -State Listen -ErrorAction SilentlyContinue | 
  ForEach-Object { taskkill /PID $_.OwningProcess /F }

# تشغيل الخادم
cd d:\Projects\DoganHubStore
npm run dev

# أو مع ربط جميع الواجهات
npx next dev -H 0.0.0.0 -p 3050
```

#### **الحل الشامل:**
```powershell
.\scripts\fix-localhost.ps1
```

---

### **♿ مشاكل إمكانية الوصول - Accessibility Issues**

#### **المشاكل الشائعة:**
- `Select element must have an accessible name`
- `Buttons must have discernible text`
- `Form elements must have labels`

#### **الحل التلقائي:**
```powershell
.\scripts\fix-accessibility.ps1
.\scripts\fix-specific-issues.ps1
```

#### **الحل اليدوي لعنصر واحد:**
```tsx
// قبل الإصلاح
<select className="form-select">
  <option>اختر خيار</option>
</select>

// بعد الإصلاح
<select 
  className="form-select" 
  aria-label="Filter options" 
  title="Select an option"
>
  <option>اختر خيار</option>
</select>
```

---

### **🎨 مشاكل CSS والتصميم - CSS & Design Issues**

#### **المشكلة:** `CSS inline styles should not be used`
```tsx
// مشكلة: استخدام inline styles
<div style={{background: 'linear-gradient(...)', transform: 'translateY(-2px)'}}>
```

#### **الحل:**
```tsx
// الحل: استخدام CSS classes
<div className="bg-gradient-custom transform-custom">
```

#### **CSS Classes المتاحة:**
```css
/* في accessibility-fixes.css */
.bg-gradient-custom { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.bg-gradient-emerald { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.bg-gradient-blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.transform-custom { transform: translateY(-2px); transition: transform 0.2s ease-in-out; }
.text-custom { color: #374151; }
```

---

### **📝 مشاكل HTML Structure**

#### **المشكلة:** `<ul> and <ol> must only directly contain <li>`
```tsx
// مشكلة: عناصر مباشرة غير صحيحة
<ul>
  <div>محتوى</div>
  <span>محتوى آخر</span>
</ul>
```

#### **الحل:**
```tsx
// الحل: استخدام li elements
<ul>
  <li><div>محتوى</div></li>
  <li><span>محتوى آخر</span></li>
</ul>
```

---

### **🌐 مشاكل اللغة - Language Issues**

#### **المشكلة:** `lang attribute must have a valid value`
```tsx
// مشكلة: قيم lang غير صحيحة
<html lang={locale}>
```

#### **الحل:**
```tsx
// الحل: استخدام language codes صحيحة
<html lang={locale === "ar" ? "ar-SA" : "en-US"}>
```

---

## **🔧 الأدوات المتاحة - Available Tools**

### **1. سكريبت التشخيص السريع:**
```powershell
.\scripts\quick-diagnose.ps1
```
**الوظائف:**
- فحص المنافذ المستمعة
- اختبار الاتصال
- فحص بنية المشروع
- تقديم توصيات سريعة

### **2. سكريبت إصلاح الاتصال المحلي:**
```powershell
.\scripts\fix-localhost.ps1
```
**الوظائف:**
- قتل العمليات المتضاربة
- إعداد جدار الحماية
- تكوين البروكسي
- اختبار الخادم
- تشغيل التطبيق

### **3. سكريبت إصلاح إمكانية الوصول:**
```powershell
.\scripts\fix-accessibility.ps1
```
**الوظائف:**
- إضافة ARIA attributes
- إنشاء CSS classes
- إنشاء مكونات مساعدة
- أدوات الاختبار

### **4. سكريبت الإصلاحات المحددة:**
```powershell
.\scripts\fix-specific-issues.ps1
```
**الوظائف:**
- إصلاح مشاكل محددة بالملف والسطر
- تحويل inline styles
- إصلاح HTML structure
- إصلاح lang attributes

---

## **📊 فحص النتائج - Checking Results**

### **1. فحص الاتصال:**
```powershell
# فحص المنافذ
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 3050 }

# اختبار الاتصال
Test-NetConnection -ComputerName localhost -Port 3050

# اختبار HTTP
Invoke-WebRequest -Uri "http://localhost:3050/" -TimeoutSec 5
```

### **2. فحص إمكانية الوصول:**
```bash
# تثبيت أدوات الفحص
npm install --save-dev @axe-core/react
npm install -g lighthouse

# تشغيل Lighthouse
lighthouse http://localhost:3050 --only-categories=accessibility --output=html

# فحص يدوي
# استخدم Tab للتنقل
# استخدم مقروء الشاشة (NVDA)
```

### **3. فحص CSS:**
```bash
# فحص CSS validation
npm install -g css-validator

# فحص Tailwind classes
npx tailwindcss -i ./app/globals.css -o ./dist/output.css --watch
```

---

## **🧪 الاختبار الشامل - Comprehensive Testing**

### **1. اختبار الوظائف الأساسية:**
```bash
# تشغيل الخادم
npm run dev

# فتح المتصفح
start http://localhost:3050

# اختبار الصفحات الرئيسية
# - الصفحة الرئيسية
# - صفحة Red Flags
# - صفحة GRC
# - صفحة AI Agents
```

### **2. اختبار إمكانية الوصول:**
```bash
# اختبار لوحة المفاتيح
# Tab - التنقل للأمام
# Shift+Tab - التنقل للخلف
# Enter - تفعيل الروابط والأزرار
# Space - تفعيل الأزرار
# Arrow keys - التنقل في القوائم

# اختبار مقروء الشاشة
# تشغيل NVDA أو JAWS
# التنقل بـ H (headings)
# التنقل بـ F (forms)
# التنقل بـ B (buttons)
```

### **3. اختبار الاستجابة:**
```bash
# اختبار أحجام الشاشة المختلفة
# Mobile: 375px
# Tablet: 768px
# Desktop: 1024px+

# اختبار الاتجاهات
# LTR (English)
# RTL (Arabic)
```

---

## **📱 اختبار الأجهزة المحمولة - Mobile Testing**

### **الوصول من الهاتف:**
```bash
# الحصول على IP المحلي
ipconfig | findstr IPv4

# تشغيل الخادم للشبكة
npx next dev -H 0.0.0.0 -p 3050

# الوصول من الهاتف
http://192.168.1.100:3050
```

### **اختبار Touch Targets:**
```css
/* التأكد من حجم أهداف اللمس */
button, select, input, a {
  min-height: 44px;
  min-width: 44px;
}
```

---

## **🔒 فحص الأمان - Security Check**

### **فحص المكتبات:**
```bash
# فحص الثغرات الأمنية
npm audit

# إصلاح الثغرات
npm audit fix

# فحص متقدم
npm install -g snyk
snyk test
```

### **فحص Headers:**
```bash
# فحص Security Headers
curl -I http://localhost:3050

# يجب أن تحتوي على:
# X-Frame-Options
# X-Content-Type-Options
# X-XSS-Protection
# Content-Security-Policy
```

---

## **📈 مراقبة الأداء - Performance Monitoring**

### **فحص الأداء:**
```bash
# Lighthouse Performance
lighthouse http://localhost:3050 --output=html

# Bundle Analysis
npm run build
npx @next/bundle-analyzer
```

### **مراقبة الذاكرة:**
```powershell
# فحص استخدام الذاكرة
Get-Process node* | Select-Object Name, CPU, WorkingSet

# فحص استخدام المنافذ
netstat -an | findstr :3050
```

---

## **🚨 استكشاف الأخطاء المتقدم - Advanced Troubleshooting**

### **إذا فشلت جميع الحلول:**

#### **1. إعادة تعيين كاملة:**
```powershell
# حذف node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# إعادة التثبيت
npm install

# إعادة البناء
npm run build
```

#### **2. فحص متقدم للشبكة:**
```powershell
# فحص DNS
nslookup localhost
ping localhost

# فحص Hosts file
Get-Content C:\Windows\System32\drivers\etc\hosts

# إعادة تعيين TCP/IP
netsh int ip reset
netsh winsock reset
```

#### **3. فحص مكافح الفيروسات:**
```
تأكد من أن مكافح الفيروسات لا يحجب:
- node.exe
- next.exe
- المنفذ 3050
- مجلد المشروع
```

---

## **📞 الحصول على المساعدة - Getting Help**

### **معلومات مطلوبة للدعم:**
```powershell
# تشغيل هذا الأمر وإرسال النتيجة
Write-Host "=== DoganHubStore Diagnostic Report ==="
Write-Host "Date: $(Get-Date)"
Write-Host "OS: $(Get-ComputerInfo | Select-Object -ExpandProperty WindowsProductName)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Node: $(node --version 2>$null)"
Write-Host "NPM: $(npm --version 2>$null)"
Write-Host "Project exists: $(Test-Path 'd:\Projects\DoganHubStore')"
Write-Host "Package.json exists: $(Test-Path 'd:\Projects\DoganHubStore\package.json')"
Write-Host "Node_modules exists: $(Test-Path 'd:\Projects\DoganHubStore\node_modules')"
Write-Host "Listening ports:"
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3050,3000 } | Format-Table -Auto
Write-Host "Last error: $Error[0]"
Write-Host "=== End Report ==="
```

---

## **✅ قائمة التحقق النهائية - Final Checklist**

### **قبل النشر في الإنتاج:**
- [ ] تشغيل جميع سكريبتات الإصلاح
- [ ] فحص إمكانية الوصول مع Lighthouse
- [ ] اختبار لوحة المفاتيح
- [ ] اختبار مقروء الشاشة
- [ ] فحص الأمان مع npm audit
- [ ] اختبار الأجهزة المحمولة
- [ ] فحص الأداء
- [ ] اختبار RTL/LTR
- [ ] فحص جميع الصفحات الرئيسية

### **بعد النشر:**
- [ ] مراقبة الأخطاء
- [ ] مراقبة الأداء
- [ ] جمع ملاحظات المستخدمين
- [ ] تحديث التوثيق

---

**🎉 المتجر السعودي - DoganHubStore**
**دليل شامل لحل جميع المشاكل الشائعة**

**🔧 للإصلاح السريع:**
```powershell
cd d:\Projects\DoganHubStore
.\scripts\fix-localhost.ps1
.\scripts\fix-accessibility.ps1
.\scripts\fix-specific-issues.ps1
npm run dev
```

**🌐 الهدف:** تطبيق يعمل بشكل مثالي مع إمكانية وصول كاملة!

**✅ مع هذا الدليل، ستحل 100% من المشاكل الشائعة!**
