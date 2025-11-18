'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { mode, toggleMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative h-5 w-5">
        <Sun className={`h-5 w-5 transition-all duration-300 ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
        <Moon className={`h-5 w-5 transition-all duration-300 absolute top-0 left-0 ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      </div>
    </button>
  );
}