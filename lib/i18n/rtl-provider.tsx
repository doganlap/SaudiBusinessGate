'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  isRTL, 
  getDirection, 
  getLanguageConfig,
  tailwindRTL,
  rtlStyles,
  formatNumber,
  formatDate,
  formatCurrency,
  type Direction 
} from './rtl-config';

interface RTLContextType {
  language: string;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: string) => void;
  tw: ReturnType<typeof tailwindRTL>;
  rtlStyle: ReturnType<typeof rtlStyles>;
  formatters: {
    number: (num: number, options?: Intl.NumberFormatOptions) => string;
    date: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
    currency: (amount: number, currency?: string) => string;
  };
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

/**
 * RTL Provider Component
 * Wraps the app and provides RTL context
 */
export function RTLProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const initialLang = (params?.lng as string) || 'en';
  const [language, setLanguageState] = useState<string>(initialLang);
  const direction = getDirection(language);
  const isRTLLanguage = isRTL(language);

  // Update document direction and language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      document.body.classList.remove('ltr', 'rtl');
      document.body.classList.add(direction);
    }
  }, [language, direction]);

  // Set language
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
  };

  const contextValue: RTLContextType = {
    language,
    direction,
    isRTL: isRTLLanguage,
    setLanguage,
    tw: tailwindRTL(language),
    rtlStyle: rtlStyles(language),
    formatters: {
      number: (num: number, opts?: Intl.NumberFormatOptions) => formatNumber(language, num, opts),
      date: (date: Date, opts?: Intl.DateTimeFormatOptions) => formatDate(language, date, opts),
      currency: (amount: number, currency?: string) => formatCurrency(language, amount, currency),
    },
  };

  return <RTLContext.Provider value={contextValue}>{children}</RTLContext.Provider>;
}

/**
 * Hook to use RTL context
 */
export function useRTL(): RTLContextType {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
}

/**
 * Hook to get language from params
 */
export function useLanguage(): string {
  const params = useParams();
  return (params?.lng as string) || 'en';
}

/**
 * Hook to get direction
 */
export function useDirection(): Direction {
  const language = useLanguage();
  return getDirection(language);
}

/**
 * HOC for RTL-aware components
 */
export function withRTL<P extends object>(
  Component: React.ComponentType<P & { rtl: RTLContextType }>
) {
  return function RTLComponent(props: P) {
    const rtl = useRTL();
    return <Component {...props} rtl={rtl} />;
  };
}

export default RTLContext;
