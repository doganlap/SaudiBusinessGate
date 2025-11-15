/**
 * Advanced Centralized Theme System
 * Enterprise-level theme configuration with glassmorphism support
 */

export type ThemeMode = 'light' | 'dark' | 'auto';
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  hover: string;
  active: string;
}

export interface GlassmorphismConfig {
  background: string;
  blur: string;
  border: string;
  shadow: string;
  ring: string;
  hover?: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  glassmorphism: {
    subtle: GlassmorphismConfig;
    medium: GlassmorphismConfig;
    strong: GlassmorphismConfig;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Light Theme Configuration (Default)
export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#10b981', // emerald-500
    secondary: '#06b6d4', // cyan-500
    accent: '#8b5cf6', // violet-500
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#f9fafb', // gray-50
    surface: '#ffffff',
    text: {
      primary: '#111827', // gray-900
      secondary: '#6b7280', // gray-500
      disabled: '#9ca3af', // gray-400
    },
    border: 'rgba(229, 231, 235, 0.8)', // gray-200 with opacity
    hover: 'rgba(243, 244, 246, 0.8)', // gray-100 with opacity
    active: 'rgba(229, 231, 235, 1)', // gray-200
  },
  glassmorphism: {
    subtle: {
      background: 'rgba(255, 255, 255, 0.7)',
      blur: 'blur-md',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      ring: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.85)',
    },
    medium: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
      blur: 'blur-xl',
      border: 'rgba(255, 255, 255, 0.25)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      ring: 'rgba(255, 255, 255, 0.25)',
      hover: 'rgba(255, 255, 255, 0.2)',
    },
    strong: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
      blur: 'blur-2xl',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
      ring: 'rgba(255, 255, 255, 0.3)',
      hover: 'rgba(255, 255, 255, 0.25)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Dark Theme Configuration
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#0a0a0a', // Almost black
    surface: '#171717', // gray-900
    text: {
      primary: '#f9fafb', // gray-50
      secondary: '#9ca3af', // gray-400
      disabled: '#6b7280', // gray-500
    },
    border: 'rgba(55, 65, 81, 0.5)', // gray-700 with opacity
    hover: 'rgba(31, 41, 55, 0.8)', // gray-800 with opacity
    active: 'rgba(55, 65, 81, 1)', // gray-700
  },
  glassmorphism: {
    subtle: {
      background: 'rgba(23, 23, 23, 0.6)',
      blur: 'blur-md',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      ring: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(23, 23, 23, 0.75)',
    },
    medium: {
      background: 'linear-gradient(135deg, rgba(38, 38, 38, 0.5) 0%, rgba(23, 23, 23, 0.4) 100%)',
      blur: 'blur-xl',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      ring: 'rgba(255, 255, 255, 0.15)',
      hover: 'rgba(38, 38, 38, 0.6)',
    },
    strong: {
      background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.5) 0%, rgba(31, 41, 55, 0.3) 100%)',
      blur: 'blur-2xl',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
      ring: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(55, 65, 81, 0.6)',
    },
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  transitions: lightTheme.transitions,
};

// Theme utility functions
export const getTheme = (mode: ThemeMode): ThemeConfig => {
  if (mode === 'auto') {
    // Check system preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : lightTheme;
    }
    return lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const getGlassmorphismClasses = (
  intensity: GlassIntensity = 'medium',
  theme: ThemeConfig = lightTheme
) => {
  const glass = theme.glassmorphism[intensity];
  return {
    base: `backdrop-${glass.blur} border rounded-xl`,
    background: glass.background,
    border: glass.border,
    shadow: glass.shadow,
    ring: glass.ring,
    hover: glass.hover,
  };
};

// CSS-in-JS glassmorphism generator
export const generateGlassmorphismStyles = (
  intensity: GlassIntensity = 'medium',
  theme: ThemeConfig = lightTheme
) => {
  const glass = theme.glassmorphism[intensity];
  return {
    background: glass.background,
    backdropFilter: glass.blur.replace('blur-', 'blur(').replace('md', '12px)').replace('xl', '24px)').replace('2xl', '40px)'),
    border: `1px solid ${glass.border}`,
    boxShadow: glass.shadow,
    borderRadius: theme.borderRadius.xl,
  };
};

// Export default theme (light glassmorphism)
export const defaultTheme = lightTheme;
