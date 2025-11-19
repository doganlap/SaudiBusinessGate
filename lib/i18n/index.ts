// Simple i18n implementation without react-cookie dependency
// This replaces the missing client.ts file that was causing the CookiesProvider error

export const languages = ['en', 'ar'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'ar'; // Arabic as default

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.finance': 'Finance',
    'nav.sales': 'Sales',
    'nav.crm': 'CRM',
    'nav.hr': 'HR',
    'nav.procurement': 'Procurement',
    
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
    'common.manage': 'Manage',
    'common.viewDetails': 'View Details',
    
    // App
    'app.title': 'Saudi Business Gate',
    'app.description': 'Multi-tenant Enterprise Platform',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.statistics': 'Statistics',
    'dashboard.analytics': 'Analytics',
    'dashboard.processes': 'Processes',
    
    // Finance
    'finance.title': 'Finance',
    'finance.description': 'Manage accounts, transactions, and reports',
    'finance.accounts': 'Accounts',
    'finance.transactions': 'Transactions',
    'finance.budgets': 'Budgets',
    'finance.reports': 'Reports',
    'finance.analytics': 'Analytics',
    'finance.banking': 'Banking',
    'finance.bills': 'Bills',
    'finance.invoices': 'Invoices',
    'finance.journal': 'Journal Entries',
    'finance.tax': 'Tax Management',
    'finance.cashFlow': 'Cash Flow',
    'finance.costCenters': 'Cost Centers',
    
    // Sales
    'sales.title': 'Sales',
    'sales.description': 'Track leads, deals, and pipeline',
    
    // CRM
    'crm.title': 'CRM',
    'crm.description': 'Customer relationship management',
    
    // HR
    'hr.title': 'HR',
    'hr.description': 'Human resources management',
    
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
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.finance': 'المالية',
    'nav.sales': 'المبيعات',
    'nav.crm': 'إدارة العملاء',
    'nav.hr': 'الموارد البشرية',
    'nav.procurement': 'المشتريات',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.manage': 'إدارة',
    'common.viewDetails': 'عرض التفاصيل',
    
    // App
    'app.title': 'بوابة الأعمال السعودية',
    'app.description': 'منصة مؤسسية متعددة المستأجرين',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً بعودتك',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.statistics': 'الإحصائيات',
    'dashboard.analytics': 'التحليلات',
    'dashboard.processes': 'العمليات',
    
    // Finance
    'finance.title': 'المالية',
    'finance.description': 'إدارة الحسابات والمعاملات والتقارير',
    'finance.accounts': 'الحسابات',
    'finance.transactions': 'المعاملات',
    'finance.budgets': 'الميزانيات',
    'finance.reports': 'التقارير',
    'finance.analytics': 'التحليلات المالية',
    'finance.banking': 'الخدمات المصرفية',
    'finance.bills': 'الفواتير',
    'finance.invoices': 'الفواتير الصادرة',
    'finance.journal': 'قيود اليومية',
    'finance.tax': 'إدارة الضرائب',
    'finance.cashFlow': 'التدفق النقدي',
    'finance.costCenters': 'مراكز التكلفة',
    
    // Sales
    'sales.title': 'المبيعات',
    'sales.description': 'تتبع العملاء المحتملين والصفقات والمسار',
    
    // CRM
    'crm.title': 'إدارة العملاء',
    'crm.description': 'إدارة علاقات العملاء',
    
    // HR
    'hr.title': 'الموارد البشرية',
    'hr.description': 'إدارة الموارد البشرية',
    
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
