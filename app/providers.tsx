'use client';

import React from 'react';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RTLProvider } from '@/lib/i18n/rtl-provider';
import { ServiceWorkerProvider } from '@/components/providers/ServiceWorkerProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ServiceWorkerProvider>
      <ThemeProvider>
        <LanguageProvider>
          <RTLProvider>
            {children}
          </RTLProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ServiceWorkerProvider>
  );
}