# 🎨 Glassmorphism Components - Usage Guide

## Overview

This guide explains how to use the glassmorphism UI components that have been added to the application. These components provide a modern, glass-like aesthetic with animated backgrounds and blur effects.

## 📦 Available Components

All components are located in `components/ui/glass-container.tsx`:

1. **GlassBackground** - Animated gradient background with floating blobs
2. **GlassContainer** - Glass card container with backdrop blur
3. **GlassInput** - Glass input fields with icons
4. **GlassButton** - Glass buttons with variants

---

## 🚀 Quick Start

### 1. Import Components

```typescript
import { 
  GlassBackground, 
  GlassContainer, 
  GlassInput, 
  GlassButton 
} from '@/components/ui/glass-container';
```

### 2. Basic Usage Example

```typescript
'use client';

import { GlassBackground, GlassContainer, GlassInput, GlassButton } from '@/components/ui/glass-container';
import { Mail, Lock } from 'lucide-react';

export default function MyPage() {
  const isArabic = true; // or get from your i18n system
  
  return (
    <GlassBackground dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <GlassContainer padding="lg">
          <h1 className="text-3xl font-bold text-white mb-6">
            {isArabic ? 'عنوان الصفحة' : 'Page Title'}
          </h1>
          
          <form className="space-y-4">
            <GlassInput
              type="email"
              icon={<Mail className="w-5 h-5" />}
              iconPosition={isArabic ? 'right' : 'left'}
              isArabic={isArabic}
              placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'}
            />
            
            <GlassInput
              type="password"
              icon={<Lock className="w-5 h-5" />}
              iconPosition={isArabic ? 'right' : 'left'}
              isArabic={isArabic}
              placeholder={isArabic ? 'كلمة المرور' : 'Password'}
            />
            
            <GlassButton variant="primary">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </GlassButton>
          </form>
        </GlassContainer>
      </div>
    </GlassBackground>
  );
}
```

---

## 📚 Component Reference

### GlassBackground

The animated background wrapper with gradient and floating blobs.

**Props:**
- `children` (React.ReactNode) - Content to display
- `className?` (string) - Additional CSS classes
- `dir?` ('ltr' | 'rtl') - Text direction (default: 'ltr')

**Example:**
```typescript
<GlassBackground dir="rtl">
  {/* Your content */}
</GlassBackground>
```

---

### GlassContainer

A glass card container with backdrop blur effect.

**Props:**
- `children` (React.ReactNode) - Content to display
- `className?` (string) - Additional CSS classes
- `padding?` ('sm' | 'md' | 'lg') - Padding size (default: 'md')

**Example:**
```typescript
<GlassContainer padding="lg">
  <h2>Content here</h2>
</GlassContainer>
```

**Padding Sizes:**
- `sm` - Small padding (p-4)
- `md` - Medium padding (p-6) - Default
- `lg` - Large padding (p-8)

---

### GlassInput

A glass-styled input field with optional icon.

**Props:**
- All standard HTML input props
- `icon?` (React.ReactNode) - Icon to display
- `iconPosition?` ('left' | 'right') - Icon position (default: 'left')
- `isArabic?` (boolean) - RTL support flag (default: false)
- `className?` (string) - Additional CSS classes

**Example:**
```typescript
<GlassInput
  type="text"
  name="username"
  icon={<User className="w-5 h-5" />}
  iconPosition="left"
  isArabic={false}
  placeholder="Enter username"
/>
```

**With Arabic/RTL:**
```typescript
<GlassInput
  type="text"
  name="username"
  icon={<User className="w-5 h-5" />}
  iconPosition="right"  // Right side for RTL
  isArabic={true}
  placeholder="اسم المستخدم"
/>
```

---

### GlassButton

A glass-styled button with variants.

**Props:**
- All standard HTML button props
- `variant?` ('primary' | 'secondary' | 'success') - Button style (default: 'primary')
- `className?` (string) - Additional CSS classes

**Example:**
```typescript
<GlassButton variant="primary" onClick={handleClick}>
  Click Me
</GlassButton>

<GlassButton variant="secondary" disabled>
  Disabled Button
</GlassButton>

<GlassButton variant="success">
  Success Action
</GlassButton>
```

**Variants:**
- `primary` - White/30 background with white/40 hover
- `secondary` - White/20 background with white/30 hover
- `success` - Green/30 background with green/40 hover

---

## 🎯 Real-World Examples

### Example 1: Login Page (Already Implemented)

See `app/[lng]/login/page.tsx` for a complete implementation.

### Example 2: Register Page (Already Implemented)

See `app/[lng]/register/page.tsx` for a multi-step form example.

### Example 3: Simple Form

```typescript
'use client';

import { GlassBackground, GlassContainer, GlassInput, GlassButton } from '@/components/ui/glass-container';
import { User, Mail, Phone } from 'lucide-react';

export default function ContactForm() {
  const isArabic = false;
  
  return (
    <GlassBackground dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg">
        <GlassContainer padding="lg">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Contact Us
          </h2>
          
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Name
              </label>
              <GlassInput
                type="text"
                icon={<User className="w-5 h-5" />}
                iconPosition="left"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Email
              </label>
              <GlassInput
                type="email"
                icon={<Mail className="w-5 h-5" />}
                iconPosition="left"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Phone
              </label>
              <GlassInput
                type="tel"
                icon={<Phone className="w-5 h-5" />}
                iconPosition="left"
                placeholder="+1 234 567 8900"
              />
            </div>
            
            <GlassButton variant="primary" type="submit" className="w-full">
              Send Message
            </GlassButton>
          </form>
        </GlassContainer>
      </div>
    </GlassBackground>
  );
}
```

### Example 4: Card with Glass Effect

```typescript
import { GlassContainer } from '@/components/ui/glass-container';

export default function FeatureCard({ title, description }) {
  return (
    <GlassContainer padding="md">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </GlassContainer>
  );
}
```

---

## 🎨 Styling Tips

### Custom Colors

You can override colors by adding custom classes:

```typescript
<GlassContainer className="bg-blue-500/10 border-blue-300/30">
  {/* Custom colored container */}
</GlassContainer>
```

### Text Colors

Always use white text with appropriate opacity:
- `text-white` - Main text
- `text-white/90` - Slightly transparent
- `text-white/80` - More transparent
- `text-white/70` - Very transparent

### Shadows

Add drop shadows for depth:
```typescript
<h1 className="text-3xl font-bold text-white drop-shadow-lg">
  Title
</h1>
```

---

## 🌍 RTL Support

For Arabic/RTL support:

1. Set `dir="rtl"` on `GlassBackground`
2. Use `isArabic={true}` on `GlassInput`
3. Set `iconPosition="right"` for RTL layouts
4. Adjust margins/padding with RTL-aware classes

**Example:**
```typescript
<GlassBackground dir="rtl">
  <GlassInput
    icon={<Mail className="w-5 h-5" />}
    iconPosition="right"
    isArabic={true}
    placeholder="البريد الإلكتروني"
  />
</GlassBackground>
```

---

## 🔧 Advanced Usage

### Combining with Other Components

```typescript
import { GlassContainer } from '@/components/ui/glass-container';
import { Card } from '@/components/ui/card';

export default function HybridCard() {
  return (
    <GlassContainer>
      {/* Use glass container as wrapper */}
      <div className="space-y-4">
        {/* Regular components inside */}
        <h2 className="text-white">Title</h2>
      </div>
    </GlassContainer>
  );
}
```

### Custom Animations

The background includes automatic animations:
- Gradient animation (15s loop)
- Blob animations (3 floating blobs)

No additional setup needed!

---

## 📝 Best Practices

1. **Always use GlassBackground as the outer wrapper** for full effect
2. **Use appropriate padding** - `lg` for forms, `md` for cards
3. **Maintain white text** for readability on gradient background
4. **Test RTL layouts** if supporting Arabic
5. **Use icons consistently** for better UX
6. **Keep forms simple** - glassmorphism works best with clean layouts

---

## 🐛 Troubleshooting

### Issue: Text not visible
**Solution:** Ensure you're using white text colors (`text-white`, `text-white/90`, etc.)

### Issue: Icons not aligned
**Solution:** Check `iconPosition` matches your `isArabic` setting

### Issue: Background not animating
**Solution:** Ensure `GlassBackground` is the outermost wrapper

### Issue: RTL not working
**Solution:** Set `dir="rtl"` on `GlassBackground` and `isArabic={true}` on inputs

---

## 📄 Files Reference

- **Components:** `components/ui/glass-container.tsx`
- **Login Example:** `app/[lng]/login/page.tsx`
- **Register Example:** `app/[lng]/register/page.tsx`

---

## ✅ Summary

The glassmorphism components provide:
- ✨ Modern, beautiful UI
- 🌈 Animated backgrounds
- 💎 Glass effect with blur
- 🌍 Full RTL support
- 📱 Responsive design
- 🎨 Easy to customize

Start using them in your pages today!

