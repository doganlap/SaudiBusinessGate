'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  ThemeMode,
  GlassIntensity,
  ThemeConfig,
  getTheme,
  defaultTheme,
} from './theme-config';

interface ThemeContextType {
  theme: ThemeConfig;
  mode: ThemeMode;
  glassIntensity: GlassIntensity;
  setMode: (mode: ThemeMode) => void;
  setGlassIntensity: (intensity: GlassIntensity) => void;
  toggleMode: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultGlassIntensity?: GlassIntensity;
}

export function AdvancedThemeProvider({
  children,
  defaultMode = 'light', // Light is default
  defaultGlassIntensity = 'medium',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [glassIntensity, setGlassIntensityState] = useState<GlassIntensity>(defaultGlassIntensity);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      const savedIntensity = localStorage.getItem('glass-intensity') as GlassIntensity;

      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setModeState(savedMode);
      }

      if (savedIntensity && ['subtle', 'medium', 'strong'].includes(savedIntensity)) {
        setGlassIntensityState(savedIntensity);
      }
    }
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    const newTheme = getTheme(mode);
    setTheme(newTheme);

    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const isDark = newTheme.mode === 'dark';

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Set CSS variables
      root.style.setProperty('--color-primary', newTheme.colors.primary);
      root.style.setProperty('--color-secondary', newTheme.colors.secondary);
      root.style.setProperty('--color-accent', newTheme.colors.accent);
      root.style.setProperty('--color-background', newTheme.colors.background);
      root.style.setProperty('--color-surface', newTheme.colors.surface);
      root.style.setProperty('--color-text-primary', newTheme.colors.text.primary);
      root.style.setProperty('--color-text-secondary', newTheme.colors.text.secondary);
      root.style.setProperty('--color-border', newTheme.colors.border);

      // Save to localStorage
      localStorage.setItem('theme-mode', mode);
    }
  }, [mode]);

  // Save glass intensity to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('glass-intensity', glassIntensity);
    }
  }, [glassIntensity]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setGlassIntensity = (intensity: GlassIntensity) => {
    setGlassIntensityState(intensity);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextType = {
    theme,
    mode,
    glassIntensity,
    setMode,
    setGlassIntensity,
    toggleMode,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AdvancedThemeProvider');
  }
  return context;
}

// Utility hook for glassmorphism classes
export function useGlassmorphism(intensity?: GlassIntensity) {
  const { theme, glassIntensity: contextIntensity } = useTheme();
  const finalIntensity = intensity || contextIntensity;
  const glass = theme.glassmorphism[finalIntensity];

  return {
    className: `backdrop-blur-${glass.blur.split('-')[1]} border rounded-xl`,
    style: {
      background: glass.background,
      borderColor: glass.border,
      boxShadow: glass.shadow,
    },
    intensity: finalIntensity,
  };
}
