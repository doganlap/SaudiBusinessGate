# i18n Quick Start 🚀

Your Next.js application now has full internationalization support with Lingui!

## ✅ What's Already Set Up

- **Languages**: Arabic (ar) and English (en)
- **Default**: Arabic with RTL support
- **Translation system**: Lingui with macro support
- **Components**: LanguageProvider and LanguageSwitcher ready to use

## 🎯 Quick Usage

### 1. In Your Components

```tsx
'use client';

import { Trans } from '@lingui/macro';

export function MyComponent() {
  return <h1><Trans>Hello World</Trans></h1>;
}
```

### 2. For Dynamic Text

```tsx
'use client';

import { msg } from '@lingui/macro';
import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  return <button>{t(msg`Click me`)}</button>;
}
```

### 3. Using Pre-defined Keys

```tsx
const { t } = useTranslation();
return <h1>{t('app.title')}</h1>;
```

## 📝 Workflow

1. **Write code with translations** using `<Trans>` or `t()`
2. **Extract translations**: `npm run i18n:extract`
3. **Edit Arabic translations** in `locales/ar/messages.po`
4. **Compile**: `npm run i18n:compile`
5. **Done!** Translations will appear in your app

## 🛠️ Available Commands

```bash
npm run i18n:extract  # Extract translation strings from code
npm run i18n:compile  # Compile translations to JS
npm run i18n:watch    # Watch mode for development
```

## 📚 Available Translation Keys

You already have these translations ready:

### Common
- `common.save`, `common.cancel`, `common.delete`, `common.edit`, `common.add`
- `common.search`, `common.loading`, `common.close`, `common.submit`

### Navigation
- `nav.home`, `nav.dashboard`, `nav.billing`, `nav.settings`, `nav.profile`

### Auth
- `auth.login`, `auth.logout`, `auth.email`, `auth.password`

### Dashboard
- `dashboard.title`, `dashboard.overview`, `dashboard.analytics`

[See full list in `locales/*/messages.po`]

## 🔄 Language Switching

Add the language switcher to your layout:

```tsx
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

<LanguageSwitcher />
```

## 🌍 RTL Support

RTL is automatic for Arabic! Use Tailwind's logical properties:

```tsx
// ✅ Good - automatically flips for RTL
<div className="ps-4 pe-4">  {/* padding-inline-start/end */}

// ✅ Also good - RTL variants
<div className="text-left rtl:text-right">
```

## 📖 More Info

See [I18N_IMPLEMENTATION_GUIDE.md](./I18N_IMPLEMENTATION_GUIDE.md) for detailed documentation.

## 🎨 Example Component

Check out [components/i18n/ExampleTranslatedComponent.tsx](./components/i18n/ExampleTranslatedComponent.tsx) for a working example.

---

**Ready to go!** Start adding `<Trans>` to your components. 🎉
