'use client';

import { useLingui } from '@lingui/react';
import type { MessageDescriptor } from '@lingui/core';

export function useTranslation() {
  const { i18n } = useLingui();
  const t = (key: string | MessageDescriptor) =>
    typeof key === 'string' ? key : i18n._(key);
  return { t };
}

export default useTranslation;