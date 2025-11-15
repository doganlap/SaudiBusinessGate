'use client';

import * as React from 'react';
import { AdvancedThemeProvider } from '@/lib/theme/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <AdvancedThemeProvider defaultMode="light" defaultGlassIntensity="medium">
      {children}
    </AdvancedThemeProvider>
  );
}