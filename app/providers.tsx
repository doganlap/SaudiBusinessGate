'use client';

import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}