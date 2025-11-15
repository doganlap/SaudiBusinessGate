'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { translations, t } from '@/lib/i18n/translations';
import { ArabicFormatter, RTLUtils } from '@/lib/i18n/arabic-utils';
import { getLanguageDirection } from '@/lib/i18n';

export function useArabic() {
  const params = useParams();
  const lng = (params?.lng as string) || 'ar'; // Default to Arabic
  const isArabic = lng === 'ar';
  const direction = getLanguageDirection(lng as any);
  const isRTL = direction === 'rtl';

  // Translation function
  const translate = useMemo(() => {
    return (key: string, fallback?: string) => {
      const translation = translations[lng as keyof typeof translations]?.[key as keyof typeof translations.ar];
      return translation || fallback || key;
    };
  }, [lng]);

  // Formatting functions
  const format = useMemo(() => ({
    number: (num: number) => ArabicFormatter.formatNumber(num, lng as any),
    currency: (amount: number, currency: 'SAR' | 'USD' | 'EUR' = 'SAR') => 
      ArabicFormatter.formatCurrency(amount, currency, lng as any),
    date: (date: Date | string) => ArabicFormatter.formatDate(date, lng as any),
    time: (date: Date | string) => ArabicFormatter.formatTime(date, lng as any),
    percentage: (value: number) => ArabicFormatter.formatPercentage(value, lng as any),
    fileSize: (bytes: number) => ArabicFormatter.formatFileSize(bytes, lng as any),
    relativeTime: (date: Date | string) => ArabicFormatter.getRelativeTime(date, lng as any),
    dayName: (date: Date | string) => ArabicFormatter.getDayName(date, lng as any),
    monthName: (date: Date | string) => ArabicFormatter.getMonthName(date, lng as any)
  }), [lng]);

  // RTL utilities
  const rtl = useMemo(() => ({
    containsArabic: RTLUtils.containsArabic,
    getTextDirection: RTLUtils.getTextDirection,
    addRTLMark: RTLUtils.addRTLMark,
    cleanRTLMarks: RTLUtils.cleanRTLMarks
  }), []);

  // CSS classes for RTL support
  const css = useMemo(() => ({
    // Flexbox utilities
    flexRow: isRTL ? 'flex-row-reverse' : 'flex-row',
    flexRowReverse: isRTL ? 'flex-row' : 'flex-row-reverse',
    
    // Text alignment
    textLeft: isRTL ? 'text-right' : 'text-left',
    textRight: isRTL ? 'text-left' : 'text-right',
    
    // Margins
    ml: (size: string) => isRTL ? `mr-${size}` : `ml-${size}`,
    mr: (size: string) => isRTL ? `ml-${size}` : `mr-${size}`,
    
    // Padding
    pl: (size: string) => isRTL ? `pr-${size}` : `pl-${size}`,
    pr: (size: string) => isRTL ? `pl-${size}` : `pr-${size}`,
    
    // Borders
    borderLeft: isRTL ? 'border-r' : 'border-l',
    borderRight: isRTL ? 'border-l' : 'border-r',
    
    // Positioning
    left: (size: string) => isRTL ? `right-${size}` : `left-${size}`,
    right: (size: string) => isRTL ? `left-${size}` : `right-${size}`,
    
    // Rounded corners
    roundedLeft: isRTL ? 'rounded-r' : 'rounded-l',
    roundedRight: isRTL ? 'rounded-l' : 'rounded-r',
    
    // Space between
    spaceX: (size: string) => `space-x-${size}`,
    spaceXReverse: isRTL ? 'space-x-reverse' : '',
    
    // Direction class
    dir: direction,
    
    // Combined classes
    container: `${direction === 'rtl' ? 'rtl' : 'ltr'}`,
    
    // Navigation specific
    navSidebar: isRTL ? 'right-0' : 'left-0',
    navContent: isRTL ? 'mr-72 lg:mr-72' : 'ml-72 lg:ml-72',
    
    // Form specific
    formLabel: isRTL ? 'text-right' : 'text-left',
    formInput: isRTL ? 'text-right' : 'text-left'
  }), [isRTL, direction]);

  // Common Arabic phrases
  const phrases = useMemo(() => ({
    welcome: translate('welcome'),
    loading: translate('loading'),
    noData: translate('no_data'),
    error: translate('error'),
    success: translate('success'),
    save: translate('save'),
    cancel: translate('cancel'),
    delete: translate('delete'),
    edit: translate('edit'),
    create: translate('create'),
    search: translate('search'),
    filter: translate('filter'),
    export: translate('export'),
    print: translate('print'),
    today: translate('today'),
    yesterday: translate('yesterday'),
    tomorrow: translate('tomorrow')
  }), [translate]);

  // Pluralization helper
  const pluralize = (count: number, singular: string, plural: string) => {
    if (isArabic) {
      // Arabic pluralization rules
      if (count === 0) return `لا يوجد ${translate(singular)}`;
      if (count === 1) return `${translate(singular)} واحد`;
      if (count === 2) return `${translate(singular)}ان`;
      if (count >= 3 && count <= 10) return `${format.number(count)} ${translate(plural)}`;
      return `${format.number(count)} ${translate(singular)}`;
    } else {
      const singularText = translate(singular);
      const pluralText = translate(plural);
      return count === 1 ? `${count} ${singularText}` : `${count} ${pluralText}`;
    }
  };

  return {
    // Language info
    lng,
    isArabic,
    isRTL,
    direction,
    
    // Translation
    t: translate,
    translate,
    
    // Formatting
    format,
    
    // RTL utilities
    rtl,
    
    // CSS helpers
    css,
    
    // Common phrases
    phrases,
    
    // Pluralization
    pluralize,
    
    // Utility functions
    getOppositeDirection: () => isRTL ? 'ltr' : 'rtl',
    toggleDirection: () => isRTL ? 'en' : 'ar',
    
    // Arabic-specific helpers
    isValidArabicText: (text: string) => /^[\u0600-\u06FF\s\d\.,!?؟]+$/.test(text.trim()),
    containsArabic: (text: string) => /[\u0600-\u06FF\u0750-\u077F]/.test(text),
    
    // Number helpers
    toArabicDigits: ArabicFormatter.toArabicDigits,
    toEnglishDigits: ArabicFormatter.toEnglishDigits
  };
}
