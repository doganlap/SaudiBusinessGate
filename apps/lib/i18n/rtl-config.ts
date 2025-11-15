/**
 * Global RTL Configuration and Utilities
 * Comprehensive RTL support for Arabic and other RTL languages
 */

export type Direction = 'ltr' | 'rtl';
export type Language = 'en' | 'ar' | 'he' | 'fa' | 'ur';

/**
 * RTL Languages Configuration
 */
export const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur'];

/**
 * Language Configuration
 */
export const LANGUAGE_CONFIG = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr' as Direction,
    locale: 'en-US',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl' as Direction,
    locale: 'ar-SA',
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl' as Direction,
    locale: 'he-IL',
  },
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    direction: 'rtl' as Direction,
    locale: 'fa-IR',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl' as Direction,
    locale: 'ur-PK',
  },
};

/**
 * Check if language is RTL
 */
export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language as Language);
}

/**
 * Get direction for language
 */
export function getDirection(language: string): Direction {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Get language configuration
 */
export function getLanguageConfig(language: string) {
  return LANGUAGE_CONFIG[language as Language] || LANGUAGE_CONFIG.en;
}

/**
 * RTL-aware CSS class generator
 */
export function rtlClass(language: string, ltrClass: string, rtlClass: string): string {
  return isRTL(language) ? rtlClass : ltrClass;
}

/**
 * Convert LTR position to RTL-aware position
 */
export function rtlPosition(language: string, position: 'left' | 'right'): 'left' | 'right' {
  if (!isRTL(language)) return position;
  return position === 'left' ? 'right' : 'left';
}

/**
 * Convert LTR margin/padding to RTL-aware
 */
export function rtlSpacing(
  language: string,
  property: 'margin' | 'padding',
  side: 'left' | 'right',
  value: string | number
): Record<string, string | number> {
  const actualSide = rtlPosition(language, side);
  return {
    [`${property}${actualSide.charAt(0).toUpperCase() + actualSide.slice(1)}`]: value,
  };
}

/**
 * RTL-aware flexbox direction
 */
export function rtlFlexDirection(
  language: string,
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse'
): string {
  if (!isRTL(language) || !direction.includes('row')) return direction;
  return direction === 'row' ? 'row-reverse' : 'row';
}

/**
 * RTL-aware text align
 */
export function rtlTextAlign(language: string, align: 'left' | 'right' | 'center' | 'justify'): string {
  if (align === 'center' || align === 'justify') return align;
  return isRTL(language) ? (align === 'left' ? 'right' : 'left') : align;
}

/**
 * Get logical property (for modern CSS)
 */
export function logicalProperty(property: string): string {
  const logicalMap: Record<string, string> = {
    'margin-left': 'margin-inline-start',
    'margin-right': 'margin-inline-end',
    'padding-left': 'padding-inline-start',
    'padding-right': 'padding-inline-end',
    'border-left': 'border-inline-start',
    'border-right': 'border-inline-end',
    'left': 'inset-inline-start',
    'right': 'inset-inline-end',
    'text-align-left': 'text-align: start',
    'text-align-right': 'text-align: end',
  };

  return logicalMap[property] || property;
}

/**
 * RTL-aware number formatting
 */
export function formatNumber(language: string, number: number, options?: Intl.NumberFormatOptions): string {
  const locale = getLanguageConfig(language).locale;
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * RTL-aware date formatting
 */
export function formatDate(language: string, date: Date, options?: Intl.DateTimeFormatOptions): string {
  const locale = getLanguageConfig(language).locale;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * RTL-aware currency formatting
 */
export function formatCurrency(
  language: string,
  amount: number,
  currency: string = 'SAR'
): string {
  const locale = getLanguageConfig(language).locale;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Convert Arabic-Indic numerals to Western numerals (and vice versa)
 */
export function convertNumerals(text: string, toArabic: boolean = false): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = text;
  if (toArabic) {
    westernNumerals.forEach((num, index) => {
      result = result.replace(new RegExp(num, 'g'), arabicNumerals[index]);
    });
  } else {
    arabicNumerals.forEach((num, index) => {
      result = result.replace(new RegExp(num, 'g'), westernNumerals[index]);
    });
  }
  return result;
}

/**
 * RTL-aware icon flip
 * Some icons need to be flipped for RTL (arrows, chevrons, etc.)
 */
export const FLIP_ICONS_RTL = [
  'arrow-left',
  'arrow-right',
  'chevron-left',
  'chevron-right',
  'angle-left',
  'angle-right',
  'caret-left',
  'caret-right',
  'forward',
  'backward',
  'undo',
  'redo',
];

export function shouldFlipIcon(iconName: string): boolean {
  return FLIP_ICONS_RTL.some(name => iconName.toLowerCase().includes(name));
}

/**
 * Apply RTL transformation to icon
 */
export function rtlIconTransform(language: string, iconName: string): string {
  if (!isRTL(language) || !shouldFlipIcon(iconName)) return '';
  return 'scale(-1, 1)'; // Flip horizontally
}

/**
 * Get Tailwind RTL classes
 */
export function tailwindRTL(language: string) {
  const dir = getDirection(language);
  return {
    // Text alignment
    textStart: dir === 'rtl' ? 'text-right' : 'text-left',
    textEnd: dir === 'rtl' ? 'text-left' : 'text-right',
    
    // Margins
    ms: (size: string) => dir === 'rtl' ? `mr-${size}` : `ml-${size}`,
    me: (size: string) => dir === 'rtl' ? `ml-${size}` : `mr-${size}`,
    
    // Padding
    ps: (size: string) => dir === 'rtl' ? `pr-${size}` : `pl-${size}`,
    pe: (size: string) => dir === 'rtl' ? `pl-${size}` : `pr-${size}`,
    
    // Borders
    borderStart: dir === 'rtl' ? 'border-r' : 'border-l',
    borderEnd: dir === 'rtl' ? 'border-l' : 'border-r',
    
    // Positioning
    start: (size: string) => dir === 'rtl' ? `right-${size}` : `left-${size}`,
    end: (size: string) => dir === 'rtl' ? `left-${size}` : `right-${size}`,
    
    // Rounded corners
    roundedStart: dir === 'rtl' ? 'rounded-r' : 'rounded-l',
    roundedEnd: dir === 'rtl' ? 'rounded-l' : 'rounded-r',
  };
}

/**
 * CSS-in-JS RTL styles helper
 */
export function rtlStyles(language: string) {
  const dir = getDirection(language);
  
  return {
    container: {
      direction: dir,
    },
    
    textAlign: (align: 'start' | 'end' | 'center') => ({
      textAlign: align === 'start' 
        ? (dir === 'rtl' ? 'right' : 'left')
        : align === 'end'
        ? (dir === 'rtl' ? 'left' : 'right')
        : 'center'
    }),
    
    marginStart: (value: string | number) => ({
      [dir === 'rtl' ? 'marginRight' : 'marginLeft']: value,
    }),
    
    marginEnd: (value: string | number) => ({
      [dir === 'rtl' ? 'marginLeft' : 'marginRight']: value,
    }),
    
    paddingStart: (value: string | number) => ({
      [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: value,
    }),
    
    paddingEnd: (value: string | number) => ({
      [dir === 'rtl' ? 'paddingLeft' : 'paddingRight']: value,
    }),
    
    borderStart: (value: string) => ({
      [dir === 'rtl' ? 'borderRight' : 'borderLeft']: value,
    }),
    
    borderEnd: (value: string) => ({
      [dir === 'rtl' ? 'borderLeft' : 'borderRight']: value,
    }),
    
    start: (value: string | number) => ({
      [dir === 'rtl' ? 'right' : 'left']: value,
    }),
    
    end: (value: string | number) => ({
      [dir === 'rtl' ? 'left' : 'right']: value,
    }),
  };
}

export default {
  isRTL,
  getDirection,
  getLanguageConfig,
  rtlClass,
  rtlPosition,
  rtlSpacing,
  rtlFlexDirection,
  rtlTextAlign,
  logicalProperty,
  formatNumber,
  formatDate,
  formatCurrency,
  convertNumerals,
  shouldFlipIcon,
  rtlIconTransform,
  tailwindRTL,
  rtlStyles,
};
