import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';

/**
 * ==========================================
 * THEME SELECTOR COMPONENT
 * ==========================================
 * 
 * Advanced theme selection component with:
 * - Light/Dark/System themes
 * - Color scheme variations
 * - Preview functionality
 * - Local storage persistence
 * - Smooth transitions
 */

const ThemeSelector = ({ className = "" }) => {
  const [currentTheme, setCurrentTheme] = useState('system');
  const [colorScheme, setColorScheme] = useState('blue');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'system', name: 'System', icon: <Monitor className="w-4 h-4" /> }
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Blue', color: '#3B82F6' },
    { id: 'purple', name: 'Purple', color: '#8B5CF6' },
    { id: 'green', name: 'Green', color: '#10B981' },
    { id: 'orange', name: 'Orange', color: '#F59E0B' },
    { id: 'red', name: 'Red', color: '#EF4444' },
    { id: 'slate', name: 'Slate', color: '#64748B' }
  ];

  const applyTheme = React.useCallback((theme, scheme) => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', scheme);
    
    // Update CSS variables
    root.style.setProperty('--primary-color', getColorValue(scheme));
  }, []);

  useEffect(() => {
    // Load saved theme preferences
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedColorScheme = localStorage.getItem('colorScheme') || 'blue';
    
    setCurrentTheme(savedTheme);
    setColorScheme(savedColorScheme);
    
    applyTheme(savedTheme, savedColorScheme);
  }, [applyTheme]);

  const getColorValue = (scheme) => {
    const colorMap = {
      blue: '#3B82F6',
      purple: '#8B5CF6',
      green: '#10B981',
      orange: '#F59E0B',
      red: '#EF4444',
      slate: '#64748B'
    };
    return colorMap[scheme] || colorMap.blue;
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme, colorScheme);
  };

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
    applyTheme(currentTheme, scheme);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <Palette className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme Selector Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Theme Settings
            </h3>
            
            {/* Theme Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Appearance
              </label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
                      currentTheme === theme.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {theme.icon}
                    <span className="text-xs mt-1 font-medium">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <Check className="w-3 h-3 mt-1 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color Scheme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => handleColorSchemeChange(scheme.id)}
                    className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                      colorScheme === scheme.id
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-6 h-6 rounded-full mb-1"
                        style={{ backgroundColor: scheme.color }}
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {scheme.name}
                      </span>
                      {colorScheme === scheme.id && (
                        <Check className="w-3 h-3 mt-1 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Theme changes are applied immediately and saved for future visits.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;