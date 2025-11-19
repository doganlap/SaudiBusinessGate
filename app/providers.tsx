'use client';

import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RTLProvider } from '@/lib/i18n/rtl-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RTLProvider>
          {children}
        </RTLProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}