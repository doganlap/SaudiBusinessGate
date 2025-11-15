export type Language = 'en' | 'ar';

export const languages: Language[] = ['ar', 'en']; // Arabic first
export const defaultLanguage: Language = 'ar'; // Arabic as default

export const languageNames = {
  ar: 'العربية',
  en: 'English'
};

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language);
}

export function getLanguageDirection(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

// Alias for compatibility
export const getDirection = getLanguageDirection;

// Simple translation function (placeholder - in real app would use proper i18n)
export function t(key: string, language: Language = 'ar'): string {
  // This is a placeholder - in a real app you'd load translations from files
  const translations: Record<Language, Record<string, string>> = {
    ar: {
      'welcome': 'مرحباً',
      'dashboard': 'لوحة التحكم',
      'settings': 'الإعدادات',
      'logout': 'تسجيل الخروج'
    },
    en: {
      'welcome': 'Welcome',
      'dashboard': 'Dashboard', 
      'settings': 'Settings',
      'logout': 'Logout'
    }
  };
  
  return translations[language]?.[key] || key;
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

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', lang);
}
