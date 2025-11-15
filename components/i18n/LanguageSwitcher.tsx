'use client';

import React from 'react';
import { useLanguage, languages, languageNames, type Language } from './LanguageProvider';
import { ChevronDown } from 'lucide-react';

const languageFlags = {
  en: '🇺🇸',
  ar: '🇸🇦',
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none cursor-pointer bg-transparent border-none rounded-lg px-3 py-1.5 pe-8 text-sm font-medium focus:outline-none focus:ring-0 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5"
        aria-label="Select language"
      >
        {languages.map((lng) => (
          <option key={lng} value={lng} className="bg-neutral-800 text-white">
            {languageFlags[lng]} {languageNames[lng]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 end-1 flex items-center pointer-events-none">
        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
