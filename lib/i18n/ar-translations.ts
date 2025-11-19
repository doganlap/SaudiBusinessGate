/**
 * Comprehensive Arabic Translations for DoganHub Platform
 * This file contains all Arabic translations used throughout the application
 */

export const arTranslations = {
  // Common Actions
  common: {
    actions: {
      create: 'إنشاء',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      submit: 'إرسال',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      import: 'استيراد',
      view: 'عرض',
      print: 'طباعة',
      download: 'تحميل',
      upload: 'رفع',
      refresh: 'تحديث',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق',
      select: 'اختيار',
      selectAll: 'اختيار الكل',
      deselectAll: 'إلغاء اختيار الكل',
      confirm: 'تأكيد',
      yes: 'نعم',
      no: 'لا',
      ok: 'موافق',
    },
    status: {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'معلق',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف',
    },
    messages: {
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات متاحة',
      error: 'حدث خطأ',
      success: 'تمت العملية بنجاح',
      confirmDelete: 'هل أنت متأكد من حذف هذا العنصر؟',
      saved: 'تم الحفظ بنجاح',
      deleted: 'تم الحذف بنجاح',
      updated: 'تم التحديث بنجاح',
      created: 'تم الإنشاء بنجاح',
    },
  },

  // Navigation
  nav: {
    dashboard: 'لوحة التحكم',
    finance: 'المالية',
    sales: 'المبيعات',
    crm: 'إدارة العملاء',
    hr: 'الموارد البشرية',
    procurement: 'المشتريات',
    analytics: 'التحليلات',
    billing: 'الفوترة',
    settings: 'الإعدادات',
    platform: 'إدارة المنصة',
    reports: 'التقارير',
    workflows: 'سير العمل',
    auditLogs: 'سجلات التدقيق',
  },

  // Dashboard
  dashboard: {
    title: 'لوحة التحكم',
    welcome: 'مرحباً بك',
    overview: 'نظرة عامة',
    recentActivity: 'النشاط الأخير',
    quickActions: 'إجراءات سريعة',
    statistics: 'الإحصائيات',
  },

  // Finance Module
  finance: {
    title: 'المالية',
    accounts: 'الحسابات',
    transactions: 'المعاملات',
    budgets: 'الميزانيات',
    reports: 'التقارير',
    invoices: 'الفواتير',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    profit: 'الربح',
    loss: 'الخسارة',
    balance: 'الرصيد',
    payment: 'دفعة',
    receipt: 'إيصال',
  },

  // Sales Module
  sales: {
    title: 'المبيعات',
    leads: 'العملاء المحتملون',
    deals: 'الصفقات',
    pipeline: 'خط الأنابيب',
    customers: 'العملاء',
    orders: 'الطلبات',
    quotes: 'عروض الأسعار',
    contracts: 'العقود',
    proposals: 'العروض',
  },

  // CRM Module
  crm: {
    title: 'إدارة العملاء',
    customers: 'العملاء',
    contacts: 'جهات الاتصال',
    activities: 'الأنشطة',
    deals: 'الصفقات',
    pipeline: 'خط الأنابيب',
  },

  // HR Module
  hr: {
    title: 'الموارد البشرية',
    employees: 'الموظفون',
    payroll: 'كشف الرواتب',
    attendance: 'الحضور',
    leave: 'الإجازات',
    recruitment: 'التوظيف',
  },

  // Procurement Module
  procurement: {
    title: 'المشتريات',
    vendors: 'الموردون',
    orders: 'الطلبات',
    inventory: 'المخزون',
    contracts: 'العقود',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'تسجيل حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    goToApp: 'الذهاب إلى التطبيق',
  },

  // Platform Admin
  platform: {
    title: 'إدارة المنصة',
    tenants: 'المستأجرون',
    users: 'المستخدمون',
    settings: 'الإعدادات',
    apiStatus: 'حالة API',
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    general: 'عام',
    profile: 'الملف الشخصي',
    security: 'الأمان',
    notifications: 'الإشعارات',
    language: 'اللغة',
    theme: 'المظهر',
    billing: 'الفواتير',
  },
};

// Helper function to get nested translation
export function getArTranslation(key: string): string {
  const keys = key.split('.');
  let value: any = arTranslations;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

