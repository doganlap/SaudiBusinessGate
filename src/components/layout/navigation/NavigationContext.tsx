'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface NavigationState {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isIntelligentNavOpen: boolean;
  activeModule: string;
  recentModules: string[];
  favorites: string[];
  userPreferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    autoCollapse: boolean;
    showTooltips: boolean;
  };
  navigationHistory: string[];
  currentPath: string;
}

interface NavigationAction {
  type: string;
  payload?: any;
}

type NavigationContextType = {
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleIntelligentNav: () => void;
  setActiveModule: (module: string) => void;
  addToRecentModules: (module: string) => void;
  toggleFavorite: (path: string) => void;
  updateUserPreference: (key: string, value: any) => void;
  addToNavigationHistory: (path: string) => void;
  clearNavigationHistory: () => void;
};

const initialState: NavigationState = {
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  isIntelligentNavOpen: false,
  activeModule: 'dashboard',
  recentModules: [],
  favorites: [],
  userPreferences: {
    theme: 'system',
    language: 'en',
    notifications: true,
    autoCollapse: false,
    showTooltips: true,
  },
  navigationHistory: [],
  currentPath: '/',
};

// Load state from localStorage
const loadNavigationState = (): NavigationState => {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const savedState = localStorage.getItem('navigationState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return { ...initialState, ...parsed };
    }
  } catch (error) {
    console.error('Error loading navigation state:', error);
  }
  
  return initialState;
};

// Save state to localStorage
const saveNavigationState = (state: NavigationState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('navigationState', JSON.stringify({
      isSidebarCollapsed: state.isSidebarCollapsed,
      userPreferences: state.userPreferences,
      favorites: state.favorites,
      recentModules: state.recentModules,
      navigationHistory: state.navigationHistory,
    }));
  } catch (error) {
    console.error('Error saving navigation state:', error);
  }
};

const navigationReducer = (state: NavigationState, action: NavigationAction): NavigationState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isSidebarCollapsed: !state.isSidebarCollapsed,
      };
    
    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        isMobileMenuOpen: !state.isMobileMenuOpen,
      };
    
    case 'TOGGLE_INTELLIGENT_NAV':
      return {
        ...state,
        isIntelligentNavOpen: !state.isIntelligentNavOpen,
      };
    
    case 'SET_ACTIVE_MODULE':
      return {
        ...state,
        activeModule: action.payload,
      };
    
    case 'ADD_TO_RECENT_MODULES':
      const recentModules = [action.payload, ...state.recentModules.filter(m => m !== action.payload)];
      return {
        ...state,
        recentModules: recentModules.slice(0, 5), // Keep only 5 most recent
      };
    
    case 'TOGGLE_FAVORITE':
      const favorites = state.favorites.includes(action.payload)
        ? state.favorites.filter(f => f !== action.payload)
        : [...state.favorites, action.payload];
      return {
        ...state,
        favorites,
      };
    
    case 'UPDATE_USER_PREFERENCE':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'ADD_TO_NAVIGATION_HISTORY':
      const history = [action.payload, ...state.navigationHistory.filter(h => h !== action.payload)];
      return {
        ...state,
        navigationHistory: history.slice(0, 20), // Keep only 20 most recent
        currentPath: action.payload,
      };
    
    case 'CLEAR_NAVIGATION_HISTORY':
      return {
        ...state,
        navigationHistory: [],
      };
    
    case 'SET_CURRENT_PATH':
      return {
        ...state,
        currentPath: action.payload,
      };
    
    case 'RESET_NAVIGATION':
      return {
        ...initialState,
        userPreferences: state.userPreferences,
      };
    
    default:
      return state;
  }
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState, loadNavigationState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveNavigationState(state);
  }, [state]);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !state.isSidebarCollapsed) {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const toggleMobileMenu = () => {
    dispatch({ type: 'TOGGLE_MOBILE_MENU' });
  };

  const toggleIntelligentNav = () => {
    dispatch({ type: 'TOGGLE_INTELLIGENT_NAV' });
  };

  const setActiveModule = (module: string) => {
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: module });
    dispatch({ type: 'ADD_TO_RECENT_MODULES', payload: module });
  };

  const addToRecentModules = (module: string) => {
    dispatch({ type: 'ADD_TO_RECENT_MODULES', payload: module });
  };

  const toggleFavorite = (path: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: path });
  };

  const updateUserPreference = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_USER_PREFERENCE', payload: { key, value } });
  };

  const addToNavigationHistory = (path: string) => {
    dispatch({ type: 'ADD_TO_NAVIGATION_HISTORY', payload: path });
  };

  const clearNavigationHistory = () => {
    dispatch({ type: 'CLEAR_NAVIGATION_HISTORY' });
  };

  const value: NavigationContextType = {
    state,
    dispatch,
    toggleSidebar,
    toggleMobileMenu,
    toggleIntelligentNav,
    setActiveModule,
    addToRecentModules,
    toggleFavorite,
    updateUserPreference,
    addToNavigationHistory,
    clearNavigationHistory,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Custom hook for navigation history tracking
export function useNavigationTracker() {
  const { addToNavigationHistory, state } = useNavigation();
  
  const trackNavigation = (path: string) => {
    addToNavigationHistory(path);
  };
  
  const getNavigationHistory = () => state.navigationHistory;
  
  const getRecentModules = () => state.recentModules;
  
  const getFavorites = () => state.favorites;
  
  return {
    trackNavigation,
    getNavigationHistory,
    getRecentModules,
    getFavorites,
    currentPath: state.currentPath,
  };
}

// Custom hook for user preferences
export function useUserPreferences() {
  const { state, updateUserPreference } = useNavigation();
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateUserPreference('theme', theme);
  };
  
  const setLanguage = (language: string) => {
    updateUserPreference('language', language);
  };
  
  const setNotifications = (enabled: boolean) => {
    updateUserPreference('notifications', enabled);
  };
  
  const setAutoCollapse = (enabled: boolean) => {
    updateUserPreference('autoCollapse', enabled);
  };
  
  const setShowTooltips = (enabled: boolean) => {
    updateUserPreference('showTooltips', enabled);
  };
  
  return {
    preferences: state.userPreferences,
    setTheme,
    setLanguage,
    setNotifications,
    setAutoCollapse,
    setShowTooltips,
  };
}