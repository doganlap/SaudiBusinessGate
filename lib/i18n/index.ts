// Simple i18n implementation without react-cookie dependency
// This replaces the missing client.ts file that was causing the CookiesProvider error

export const languages = ['en', 'ar'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'ar'; // Arabic as default

// Translation dictionaries
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    
    // App
    'app.title': 'DoganHub Enterprise Platform',
    'app.description': 'Multi-tenant Enterprise Platform',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.analytics': 'Analytics',
    'dashboard.processes': 'Processes',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    
    // Billing
    'billing.title': 'Billing & Subscriptions',
    'billing.current_plan': 'Current Plan',
    'billing.upgrade': 'Upgrade Plan',
    'billing.manage': 'Manage Subscription',
  },
  ar: {
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    
    // App
    'app.title': 'منصة دوغان هب للمؤسسات',
    'app.description': 'منصة مؤسسية متعددة المستأجرين',
    
    // Dashboard
    'dashboard.title': 'لوحة القيادة',
    'dashboard.analytics': 'التحليلات',
    'dashboard.processes': 'العمليات',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.logout': 'تسجيل الخروج',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    
    // Billing
    'billing.title': 'الفواتير والاشتراكات',
    'billing.current_plan': 'الخطة الحالية',
    'billing.upgrade': 'ترقية الخطة',
    'billing.manage': 'إدارة الاشتراك',
  }
};

// Simple translation function
export function t(key: string, lng: Language = defaultLanguage): string {
  const keys = key.split('.');
  let value: any = translations[lng];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  // Fallback to English if translation not found
  if (!value && lng !== 'en') {
    let fallbackValue: any = translations.en;
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
    }
    value = fallbackValue;
  }
  
  return value || key;
}

// Get language from URL or localStorage
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    // Try to get from URL path
    const path = window.location.pathname;
    const langFromPath = path.split('/')[1] as Language;
    
    if (languages.includes(langFromPath)) {
      return langFromPath;
    }
    
    // Try to get from localStorage
    const stored = localStorage.getItem('language') as Language;
    if (stored && languages.includes(stored)) {
      return stored;
    }
  }
  
  return defaultLanguage;
}

// Set language in localStorage
export function setLanguage(lng: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
    
    // Update document direction
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
}

// Get text direction for language
export function getDirection(lng: Language): 'ltr' | 'rtl' {
  return lng === 'ar' ? 'rtl' : 'ltr';
}

// Check if language is RTL
export function isRTL(lng: Language): boolean {
  return lng === 'ar';
}
