# i18n Implementation Guide

This project uses **Lingui** for internationalization (i18n) with support for **Arabic (ar)** and **English (en)**.

## Features

- ✅ Full i18n support with Lingui
- ✅ Arabic (RTL) and English (LTR) languages
- ✅ Dynamic language switching
- ✅ Automatic direction detection
- ✅ Type-safe translations
- ✅ Translation extraction and compilation tools

## Project Structure

```
├── locales/
│   ├── en/
│   │   ├── messages.po    # English translations source
│   │   └── messages.js    # Compiled English translations
│   └── ar/
│       ├── messages.po    # Arabic translations source
│       └── messages.js    # Compiled Arabic translations
├── components/
│   └── i18n/
│       ├── LanguageProvider.tsx  # Language context provider
│       └── LanguageSwitcher.tsx  # Language switcher component
├── hooks/
│   └── useTranslation.ts         # Translation hook
├── lib/
│   └── i18n/
│       └── lingui.ts             # Lingui configuration
└── lingui.config.ts              # Lingui settings
```

## Configuration

### lingui.config.ts

```typescript
import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en', 'ar'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['app', 'components', 'lib', 'pages'],
      exclude: ['**/node_modules/**', '**/.*'],
    },
  ],
  format: 'po',
};

export default config;
```

## Usage

### 1. Using the Trans Component (Recommended)

For static text and JSX content:

```tsx
'use client';

import { Trans } from '@lingui/macro';

export function MyComponent() {
  return (
    <div>
      <h1><Trans>Welcome to DoganHub</Trans></h1>
      <p><Trans>This is a translated paragraph</Trans></p>
    </div>
  );
}
```

### 2. Using the t function

For dynamic translations and string interpolation:

```tsx
'use client';

import { msg } from '@lingui/macro';
import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  const userName = 'Ahmed';

  return (
    <div>
      <h1>{t(msg`Hello ${userName}`)}</h1>
      <button>{t(msg`Click me`)}</button>
    </div>
  );
}
```

### 3. Using message IDs

For referencing pre-defined translations:

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

### 4. Language Switching

Add the LanguageSwitcher component to your layout:

```tsx
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### 5. Using Language Context

Access language state and utilities:

```tsx
'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';

export function MyComponent() {
  const { language, setLanguage, direction, isRTL } = useLanguage();

  return (
    <div>
      <p>Current language: {language}</p>
      <p>Direction: {direction}</p>
      <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
      <button onClick={() => setLanguage('ar')}>Switch to Arabic</button>
    </div>
  );
}
```

## Available Scripts

### Extract translations from code

```bash
npm run i18n:extract
```

This scans your code for translation strings and updates the `.po` files.

### Compile translations

```bash
npm run i18n:compile
```

This compiles `.po` files into `.js` files that can be loaded by the app.

### Watch mode for development

```bash
npm run i18n:watch
```

This automatically extracts translations when you save files.

## Workflow

### Adding new translations

1. **Write code with translations:**

```tsx
import { Trans } from '@lingui/macro';

export function NewFeature() {
  return <h1><Trans>New Feature Title</Trans></h1>;
}
```

2. **Extract translations:**

```bash
npm run i18n:extract
```

3. **Edit translation files:**

Open `locales/ar/messages.po` and add Arabic translations:

```po
msgid "New Feature Title"
msgstr "عنوان الميزة الجديدة"
```

4. **Compile translations:**

```bash
npm run i18n:compile
```

5. **Test in your app:**

Your translations will now appear in the app!

## Available Translation Keys

Common translations are already available:

### Common
- `common.loading` - "Loading..." / "جاري التحميل..."
- `common.save` - "Save" / "حفظ"
- `common.cancel` - "Cancel" / "إلغاء"
- `common.delete` - "Delete" / "حذف"
- `common.edit` - "Edit" / "تعديل"
- `common.add` - "Add" / "إضافة"
- `common.search` - "Search" / "بحث"

### App
- `app.title` - "DoganHub Enterprise Platform" / "منصة دوغان هب للمؤسسات"
- `app.description` - "Integrated Business Platform" / "منصة الأعمال المتكاملة"

### Dashboard
- `dashboard.title` - "Dashboard" / "لوحة القيادة"
- `dashboard.overview` - "Overview" / "نظرة عامة"
- `dashboard.analytics` - "Analytics" / "التحليلات"

### Auth
- `auth.login` - "Login" / "تسجيل الدخول"
- `auth.logout` - "Logout" / "تسجيل الخروج"
- `auth.email` - "Email" / "البريد الإلكتروني"
- `auth.password` - "Password" / "كلمة المرور"

### Navigation
- `nav.home` - "Home" / "الرئيسية"
- `nav.dashboard` - "Dashboard" / "لوحة القيادة"
- `nav.billing` - "Billing" / "الفواتير"
- `nav.settings` - "Settings" / "الإعدادات"

[See full list in `/locales/en/messages.po` and `/locales/ar/messages.po`]

## Best Practices

### 1. Always use macros for translations

```tsx
// ✅ Good
import { Trans } from '@lingui/macro';
<Trans>Hello World</Trans>

// ❌ Bad
<span>Hello World</span>
```

### 2. Keep translations simple and contextual

```tsx
// ✅ Good
<Trans>Save changes</Trans>

// ❌ Bad (too generic)
<Trans>Save</Trans>
```

### 3. Use message IDs for reusable strings

```tsx
// ✅ Good
const { t } = useTranslation();
return <button>{t('common.save')}</button>;
```

### 4. Extract and compile regularly

Run `npm run i18n:extract` and `npm run i18n:compile` frequently during development.

### 5. Use proper RTL styling

```tsx
// ✅ Good - Tailwind handles RTL automatically
<div className="text-right rtl:text-right ltr:text-left">

// Or use logical properties
<div className="ps-4 pe-4"> {/* padding-inline-start/end */}
```

## RTL Support

The app automatically detects and applies RTL direction for Arabic:

- HTML `dir` attribute is set automatically
- Tailwind CSS RTL variants work out of the box
- Use logical CSS properties when possible (`inline-start`, `inline-end`)

## TypeScript Support

Full TypeScript support is included:

```typescript
import type { Language } from '@/components/i18n/LanguageProvider';

const lang: Language = 'ar'; // Type-safe language codes
```

## Troubleshooting

### Translations not appearing

1. Make sure you ran `npm run i18n:compile`
2. Check that the `.js` files exist in `locales/[locale]/`
3. Verify the LanguageProvider wraps your app in `app/layout.tsx`

### Build errors with macros

Make sure you have the Lingui Babel/SWC plugins configured (already set up in this project).

### Direction not switching

The LanguageProvider sets `document.documentElement.dir` automatically. If it's not working, check that the provider is at the root level.

## Resources

- [Lingui Documentation](https://lingui.dev/)
- [Lingui React Guide](https://lingui.dev/ref/react)
- [Lingui Macro API](https://lingui.dev/ref/macro)
- [RTL Styling with Tailwind](https://tailwindcss.com/blog/tailwindcss-v3-3#simplified-rtl-support)

## Example Component

```tsx
'use client';

import { Trans, msg } from '@lingui/macro';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/components/i18n/LanguageProvider';

export function ExampleComponent() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  return (
    <div className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Static translation */}
      <h1><Trans>Welcome to DoganHub</Trans></h1>

      {/* Dynamic translation */}
      <p>{t(msg`Current language: ${language}`)}</p>

      {/* Using message ID */}
      <button className="btn">{t('common.save')}</button>

      {/* With JSX */}
      <p>
        <Trans>
          Click <a href="/docs">here</a> to learn more
        </Trans>
      </p>
    </div>
  );
}
```

---

Your i18n system is now fully set up and ready to use! 🎉
