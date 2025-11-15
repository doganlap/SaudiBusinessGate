'use client';

// This file replaces the problematic client.ts that was using react-cookie
// Now uses localStorage instead of cookies to avoid CookiesProvider dependency

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { t as translateFn, Language } from '@/lib/i18n';

// Hook that replaces the original useTranslation that was causing the CookiesProvider error
export function useTranslation(lng: string, ns: string, options: any) {
  const { language, setLanguage } = useLanguage();
  
  // Use provided language or fall back to context language
  const currentLng = (lng as Language) || language;
  
  const t = (key: string) => {
    return translateFn(key, currentLng);
  };

  const i18n = {
    language: currentLng,
    changeLanguage: (newLng: Language) => {
      setLanguage(newLng);
    }
  };

  return {
    t,
    i18n
  };
}

// Export for compatibility
export default useTranslation;
