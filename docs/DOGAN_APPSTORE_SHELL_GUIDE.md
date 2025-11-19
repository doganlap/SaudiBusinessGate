# 🏪 Dogan AppStore Shell - دليل الاستخدام

## **نظرة عامة - Overview**

تم إنشاء **Dogan AppStore Shell** - أول بوابة أعمال ذاتية في المنطقة مع تصميم Glassmorphic متقدم وواجهة ثنائية اللغة (عربي/إنجليزي) مع دعم RTL كامل.

**Dogan AppStore Shell** has been created - the first autonomous business gateway in the region with advanced Glassmorphic design and bilingual interface (Arabic/English) with full RTL support.

---

## **🎨 الميزات الرئيسية - Key Features**

### **✨ التصميم - Design**

- **Glassmorphic UI** - تأثيرات زجاجية متقدمة
- **Backdrop Blur** - ضبابية خلفية ديناميكية
- **Animated Orbs** - كرات متحركة في الخلفية
- **Gradient Borders** - حدود متدرجة الألوان
- **Responsive Layout** - تصميم متجاوب لجميع الأجهزة

### **🌐 اللغات والاتجاهات - Languages & Directions**

- **Arabic (RTL)** - العربية كلغة افتراضية
- **English (LTR)** - الإنجليزية كخيار ثانوي
- **Dynamic Direction** - تغيير الاتجاه تلقائياً
- **Font Support** - دعم الخطوط العربية

### **🧭 التنقل - Navigation**

- **Left Sidebar** - شريط جانبي أيسر قابل للطي
- **Mobile Drawer** - درج للهواتف المحمولة
- **Right Agent Dock** - رصيف الوكلاء الأيمن
- **Active Link Highlighting** - تمييز الروابط النشطة

### **🤖 الوكلاء الأذكياء - Smart Agents**

- **6 AI Agents** - 6 وكلاء ذكية متخصصة
- **Real-time Workflow** - سير عمل في الوقت الفعلي
- **Agent Status** - حالة الوكلاء المباشرة
- **API Integration** - تكامل مع APIs حقيقية

---

## **📁 هيكل الملفات - File Structure**

```
components/
├── DoganAppStoreShell.tsx          # المكون الرئيسي
├── shell/
│   ├── Header.tsx                  # رأس الصفحة
│   ├── LeftNav.tsx                 # التنقل الأيسر (قريباً)
│   ├── RightAgentDock.tsx          # رصيف الوكلاء (قريباً)
│   └── AgentWorkflow.tsx           # سير عمل الوكلاء (قريباً)
└── ui/
    ├── StatusChip.tsx              # رقاقة الحالة (قريباً)
    ├── MetricCard.tsx              # بطاقة المقاييس (قريباً)
    └── HeroBanner.tsx              # لافتة البطل (قريباً)

app/
└── [lng]/
    └── appstore/
        └── page.tsx                # صفحة تجريبية
```

---

## **🚀 كيفية الاستخدام - How to Use**

### **1. الاستخدام الأساسي - Basic Usage**

```tsx
import DoganAppStoreShell from '@/components/DoganAppStoreShell';

export default function MyPage() {
  return (
    <DoganAppStoreShell locale="ar">
      {/* محتوى صفحتك هنا */}
      <div>محتوى مخصص</div>
    </DoganAppStoreShell>
  );
}
```

### **2. مع محتوى مخصص - With Custom Content**

```tsx
import DoganAppStoreShell from '@/components/DoganAppStoreShell';

export default function CustomPage({ params }: { params: Promise<{ lng: string }> }) {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  return (
    <DoganAppStoreShell locale={locale}>
      <div className="mx-auto max-w-7xl">
        <h1>{locale === 'ar' ? 'مرحباً' : 'Welcome'}</h1>
        {/* محتوى إضافي */}
      </div>
    </DoganAppStoreShell>
  );
}
```

### **3. بدون محتوى (افتراضي) - Without Content (Default)**

```tsx
// سيعرض المحتوى الافتراضي مع المقاييس والبانر
<DoganAppStoreShell locale="ar" />
```

---

## **🎛️ الخصائص - Props**

### **DoganAppStoreShell Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `locale` | `"ar" \| "en"` | `"ar"` | اللغة الحالية |
| `children` | `React.ReactNode` | `undefined` | المحتوى المخصص |

---

## **🧩 المكونات الفرعية - Sub Components**

### **1. Header Component**

```tsx
<Header 
  locale={locale}
  setLocale={setLocale}
  dark={dark}
  setDark={setDark}
  onToggleDrawer={onToggleDrawer}
/>
```

**الميزات:**

- شريط بحث ذكي
- تبديل اللغة
- تبديل الوضع المظلم/المضيء
- إشعارات
- رقائق الحالة

### **2. LeftNav Component (قريباً)**

```tsx
<LeftNav 
  locale={locale}
  collapsedAt={1280}
  drawerOpen={drawerOpen}
  onCloseDrawer={onCloseDrawer}
/>
```

**الميزات:**

- 4 مجموعات تنقل (Store, Operations, Analytics, Admin)
- طي/توسيع تلقائي
- تمييز الروابط النشطة
- دعم الهواتف المحمولة

### **3. RightAgentDock Component (قريباً)**

```tsx
<RightAgentDock 
  locale={locale}
  open={rightDockOpen}
  onToggle={onToggle}
/>
```

**الميزات:**

- 6 وكلاء ذكية
- سير عمل مباشر
- تشغيل الوكلاء
- إشعارات النتائج

---

## **🎨 التخصيص - Customization**

### **1. الألوان - Colors**

```css
/* في globals.css */
:root {
  --primary-emerald: #10b981;
  --primary-teal: #14b8a6;
  --primary-cyan: #06b6d4;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.15);
}
```

### **2. الخطوط - Fonts**

```css
/* دعم الخطوط العربية */
body {
  font-family: 'Noto Sans Arabic', 'Cairo', 'Tajawal', system-ui, sans-serif;
}
```

### **3. الحركات - Animations**

```tsx
// تخصيص حركة الكرات
<motion.span 
  animate={{ 
    opacity: [0.35, 0.6, 0.35], 
    scale: [0.95, 1.06, 0.98, 0.95] 
  }} 
  transition={{ duration: 8, repeat: Infinity }}
/>
```

---

## **🔌 تكامل APIs - API Integration**

### **1. وكلاء الذكاء الاصطناعي - AI Agents**

```typescript
// مثال على API الوكلاء
const agents = [
  {
    k: "gap",
    labelAr: "فحص فجوات الامتثال",
    labelEn: "Compliance Gap Scan",
    endpoint: "/api/agents/compliance/gap-scan"
  },
  {
    k: "risk",
    labelAr: "تحليل المخاطر", 
    labelEn: "Risk Analyze",
    endpoint: "/api/agents/risk/analyze"
  }
  // ... المزيد
];
```

### **2. تشغيل الوكيل - Run Agent**

```typescript
const runAgent = async (key: string) => {
  const agent = agents.find(a => a.k === key);
  const res = await fetch(agent.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_id: 'current' })
  });
  // معالجة النتيجة
};
```

---

## **📱 الاستجابة - Responsiveness**

### **نقاط الكسر - Breakpoints:**

| Device | Width | Behavior |
|--------|-------|----------|
| Mobile | < 768px | Drawer navigation, stacked layout |
| Tablet | 768px - 1280px | Collapsed sidebar, responsive grid |
| Desktop | > 1280px | Full sidebar, 3-column layout |

### **تخطيط الشاشات:**

```tsx
// Mobile: Stack everything
<div className="block md:hidden">Mobile Layout</div>

// Tablet: Responsive grid  
<div className="hidden md:block lg:hidden">Tablet Layout</div>

// Desktop: Full layout
<div className="hidden lg:block">Desktop Layout</div>
```

---

## **🌙 الوضع المظلم - Dark Mode**

### **التبديل التلقائي:**

```tsx
const [dark, setDark] = useState(true);

useEffect(() => {
  document.documentElement.classList.toggle("dark", dark);
}, [dark]);
```

### **الألوان المظلمة:**

```css
.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --glass-bg: rgba(15, 23, 42, 0.4);
}
```

---

## **🔍 البحث - Search**

### **Command Palette (قريباً):**

```tsx
// Ctrl/⌘ + K للبحث السريع
const [paletteOpen, setPaletteOpen] = useState(false);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
}, []);
```

---

## **🧪 الاختبار - Testing**

### **صفحة تجريبية:**

```bash
# الوصول للصفحة التجريبية
http://localhost:3050/ar/appstore
http://localhost:3050/en/appstore
```

### **اختبار الميزات:**

1. **تبديل اللغة** - انقر على أيقونة الكرة الأرضية
2. **الوضع المظلم** - انقر على أيقونة الشمس/القمر  
3. **التنقل** - استخدم القائمة الجانبية
4. **الوكلاء** - انقر على الوكلاء في الرصيف الأيمن
5. **الاستجابة** - غير حجم النافذة

---

## **🚀 النشر - Deployment**

### **متطلبات الإنتاج:**

```bash
# تثبيت المكتبات المطلوبة
npm install framer-motion lucide-react

# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

### **متغيرات البيئة:**

```bash
# في .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## **🔧 استكشاف الأخطاء - Troubleshooting**

### **مشاكل شائعة:**

#### **1. خطأ في الخطوط العربية:**

```css
/* إضافة في globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
```

#### **2. مشكلة RTL:**

```tsx
// التأكد من تطبيق الاتجاه
useEffect(() => {
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}, [locale]);
```

#### **3. خطأ في Framer Motion:**

```bash
# تثبيت الإصدار الصحيح
npm install framer-motion@latest
```

---

## **📈 الأداء - Performance**

### **تحسينات:**

1. **Lazy Loading** للمكونات الثقيلة
2. **Memoization** للحسابات المعقدة
3. **Virtual Scrolling** للقوائم الطويلة
4. **Image Optimization** للصور

### **مراقبة الأداء:**

```tsx
// استخدام React.memo للمكونات
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// استخدام useMemo للحسابات
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

---

## **🔮 المستقبل - Future Plans**

### **الميزات القادمة:**

1. **Command Palette** - لوحة الأوامر السريعة
2. **Keyboard Shortcuts** - اختصارات لوحة المفاتيح
3. **Theme Customizer** - مخصص المظاهر
4. **Plugin System** - نظام الإضافات
5. **Advanced Search** - بحث متقدم
6. **Real-time Notifications** - إشعارات فورية

### **تحسينات مخططة:**

1. **Better Accessibility** - إمكانية وصول محسنة
2. **Performance Optimization** - تحسين الأداء
3. **Mobile Experience** - تجربة محمول أفضل
4. **Offline Support** - دعم العمل بدون إنترنت

---

## **📞 الدعم - Support**

### **للمساعدة:**

- **التوثيق:** راجع هذا الدليل
- **الأمثلة:** انظر `/app/[lng]/appstore/page.tsx`
- **المشاكل:** أنشئ issue في المشروع

### **المساهمة:**

- **Fork** المشروع
- **Create** فرع جديد
- **Commit** تغييراتك
- **Push** للفرع
- **Create** Pull Request

---

**🎉 Dogan AppStore Shell**
**أول بوابة أعمال ذاتية في المنطقة مع تصميم Glassmorphic متقدم!**

**✨ جاهز للاستخدام مع دعم كامل للعربية والإنجليزية!**
