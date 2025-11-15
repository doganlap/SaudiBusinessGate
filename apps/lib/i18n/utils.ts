import type { Language } from '@/components/i18n/LanguageProvider';

/**
 * Utility functions for i18n
 */

/**
 * Get the appropriate font class based on language
 */
export function getLanguageFont(language: Language): string {
  return language === 'ar' ? 'font-arabic' : 'font-inter';
}

/**
 * Format numbers according to locale
 */
export function formatNumber(
  num: number,
  locale: Language,
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode, options).format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: Language,
  currency: string = 'SAR'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format dates according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(localeCode, options).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Language
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 604800) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Get text alignment class based on language direction
 */
export function getTextAlign(language: Language): string {
  return language === 'ar' ? 'text-right' : 'text-left';
}

/**
 * Get flex direction class based on language direction
 */
export function getFlexDirection(language: Language, reverse: boolean = false): string {
  const isRTL = language === 'ar';
  if (reverse) {
    return isRTL ? 'flex-row' : 'flex-row-reverse';
  }
  return isRTL ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Get padding/margin classes based on language direction
 * Use logical properties for automatic RTL support
 */
export function getLogicalSpacing(type: 'start' | 'end', value: string): string {
  const property = type === 'start' ? 'ps' : 'pe'; // padding-inline-start/end
  return `${property}-${value}`;
}

/**
 * Convert language code to locale string
 */
export function getLocaleString(language: Language): string {
  return language === 'ar' ? 'ar-SA' : 'en-US';
}

/**
 * Get reading order (for flex/grid)
 */
export function getReadingOrder(language: Language): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr';
}
