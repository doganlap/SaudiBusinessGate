// Arabic formatting utilities and helpers

export class ArabicFormatter {
  // Format numbers in Arabic
  static formatNumber(num: number, lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'ar') {
      // Convert to Arabic-Indic numerals
      return num.toLocaleString('ar-SA');
    }
    return num.toLocaleString('en-US');
  }

  // Format currency in Arabic
  static formatCurrency(amount: number, currency: 'SAR' | 'USD' | 'EUR' = 'SAR', lang: 'ar' | 'en' = 'ar'): string {
    const currencyMap = {
      'SAR': { ar: 'ر.س', en: 'SAR' },
      'USD': { ar: '$', en: 'USD' },
      'EUR': { ar: '€', en: 'EUR' }
    };

    const formattedAmount = this.formatNumber(amount, lang);
    const currencySymbol = currencyMap[currency][lang];

    if (lang === 'ar') {
      return `${formattedAmount} ${currencySymbol}`;
    } else {
      return `${currencySymbol} ${formattedAmount}`;
    }
  }

  // Format dates in Arabic
  static formatDate(date: Date | string, lang: 'ar' | 'en' = 'ar'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (lang === 'ar') {
      return dateObj.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Format time in Arabic
  static formatTime(date: Date | string, lang: 'ar' | 'en' = 'ar'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (lang === 'ar') {
      return dateObj.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Format percentage
  static formatPercentage(value: number, lang: 'ar' | 'en' = 'ar'): string {
    const formatted = this.formatNumber(value, lang);
    return lang === 'ar' ? `%${formatted}` : `${formatted}%`;
  }

  // Convert English digits to Arabic-Indic digits
  static toArabicDigits(str: string): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit)]);
  }

  // Convert Arabic-Indic digits to English digits
  static toEnglishDigits(str: string): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let result = str;
    arabicDigits.forEach((arabicDigit, index) => {
      result = result.replace(new RegExp(arabicDigit, 'g'), index.toString());
    });
    return result;
  }

  // Get relative time in Arabic
  static getRelativeTime(date: Date | string, lang: 'ar' | 'en' = 'ar'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (lang === 'ar') {
      if (diffInSeconds < 60) return 'الآن';
      if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
      if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
      if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
      if (diffInSeconds < 31536000) return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`;
      return `منذ ${Math.floor(diffInSeconds / 31536000)} سنة`;
    } else {
      if (diffInSeconds < 60) return 'now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }
  }

  // Format file size
  static formatFileSize(bytes: number, lang: 'ar' | 'en' = 'ar'): string {
    const sizes = lang === 'ar' 
      ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
      : ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0) return lang === 'ar' ? '٠ بايت' : '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    
    return `${this.formatNumber(parseFloat(size), lang)} ${sizes[i]}`;
  }

  // Get Arabic day name
  static getDayName(date: Date | string, lang: 'ar' | 'en' = 'ar'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayIndex = dateObj.getDay();
    
    const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const englishDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return lang === 'ar' ? arabicDays[dayIndex] : englishDays[dayIndex];
  }

  // Get Arabic month name
  static getMonthName(date: Date | string, lang: 'ar' | 'en' = 'ar'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const monthIndex = dateObj.getMonth();
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const englishMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return lang === 'ar' ? arabicMonths[monthIndex] : englishMonths[monthIndex];
  }
}

// RTL text utilities
export class RTLUtils {
  // Check if text contains Arabic characters
  static containsArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
  }

  // Get text direction based on content
  static getTextDirection(text: string): 'ltr' | 'rtl' {
    return this.containsArabic(text) ? 'rtl' : 'ltr';
  }

  // Add RTL mark to text if needed
  static addRTLMark(text: string): string {
    return this.containsArabic(text) ? `\u202B${text}\u202C` : text;
  }

  // Clean RTL marks from text
  static cleanRTLMarks(text: string): string {
    return text.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
  }
}

// Arabic validation utilities
export class ArabicValidation {
  // Validate Arabic name
  static isValidArabicName(name: string): boolean {
    const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
    return arabicNameRegex.test(name.trim());
  }

  // Validate Saudi phone number
  static isValidSaudiPhone(phone: string): boolean {
    const saudiPhoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Validate Saudi ID
  static isValidSaudiID(id: string): boolean {
    const saudiIDRegex = /^[12][0-9]{9}$/;
    return saudiIDRegex.test(id);
  }

  // Validate Arabic text input
  static isValidArabicText(text: string): boolean {
    const arabicTextRegex = /^[\u0600-\u06FF\s\d\.,!?؟]+$/;
    return arabicTextRegex.test(text.trim());
  }
}
