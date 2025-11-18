import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// 🎨 Advanced Theme Definitions
const THEMES = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright theme',
    mode: 'light',
    preview: '#3B82F6',
    colors: {
      // Backgrounds
      bg: '#FFFFFF',
      bgMuted: '#F9FAFB',
      bgHover: '#F3F4F6',
      surface: '#FFFFFF',
      surfaceHover: '#F9FAFB',
      
      // Foregrounds
      fg: '#111827',
      fgMuted: '#6B7280',
      fgSubtle: '#9CA3AF',
      
      // Primary
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryActive: '#1D4ED8',
      primaryFg: '#FFFFFF',
      
      // Secondary
      secondary: '#8B5CF6',
      secondaryHover: '#7C3AED',
      secondaryFg: '#FFFFFF',
      
      // Accent
      accent: '#10B981',
      accentHover: '#059669',
      accentFg: '#FFFFFF',
      
      // Borders
      border: '#E5E7EB',
      borderHover: '#D1D5DB',
      
      // Status colors
      success: '#10B981',
      successBg: '#D1FAE5',
      warning: '#F59E0B',
      warningBg: '#FEF3C7',
      error: '#EF4444',
      errorBg: '#FEE2E2',
      info: '#3B82F6',
      infoBg: '#DBEAFE',
      
      // Shadows
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    }
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    mode: 'dark',
    preview: '#1F2937',
    colors: {
      // Backgrounds
      bg: '#111827',
      bgMuted: '#1F2937',
      bgHover: '#374151',
      surface: '#1F2937',
      surfaceHover: '#374151',
      
      // Foregrounds
      fg: '#F9FAFB',
      fgMuted: '#D1D5DB',
      fgSubtle: '#9CA3AF',
      
      // Primary
      primary: '#60A5FA',
      primaryHover: '#3B82F6',
      primaryActive: '#2563EB',
      primaryFg: '#FFFFFF',
      
      // Secondary
      secondary: '#A78BFA',
      secondaryHover: '#8B5CF6',
      secondaryFg: '#FFFFFF',
      
      // Accent
      accent: '#34D399',
      accentHover: '#10B981',
      accentFg: '#FFFFFF',
      
      // Borders
      border: '#374151',
      borderHover: '#4B5563',
      
      // Status colors
      success: '#34D399',
      successBg: '#064E3B',
      warning: '#FBBF24',
      warningBg: '#78350F',
      error: '#F87171',
      errorBg: '#7F1D1D',
      info: '#60A5FA',
      infoBg: '#1E3A8A',
      
      // Shadows
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue professional theme',
    mode: 'dark',
    preview: '#0C4A6E',
    colors: {
      bg: '#082F49',
      bgMuted: '#0C4A6E',
      bgHover: '#075985',
      surface: '#0C4A6E',
      surfaceHover: '#075985',
      
      fg: '#F0F9FF',
      fgMuted: '#BAE6FD',
      fgSubtle: '#7DD3FC',
      
      primary: '#0EA5E9',
      primaryHover: '#0284C7',
      primaryActive: '#0369A1',
      primaryFg: '#FFFFFF',
      
      secondary: '#06B6D4',
      secondaryHover: '#0891B2',
      secondaryFg: '#FFFFFF',
      
      accent: '#14B8A6',
      accentHover: '#0D9488',
      accentFg: '#FFFFFF',
      
      border: '#075985',
      borderHover: '#0369A1',
      
      success: '#14B8A6',
      successBg: '#134E4A',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#0EA5E9',
      infoBg: '#0C4A6E',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    }
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green theme',
    mode: 'dark',
    preview: '#14532D',
    colors: {
      bg: '#14532D',
      bgMuted: '#166534',
      bgHover: '#15803D',
      surface: '#166534',
      surfaceHover: '#15803D',
      
      fg: '#F0FDF4',
      fgMuted: '#BBF7D0',
      fgSubtle: '#86EFAC',
      
      primary: '#22C55E',
      primaryHover: '#16A34A',
      primaryActive: '#15803D',
      primaryFg: '#FFFFFF',
      
      secondary: '#84CC16',
      secondaryHover: '#65A30D',
      secondaryFg: '#FFFFFF',
      
      accent: '#10B981',
      accentHover: '#059669',
      accentFg: '#FFFFFF',
      
      border: '#15803D',
      borderHover: '#16A34A',
      
      success: '#22C55E',
      successBg: '#14532D',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#3B82F6',
      infoBg: '#1E3A8A',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and purple theme',
    mode: 'dark',
    preview: '#7C2D12',
    colors: {
      bg: '#431407',
      bgMuted: '#7C2D12',
      bgHover: '#9A3412',
      surface: '#7C2D12',
      surfaceHover: '#9A3412',
      
      fg: '#FFF7ED',
      fgMuted: '#FED7AA',
      fgSubtle: '#FDBA74',
      
      primary: '#F97316',
      primaryHover: '#EA580C',
      primaryActive: '#C2410C',
      primaryFg: '#FFFFFF',
      
      secondary: '#EC4899',
      secondaryHover: '#DB2777',
      secondaryFg: '#FFFFFF',
      
      accent: '#F59E0B',
      accentHover: '#D97706',
      accentFg: '#FFFFFF',
      
      border: '#9A3412',
      borderHover: '#C2410C',
      
      success: '#10B981',
      successBg: '#064E3B',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#3B82F6',
      infoBg: '#1E3A8A',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    }
  },

  royal: {
    id: 'royal',
    name: 'Royal',
    description: 'Elegant purple theme',
    mode: 'dark',
    preview: '#581C87',
    colors: {
      bg: '#3B0764',
      bgMuted: '#581C87',
      bgHover: '#6B21A8',
      surface: '#581C87',
      surfaceHover: '#6B21A8',
      
      fg: '#FAF5FF',
      fgMuted: '#E9D5FF',
      fgSubtle: '#D8B4FE',
      
      primary: '#A855F7',
      primaryHover: '#9333EA',
      primaryActive: '#7E22CE',
      primaryFg: '#FFFFFF',
      
      secondary: '#EC4899',
      secondaryHover: '#DB2777',
      secondaryFg: '#FFFFFF',
      
      accent: '#F472B6',
      accentHover: '#EC4899',
      accentFg: '#FFFFFF',
      
      border: '#6B21A8',
      borderHover: '#7E22CE',
      
      success: '#10B981',
      successBg: '#064E3B',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#3B82F6',
      infoBg: '#1E3A8A',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    }
  },

  crimson: {
    id: 'crimson',
    name: 'Crimson',
    description: 'Bold red theme',
    mode: 'dark',
    preview: '#7F1D1D',
    colors: {
      bg: '#450A0A',
      bgMuted: '#7F1D1D',
      bgHover: '#991B1B',
      surface: '#7F1D1D',
      surfaceHover: '#991B1B',
      
      fg: '#FEF2F2',
      fgMuted: '#FECACA',
      fgSubtle: '#FCA5A5',
      
      primary: '#EF4444',
      primaryHover: '#DC2626',
      primaryActive: '#B91C1C',
      primaryFg: '#FFFFFF',
      
      secondary: '#F97316',
      secondaryHover: '#EA580C',
      secondaryFg: '#FFFFFF',
      
      accent: '#EC4899',
      accentHover: '#DB2777',
      accentFg: '#FFFFFF',
      
      border: '#991B1B',
      borderHover: '#B91C1C',
      
      success: '#10B981',
      successBg: '#064E3B',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#3B82F6',
      infoBg: '#1E3A8A',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    }
  },

  slate: {
    id: 'slate',
    name: 'Slate',
    description: 'Professional gray theme',
    mode: 'dark',
    preview: '#1E293B',
    colors: {
      bg: '#0F172A',
      bgMuted: '#1E293B',
      bgHover: '#334155',
      surface: '#1E293B',
      surfaceHover: '#334155',
      
      fg: '#F8FAFC',
      fgMuted: '#CBD5E1',
      fgSubtle: '#94A3B8',
      
      primary: '#64748B',
      primaryHover: '#475569',
      primaryActive: '#334155',
      primaryFg: '#FFFFFF',
      
      secondary: '#6366F1',
      secondaryHover: '#4F46E5',
      secondaryFg: '#FFFFFF',
      
      accent: '#0EA5E9',
      accentHover: '#0284C7',
      accentFg: '#FFFFFF',
      
      border: '#334155',
      borderHover: '#475569',
      
      success: '#10B981',
      successBg: '#064E3B',
      warning: '#F59E0B',
      warningBg: '#78350F',
      error: '#EF4444',
      errorBg: '#7F1D1D',
      info: '#3B82F6',
      infoBg: '#1E3A8A',
      
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or default to 'light'
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    const saved = localStorage.getItem('doganhub-theme');
    return saved || 'light';
  });

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('doganhub-custom-colors');
    return saved ? JSON.parse(saved) : {};
  });

  const currentTheme = THEMES[currentThemeId] || THEMES.light;

  // Apply theme to document
  useEffect(() => {
    const colors = { ...currentTheme.colors, ...customColors };
    
    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // Apply theme mode class
    document.documentElement.setAttribute('data-theme', currentTheme.mode);
    
    // Save to localStorage
    localStorage.setItem('doganhub-theme', currentThemeId);
    
  }, [currentTheme, customColors, currentThemeId]);

  // Change theme
  const changeTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  // Toggle between light and dark mode
  const toggleMode = () => {
    const newTheme = currentTheme.mode === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Customize specific colors
  const customizeColor = (colorKey, colorValue) => {
    const newCustomColors = { ...customColors, [colorKey]: colorValue };
    setCustomColors(newCustomColors);
    localStorage.setItem('doganhub-custom-colors', JSON.stringify(newCustomColors));
  };

  // Reset custom colors
  const resetCustomColors = () => {
    setCustomColors({});
    localStorage.removeItem('doganhub-custom-colors');
  };

  // Get color value
  const getColor = (colorKey) => {
    return customColors[colorKey] || currentTheme.colors[colorKey];
  };

  const value = {
    theme: currentTheme,
    themes: THEMES,
    currentThemeId,
    changeTheme,
    toggleMode,
    customizeColor,
    resetCustomColors,
    getColor,
    customColors,
    hasCustomColors: Object.keys(customColors).length > 0
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

