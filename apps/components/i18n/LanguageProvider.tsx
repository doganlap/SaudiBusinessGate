'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { en, ar } from 'make-plural/plurals';

export type Language = 'en' | 'ar';

export const languages: Language[] = ['ar', 'en']; // Arabic first
export const defaultLanguage: Language = 'ar'; // Arabic as default

export const languageNames = {
  ar: 'العربية',
  en: 'English'
};

// Load plural rules
i18n.loadLocaleData({
  en: { plurals: en },
  ar: { plurals: ar },
});

interface LanguageContextType {
  language: Language;
  setLanguage: (lng: Language) => void;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language);
}

export function getLanguageDirection(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;

  // Try to get from URL path
  const path = window.location.pathname;
  const langFromPath = path.split('/')[1];

  if (isValidLanguage(langFromPath)) {
    return langFromPath;
  }

  // Try localStorage
  const stored = localStorage.getItem('language');
  if (stored && isValidLanguage(stored)) {
    return stored;
  }

  return defaultLanguage;
}

export function setLanguageStorage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', lang);
}

async function loadCatalog(locale: Language) {
  try {
    const { messages } = await import(`@/locales/${locale}/messages`);
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (error) {
    console.warn(`Failed to load catalog for locale: ${locale}`, error);
    // Fallback to default language if loading fails
    if (locale !== defaultLanguage) {
      const { messages } = await import(`@/locales/${defaultLanguage}/messages`);
      i18n.load(defaultLanguage, messages);
      i18n.activate(defaultLanguage);
    }
  }
}

export function LanguageProvider({
  children,
  initialLanguage
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setCurrentLanguage] = useState<Language>(
    initialLanguage || defaultLanguage
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      const currentLng = getCurrentLanguage();
      setCurrentLanguage(currentLng);
      await loadCatalog(currentLng);

      document.documentElement.dir = getLanguageDirection(currentLng);
      document.documentElement.lang = currentLng;
      setIsLoading(false);
    };

    initLanguage();
  }, []);

  const handleSetLanguage = async (lng: Language) => {
    setCurrentLanguage(lng);
    setLanguageStorage(lng);
    await loadCatalog(lng);

    document.documentElement.dir = getLanguageDirection(lng);
    document.documentElement.lang = lng;
  };

  const direction = getLanguageDirection(language);
  const isRTL = direction === 'rtl';

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <I18nProvider i18n={i18n}>
      <LanguageContext.Provider
        value={{
          language,
          setLanguage: handleSetLanguage,
          direction,
          isRTL,
        }}
      >
        {children}
      </LanguageContext.Provider>
    </I18nProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
