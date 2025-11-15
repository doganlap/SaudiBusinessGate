# 🔧 Localhost Connection Troubleshooting Guide
# دليل استكشاف أخطاء الاتصال المحلي

## **المتجر السعودي - DoganHubStore**
### **Complete ERR_CONNECTION_REFUSED Fix Guide**

---

## **🚨 المشكلة الشائعة - Common Issue**

```
ERR_CONNECTION_REFUSED
This site can't be reached
localhost refused to connect
```

**السبب:** لا يوجد خادم يستمع على المنفذ المطلوب أو هناك حاجز يمنع الاتصال.

**Cause:** No server listening on the requested port or something is blocking the connection.

---

## **🔍 التشخيص السريع - Quick Diagnosis**

### **تشغيل سكريبت التشخيص:**
```powershell
# في PowerShell (كمدير)
cd d:\Projects\DoganHubStore
.\scripts\quick-diagnose.ps1
```

### **فحص يدوي سريع:**
```powershell
# 1. فحص المنافذ المستمعة
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3050,3000 } | Format-Table -Auto

# 2. اختبار الاتصال
Test-NetConnection -ComputerName localhost -Port 3050

# 3. فحص العمليات
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*next*" }
```

---

## **🛠️ الحلول المرتبة حسب الأولوية - Solutions by Priority**

### **🥇 الحل الأول: تشغيل الخادم**
```bash
# الانتقال للمشروع
cd d:\Projects\DoganHubStore

# تثبيت المكتبات (إذا لم تكن مثبتة)
npm install

# تشغيل الخادم
npm run dev

# أو مباشرة
npx next dev -H 0.0.0.0 -p 3050
```

**النتيجة المتوقعة:**
```
✓ Ready on http://localhost:3050
✓ Compiled successfully
```

### **🥈 الحل الثاني: إصلاح المنافذ المحجوزة**
```powershell
# قتل العمليات على المنافذ المستهدفة
$ports = @(3050, 3000)
foreach ($port in $ports) {
    $pid = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    if ($pid) { 
        taskkill /PID $pid /F 
        Write-Host "Killed process $pid on port $port"
    }
}

# إعادة تشغيل الخادم
npm run dev
```

### **🥉 الحل الثالث: إعدادات الشبكة**
```powershell
# إعداد جدار الحماية
netsh advfirewall firewall add rule name="DoganHubStore-Dev" dir=in action=allow protocol=TCP localport="3050,3000"

# تجاوز البروكسي
setx NO_PROXY "localhost,127.0.0.1,::1"
$env:NO_PROXY = "localhost,127.0.0.1,::1"

# إعادة تشغيل PowerShell وتجربة مرة أخرى
```

---

## **🔧 الحل الشامل التلقائي - Automated Complete Fix**

### **تشغيل سكريبت الإصلاح الشامل:**
```powershell
# في PowerShell (كمدير)
cd d:\Projects\DoganHubStore
.\scripts\fix-localhost.ps1
```

**ما يقوم به السكريبت:**
1. ✅ فحص المنافذ المستمعة
2. 🔪 قتل العمليات المتضاربة
3. 🔥 إعداد جدار الحماية
4. 🌐 تكوين البروكسي
5. 📁 فحص ملف hosts
6. 🧪 اختبار خادم HTTP أساسي
7. 📦 فحص مشروع DoganHubStore
8. 🚀 تشغيل خادم التطوير
9. 🔍 تشخيص نهائي

---

## **🎯 اختبار محدد لـ DoganHubStore**

### **1. فحص بنية المشروع:**
```powershell
# التأكد من وجود الملفات المطلوبة
Test-Path "d:\Projects\DoganHubStore\package.json"
Test-Path "d:\Projects\DoganHubStore\next.config.js"
Test-Path "d:\Projects\DoganHubStore\app"
Test-Path "d:\Projects\DoganHubStore\node_modules"
```

### **2. فحص إعدادات Next.js:**
```json
// في package.json
{
  "scripts": {
    "dev": "next dev -p 3050",
    "start": "next start -p 3050"
  }
}
```

### **3. اختبار خادم بديل:**
```javascript
// إنشاء خادم اختبار مؤقت
// temp-server.js
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`
        <h1>🏪 المتجر السعودي - DoganHubStore</h1>
        <p>✅ الخادم يعمل على المنفذ 3050</p>
        <p>✅ Server running on port 3050</p>
        <p>الوقت: ${new Date().toLocaleString('ar-SA')}</p>
    `);
});

server.listen(3050, '0.0.0.0', () => {
    console.log('🚀 DoganHubStore test server: http://localhost:3050');
});
```

```bash
# تشغيل الخادم المؤقت
node temp-server.js
```

---

## **🌐 اختبار URLs مختلفة**

### **الترتيب المفضل للاختبار:**
```
1. http://127.0.0.1:3050/     (IPv4 صريح)
2. http://localhost:3050/     (hostname)
3. http://[::1]:3050/         (IPv6)
4. http://127.0.0.1:3000/     (منفذ بديل)
5. http://localhost:3000/     (منفذ بديل)
```

### **اختبار من سطر الأوامر:**
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:3050/" -TimeoutSec 5

# CMD
curl http://127.0.0.1:3050/ -v

# Browser
start http://127.0.0.1:3050/
```

---

## **🔍 تشخيص متقدم**

### **1. فحص DNS وملف hosts:**
```powershell
# فحص ملف hosts
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "localhost"

# يجب أن تحتوي على:
# 127.0.0.1       localhost
# ::1             localhost

# اختبار DNS
nslookup localhost
```

### **2. فحص IPv6 vs IPv4:**
```powershell
# فحص تفضيل IPv6
netsh interface ipv6 show prefixpolicies

# تعطيل IPv6 مؤقتاً للاختبار
netsh interface ipv6 set global randomizeidentifiers=disabled
```

### **3. فحص البروكسي:**
```powershell
# فحص إعدادات البروكسي
netsh winhttp show proxy

# إعادة تعيين البروكسي
netsh winhttp reset proxy
```

---

## **🚨 حلول الطوارئ - Emergency Solutions**

### **إذا فشل كل شيء:**

#### **1. استخدام منفذ مختلف:**
```bash
# جرب منافذ مختلفة
npx next dev -p 3001
npx next dev -p 8080
npx next dev -p 4000
```

#### **2. استخدام IP مختلف:**
```bash
# ربط بجميع الواجهات
npx next dev -H 0.0.0.0 -p 3050

# ربط بـ IPv4 فقط
npx next dev -H 127.0.0.1 -p 3050
```

#### **3. تشغيل كخادم إنتاج:**
```bash
# بناء المشروع
npm run build

# تشغيل كإنتاج
npm run start
```

#### **4. استخدام خادم HTTP بسيط:**
```bash
# إذا كان لديك Python
python -m http.server 3050

# إذا كان لديك PHP
php -S localhost:3050

# استخدام Node.js مباشرة
npx http-server -p 3050
```

---

## **📊 مراقبة الأداء**

### **فحص استخدام الموارد:**
```powershell
# فحص استخدام المنافذ
netstat -an | findstr :3050

# فحص العمليات النشطة
Get-Process | Where-Object { $_.CPU -gt 0 } | Sort-Object CPU -Descending | Select-Object -First 10

# فحص الذاكرة
Get-Process node* | Select-Object Name, CPU, WorkingSet
```

---

## **🔒 أمان الشبكة**

### **فحص جدار الحماية:**
```powershell
# فحص قواعد جدار الحماية
Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*3050*" }

# إضافة قاعدة جديدة
New-NetFirewallRule -DisplayName "DoganHubStore-Dev" -Direction Inbound -Protocol TCP -LocalPort 3050 -Action Allow
```

### **فحص مكافح الفيروسات:**
```
تأكد من أن مكافح الفيروسات لا يحجب:
- node.exe
- next.exe
- المنفذ 3050
- مجلد المشروع d:\Projects\DoganHubStore
```

---

## **📱 اختبار من أجهزة أخرى**

### **الوصول من الشبكة المحلية:**
```bash
# الحصول على IP المحلي
ipconfig | findstr IPv4

# تشغيل الخادم للشبكة
npx next dev -H 0.0.0.0 -p 3050

# الوصول من جهاز آخر
http://192.168.1.100:3050/
```

---

## **🛠️ أدوات التشخيص المفيدة**

### **أدوات Windows:**
```powershell
# Resource Monitor
resmon.exe

# Network connections
netstat -an

# Process Explorer
# تحميل من Microsoft Sysinternals
```

### **أدوات المتصفح:**
```
F12 Developer Tools:
- Network tab
- Console tab
- Security tab
```

---

## **📞 الحصول على المساعدة**

### **معلومات مطلوبة للدعم:**
```powershell
# تشغيل هذا الأمر وإرسال النتيجة
Write-Host "=== DoganHubStore Diagnostic Info ==="
Write-Host "OS: $(Get-ComputerInfo | Select-Object -ExpandProperty WindowsProductName)"
Write-Host "Node: $(node --version 2>$null)"
Write-Host "NPM: $(npm --version 2>$null)"
Write-Host "Project Path: d:\Projects\DoganHubStore"
Write-Host "Package.json exists: $(Test-Path 'd:\Projects\DoganHubStore\package.json')"
Write-Host "Node_modules exists: $(Test-Path 'd:\Projects\DoganHubStore\node_modules')"
Write-Host "Listening ports:"
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3050,3000,5173,5174 } | Format-Table -Auto
Write-Host "=== End Diagnostic Info ==="
```

---

## **✅ قائمة التحقق النهائية**

### **قبل طلب المساعدة:**
- [ ] تشغيل `.\scripts\quick-diagnose.ps1`
- [ ] تشغيل `.\scripts\fix-localhost.ps1`
- [ ] تجربة `npm run dev`
- [ ] تجربة `npx next dev -H 0.0.0.0 -p 3050`
- [ ] اختبار `http://127.0.0.1:3050/`
- [ ] فحص جدار الحماية
- [ ] إعادة تشغيل PowerShell كمدير
- [ ] تجربة منفذ مختلف
- [ ] فحص مكافح الفيروسات

### **إذا نجح الاتصال:**
- [ ] حفظ الأوامر التي نجحت
- [ ] إنشاء اختصار للتشغيل السريع
- [ ] توثيق أي تغييرات خاصة

---

**🎉 المتجر السعودي - DoganHubStore**
**دليل شامل لحل جميع مشاكل الاتصال المحلي**

**🔧 للمساعدة السريعة:**
```powershell
cd d:\Projects\DoganHubStore
.\scripts\fix-localhost.ps1
```

**🌐 الهدف:** `http://localhost:3050/` يعمل بشكل مثالي!

**✅ مع هذا الدليل، ستحل 99% من مشاكل ERR_CONNECTION_REFUSED!**
