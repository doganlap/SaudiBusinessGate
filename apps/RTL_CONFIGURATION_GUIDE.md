# 🌐 دليل تكوين RTL - RTL Configuration Guide

## **المتجر السعودي - Saudi Store Platform**
### **تكوين RTL افتراضي مع دعم LTR اختياري**

---

## **📋 نظرة عامة - Overview**

### **العربية (الافتراضي)**
تم تكوين المنصة لتعمل بـ RTL (من اليمين إلى اليسار) كإعداد افتراضي مع دعم كامل للغة العربية، والإنجليزية كخيار ثانوي.

### **English (Optional)**
The platform is configured to work with RTL (Right-to-Left) as default with full Arabic support, and English as a secondary option.

---

## **🎯 التكوين الحالي - Current Configuration**

### **1. ✅ CSS Global Configuration**
```css
/* RTL Default Configuration */
html {
  direction: rtl;
  text-align: right;
}

html[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* Arabic Font Support */
body {
  font-family: 'Noto Sans Arabic', 'Cairo', 'Tajawal', system-ui, sans-serif;
}
```

### **2. ✅ Language Routing**
- **الافتراضي:** `/ar/` - العربية
- **اختياري:** `/en/` - الإنجليزية

### **3. ✅ Component Support**
جميع المكونات تدعم RTL/LTR:
- RedFlagsCard
- LicenseCard  
- AIAgentCard
- VectorizeManager
- ThemeCustomizer

---

## **🔧 كيفية التبديل - How to Switch**

### **للمطورين - For Developers:**

#### **1. تغيير الاتجاه في Component:**
```tsx
const locale = 'ar'; // أو 'en'
const isRTL = locale === 'ar';

<div className={isRTL ? 'rtl-default' : 'ltr-override'}>
  {/* المحتوى */}
</div>
```

#### **2. استخدام CSS Classes:**
```css
.rtl-default {
  direction: rtl;
  text-align: right;
}

.ltr-override {
  direction: ltr;
  text-align: left;
}
```

#### **3. Form Handling:**
```tsx
<form className={locale === 'ar' ? 'form-rtl' : 'form-ltr'}>
  <input type="text" />
</form>
```

---

## **🎨 Tailwind CSS RTL Support**

### **استخدام RTL Classes:**
```tsx
// RTL Padding
<div className="pr-4 pl-0 rtl:pr-0 rtl:pl-4">

// RTL Margins  
<div className="mr-2 ml-0 rtl:mr-0 rtl:ml-2">

// RTL Text Alignment
<div className="text-right rtl:text-right ltr:text-left">
```

### **Responsive RTL:**
```tsx
<div className="
  flex flex-row-reverse rtl:flex-row-reverse ltr:flex-row
  justify-end rtl:justify-end ltr:justify-start
">
```

---

## **📱 Navigation RTL**

### **Sidebar Configuration:**
```tsx
const SidebarComponent = ({ locale }) => (
  <div className={`
    fixed top-0 h-full w-64 bg-white shadow-lg
    ${locale === 'ar' ? 'sidebar-rtl' : 'sidebar-ltr'}
  `}>
    <nav className={locale === 'ar' ? 'nav-rtl' : 'nav-ltr'}>
      {/* Navigation Items */}
    </nav>
  </div>
);
```

---

## **🔤 Typography & Fonts**

### **Arabic Fonts (Primary):**
- Noto Sans Arabic
- Cairo
- Tajawal

### **English Fonts (Secondary):**
- Inter
- Roboto
- System UI

### **Font Loading:**
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
```

---

## **🌍 Language Switching**

### **Language Toggle Component:**
```tsx
const LanguageToggle = () => {
  const [locale, setLocale] = useState('ar');
  
  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    
    // Update HTML direction
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  return (
    <button onClick={toggleLanguage}>
      {locale === 'ar' ? 'English' : 'العربية'}
    </button>
  );
};
```

---

## **📊 Data Display RTL**

### **Numbers & Dates:**
```tsx
// Arabic Numerals
<span className="arabic-numerals">
  {number.toLocaleString('ar-SA')}
</span>

// Date Formatting
<span>
  {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
</span>
```

### **Currency:**
```tsx
const formatCurrency = (amount, locale) => {
  return new Intl.NumberFormat(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { style: 'currency', currency: 'SAR' }
  ).format(amount);
};
```

---

## **🎯 Best Practices**

### **1. ✅ Always Default to Arabic:**
```tsx
const locale = params?.lng || 'ar'; // Arabic as default
```

### **2. ✅ Use Semantic Classes:**
```css
.content-start { /* بداية المحتوى */
  text-align: right;
}

.content-end { /* نهاية المحتوى */  
  text-align: left;
}
```

### **3. ✅ Icon Direction:**
```tsx
<ChevronRight className={`
  h-4 w-4 transition-transform
  ${locale === 'ar' ? 'rotate-180' : ''}
`} />
```

### **4. ✅ Layout Mirroring:**
```tsx
<div className={`
  flex items-center gap-3
  ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'}
`}>
```

---

## **🔧 Testing RTL**

### **Manual Testing:**
1. افتح `/ar/red-flags` - يجب أن يظهر RTL
2. افتح `/en/red-flags` - يجب أن يظهر LTR  
3. اختبر التبديل بين اللغات
4. تأكد من اتجاه النصوص والأيقونات

### **Automated Testing:**
```javascript
// Jest Test
test('RTL direction is applied correctly', () => {
  render(<Component locale="ar" />);
  expect(document.documentElement.dir).toBe('rtl');
});
```

---

## **📈 Performance Considerations**

### **Font Loading Optimization:**
```css
/* Preload Arabic fonts */
<link rel="preload" href="/fonts/NotoSansArabic.woff2" as="font" type="font/woff2" crossorigin>
```

### **CSS Optimization:**
```css
/* Use CSS logical properties */
.element {
  margin-inline-start: 1rem; /* بدلاً من margin-right */
  margin-inline-end: 0;      /* بدلاً من margin-left */
}
```

---

## **🎉 الخلاصة - Summary**

### **✅ تم التكوين:**
- RTL افتراضي للعربية
- LTR اختياري للإنجليزية  
- دعم كامل للخطوط العربية
- مكونات متجاوبة مع الاتجاه
- تنسيق التواريخ والأرقام
- اختبار شامل

### **🚀 الاستخدام:**
```bash
# تشغيل التطبيق
npm run dev

# الوصول للعربية (افتراضي)
http://localhost:3050/ar

# الوصول للإنجليزية (اختياري)  
http://localhost:3050/en
```

**🌟 المنصة الآن تدعم RTL بالكامل مع العربية كلغة افتراضية!**
