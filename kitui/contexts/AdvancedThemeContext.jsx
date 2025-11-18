import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ==========================================
 * ADVANCED MULTI-THEME SYSTEM
 * ==========================================
 * 
 * Features:
 * - Multiple pre-built themes (8+ themes)
 * - Dark/Light mode variants
 * - Custom theme creation
 * - Theme persistence
 * - CSS variables for real-time updates
 * - Smooth transitions
 * - Accessibility support
 */

// Theme Definitions
export const THEMES = {
  corporate: {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Professional corporate theme',
    light: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceHover: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      sidebar: '#1F2937',
      sidebarText: '#F9FAFB',
      header: '#FFFFFF',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceHover: '#334155',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      sidebar: '#0F172A',
      sidebarText: '#F1F5F9',
      header: '#1E293B',
      shadow: 'rgba(0, 0, 0, 0.3)',
    }
  },
  
  modern: {
    id: 'modern',
    name: 'Modern Purple',
    description: 'Contemporary purple and pink',
    light: {
      primary: '#8B5CF6',
      primaryHover: '#7C3AED',
      secondary: '#EC4899',
      accent: '#14B8A6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceHover: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#8B5CF6',
      sidebar: '#7C3AED',
      sidebarText: '#FFFFFF',
      header: '#FFFFFF',
      shadow: 'rgba(139, 92, 246, 0.15)',
    },
    dark: {
      primary: '#A78BFA',
      primaryHover: '#8B5CF6',
      secondary: '#F472B6',
      accent: '#14B8A6',
      background: '#0F0A1F',
      surface: '#1A1333',
      surfaceHover: '#2D1B69',
      text: '#F3F0FF',
      textSecondary: '#C4B5FD',
      border: '#2D1B69',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#A78BFA',
      sidebar: '#0F0A1F',
      sidebarText: '#F3F0FF',
      header: '#1A1333',
      shadow: 'rgba(139, 92, 246, 0.2)',
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Calming ocean blues and teals',
    light: {
      primary: '#0891B2',
      primaryHover: '#0E7490',
      secondary: '#06B6D4',
      accent: '#14B8A6',
      background: '#FFFFFF',
      surface: '#F0FDFA',
      surfaceHover: '#CCFBF1',
      text: '#134E4A',
      textSecondary: '#0F766E',
      border: '#99F6E4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      sidebar: '#0E7490',
      sidebarText: '#F0FDFA',
      header: '#FFFFFF',
      shadow: 'rgba(8, 145, 178, 0.15)',
    },
    dark: {
      primary: '#22D3EE',
      primaryHover: '#06B6D4',
      secondary: '#14B8A6',
      accent: '#2DD4BF',
      background: '#0C1E1E',
      surface: '#134E4A',
      surfaceHover: '#115E59',
      text: '#F0FDFA',
      textSecondary: '#5EEAD4',
      border: '#115E59',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#22D3EE',
      sidebar: '#0C1E1E',
      sidebarText: '#F0FDFA',
      header: '#134E4A',
      shadow: 'rgba(34, 211, 238, 0.2)',
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset oranges and reds',
    light: {
      primary: '#F97316',
      primaryHover: '#EA580C',
      secondary: '#EF4444',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FFF7ED',
      surfaceHover: '#FFEDD5',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      border: '#FED7AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#F97316',
      sidebar: '#EA580C',
      sidebarText: '#FFF7ED',
      header: '#FFFFFF',
      shadow: 'rgba(249, 115, 22, 0.15)',
    },
    dark: {
      primary: '#FB923C',
      primaryHover: '#F97316',
      secondary: '#F87171',
      accent: '#FCD34D',
      background: '#1F1410',
      surface: '#431407',
      surfaceHover: '#7C2D12',
      text: '#FFF7ED',
      textSecondary: '#FDBA74',
      border: '#7C2D12',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#FB923C',
      sidebar: '#1F1410',
      sidebarText: '#FFF7ED',
      header: '#431407',
      shadow: 'rgba(251, 146, 60, 0.2)',
    }
  },

  forest: {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural forest greens',
    light: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#10B981',
      accent: '#84CC16',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      surfaceHover: '#DCFCE7',
      text: '#14532D',
      textSecondary: '#166534',
      border: '#BBF7D0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#059669',
      sidebar: '#047857',
      sidebarText: '#F0FDF4',
      header: '#FFFFFF',
      shadow: 'rgba(5, 150, 105, 0.15)',
    },
    dark: {
      primary: '#34D399',
      primaryHover: '#10B981',
      secondary: '#84CC16',
      accent: '#A3E635',
      background: '#0A1F14',
      surface: '#14532D',
      surfaceHover: '#166534',
      text: '#F0FDF4',
      textSecondary: '#6EE7B7',
      border: '#166534',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#34D399',
      sidebar: '#0A1F14',
      sidebarText: '#F0FDF4',
      header: '#14532D',
      shadow: 'rgba(52, 211, 153, 0.2)',
    }
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep midnight blues',
    light: {
      primary: '#1E40AF',
      primaryHover: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#EFF6FF',
      surfaceHover: '#DBEAFE',
      text: '#1E3A8A',
      textSecondary: '#1E40AF',
      border: '#BFDBFE',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      sidebar: '#1E3A8A',
      sidebarText: '#EFF6FF',
      header: '#FFFFFF',
      shadow: 'rgba(30, 64, 175, 0.15)',
    },
    dark: {
      primary: '#60A5FA',
      primaryHover: '#3B82F6',
      secondary: '#93C5FD',
      accent: '#DBEAFE',
      background: '#0A0F1E',
      surface: '#1E3A8A',
      surfaceHover: '#1E40AF',
      text: '#EFF6FF',
      textSecondary: '#93C5FD',
      border: '#1E40AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#60A5FA',
      sidebar: '#0A0F1E',
      sidebarText: '#EFF6FF',
      header: '#1E3A8A',
      shadow: 'rgba(96, 165, 250, 0.2)',
    }
  },

  rose: {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Elegant rose and pink tones',
    light: {
      primary: '#E11D48',
      primaryHover: '#BE123C',
      secondary: '#F43F5E',
      accent: '#FB7185',
      background: '#FFFFFF',
      surface: '#FFF1F2',
      surfaceHover: '#FFE4E6',
      text: '#881337',
      textSecondary: '#9F1239',
      border: '#FECDD3',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#E11D48',
      sidebar: '#BE123C',
      sidebarText: '#FFF1F2',
      header: '#FFFFFF',
      shadow: 'rgba(225, 29, 72, 0.15)',
    },
    dark: {
      primary: '#FB7185',
      primaryHover: '#F43F5E',
      secondary: '#FDA4AF',
      accent: '#FECDD3',
      background: '#1F0A14',
      surface: '#881337',
      surfaceHover: '#9F1239',
      text: '#FFF1F2',
      textSecondary: '#FDA4AF',
      border: '#9F1239',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#FB7185',
      sidebar: '#1F0A14',
      sidebarText: '#FFF1F2',
      header: '#881337',
      shadow: 'rgba(251, 113, 133, 0.2)',
    }
  },

  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white',
    light: {
      primary: '#000000',
      primaryHover: '#1F2937',
      secondary: '#4B5563',
      accent: '#6B7280',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceHover: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      sidebar: '#1F2937',
      sidebarText: '#F9FAFB',
      header: '#FFFFFF',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: '#FFFFFF',
      primaryHover: '#F3F4F6',
      secondary: '#D1D5DB',
      accent: '#9CA3AF',
      background: '#000000',
      surface: '#1F2937',
      surfaceHover: '#374151',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      sidebar: '#000000',
      sidebarText: '#F9FAFB',
      header: '#1F2937',
      shadow: 'rgba(255, 255, 255, 0.1)',
    }
  }
};

// Create Context
const AdvancedThemeContext = createContext();

export function AdvancedThemeProvider({ children }) {
  // State
  const [currentThemeId, setCurrentThemeId] = useState('corporate');
  const [mode, setMode] = useState('light'); // 'light' or 'dark'
  const [customTheme, setCustomTheme] = useState(null);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedThemeId = localStorage.getItem('themeId');
    const savedMode = localStorage.getItem('themeMode');
    const savedCustomTheme = localStorage.getItem('customTheme');

    if (savedThemeId) setCurrentThemeId(savedThemeId);
    if (savedMode) setMode(savedMode);
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme));
      } catch (e) {
        console.error('Failed to parse custom theme');
      }
    }
  }, []);

  // Get current theme colors
  const getCurrentTheme = () => {
    if (customTheme) {
      return customTheme[mode];
    }
    return THEMES[currentThemeId][mode];
  };

  // Apply theme to CSS variables
  useEffect(() => {
    const getTheme = () => {
      if (customTheme) {
        return customTheme[mode];
      }
      return THEMES[currentThemeId][mode];
    };
    
    const theme = getTheme();
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Add transition class
    if (transitionEnabled) {
      root.classList.add('theme-transition');
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme.primary;
      document.head.appendChild(meta);
    }
  }, [currentThemeId, mode, customTheme, transitionEnabled]);

  // Change theme
  const changeTheme = (themeId) => {
    setCurrentThemeId(themeId);
    setCustomTheme(null);
    localStorage.setItem('themeId', themeId);
    localStorage.removeItem('customTheme');
  };

  // Toggle mode
  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Set mode directly
  const setThemeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Apply custom theme
  const applyCustomTheme = (theme) => {
    setCustomTheme(theme);
    localStorage.setItem('customTheme', JSON.stringify(theme));
  };

  // Reset to default theme
  const resetTheme = () => {
    setCurrentThemeId('corporate');
    setMode('light');
    setCustomTheme(null);
    localStorage.removeItem('themeId');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('customTheme');
  };

  // Get theme info
  const getThemeInfo = () => {
    if (customTheme) {
      return {
        id: 'custom',
        name: 'Custom Theme',
        description: 'User-defined custom theme'
      };
    }
    const theme = THEMES[currentThemeId];
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description
    };
  };

  // Context value
  const value = {
    // Current state
    currentThemeId,
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    customTheme,
    currentTheme: getCurrentTheme(),
    themeInfo: getThemeInfo(),
    
    // Available themes
    themes: THEMES,
    themesList: Object.values(THEMES),
    
    // Actions
    changeTheme,
    toggleMode,
    setThemeMode,
    applyCustomTheme,
    resetTheme,
    setTransitionEnabled,
    
    // Utilities
    getThemeById: (id) => THEMES[id],
    isCurrentTheme: (id) => currentThemeId === id && !customTheme,
  };

  return (
    <AdvancedThemeContext.Provider value={value}>
      {children}
    </AdvancedThemeContext.Provider>
  );
}

// Custom hook
export function useAdvancedTheme() {
  const context = useContext(AdvancedThemeContext);
  if (!context) {
    throw new Error('useAdvancedTheme must be used within AdvancedThemeProvider');
  }
  return context;
}

// Export default
export default AdvancedThemeContext;
