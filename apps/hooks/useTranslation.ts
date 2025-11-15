'use client';

import { useLingui } from '@lingui/react';
import type { MessageDescriptor } from '@lingui/core';

/**
 * Custom hook for translations using Lingui
 * Usage:
 *
 * ```tsx
 * import { Trans, msg } from '@lingui/macro';
 * import { useTranslation } from '@/hooks/useTranslation';
 *
 * function MyComponent() {
 *   const { t, i18n } = useTranslation();
 *
 *   // Using msg macro for dynamic translations
 *   return <h1>{t(msg`Hello World`)}</h1>;
 *
 *   // Or using Trans component for JSX
 *   return <h1><Trans>Hello World</Trans></h1>;
 * }
 * ```
 */
export function useTranslation() {
  const { i18n, _ } = useLingui();

  const t = (descriptor: MessageDescriptor | string): string => {
    if (typeof descriptor === 'string') {
      return _(descriptor);
    }
    return _(descriptor.id as string, descriptor.values, descriptor);
  };

  return {
    t,
    i18n,
    _,
  };
}
