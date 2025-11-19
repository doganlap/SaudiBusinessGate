/**
 * Automatic i18n Configuration
 * Ensures Arabic (RTL) is the default language throughout the application
 */

import { defaultLanguage, languages, getLanguageDirection } from './index';

/**
 * Automatically set document direction and language
 * Called on page load and language changes
 */
export function autoConfigureI18n(language?: string) {
  if (typeof document === 'undefined') return;

  const lang = language || defaultLanguage;
  const direction = getLanguageDirection(lang as any);

  // Set HTML attributes
  document.documentElement.lang = lang;
  document.documentElement.dir = direction;

  // Add language and direction classes
  document.documentElement.classList.remove('lang-ar', 'lang-en', 'dir-rtl', 'dir-ltr');
  document.documentElement.classList.add(`lang-${lang}`, `dir-${direction}`);

  // Set body direction class
  document.body.classList.remove('rtl', 'ltr');
  document.body.classList.add(direction);

  // Update meta tags
  const metaLang = document.querySelector('meta[http-equiv="content-language"]');
  if (metaLang) {
    metaLang.setAttribute('content', lang);
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'content-language');
    meta.setAttribute('content', lang);
    document.head.appendChild(meta);
  }
}

/**
 * Initialize automatic i18n on page load
 */
export function initAutoI18n() {
  if (typeof window === 'undefined') return;

  // Get language from URL, localStorage, or default
  const pathLang = window.location.pathname.split('/')[1];
  const storedLang = localStorage.getItem('language');
  const lang = languages.includes(pathLang as any) 
    ? pathLang 
    : (storedLang && languages.includes(storedLang as any) 
      ? storedLang 
      : defaultLanguage);

  // Configure immediately
  autoConfigureI18n(lang);

  // Listen for language changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'language' && e.newValue) {
      autoConfigureI18n(e.newValue);
    }
  });

  // Watch for URL changes (for Next.js navigation)
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      const newLang = currentPath.split('/')[1];
      if (languages.includes(newLang as any)) {
        autoConfigureI18n(newLang);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoI18n);
  } else {
    initAutoI18n();
  }
}

