import { createContext, useContext, useState, ReactNode } from 'react';
import { LayoutConfig, AppShellContextValue } from '@/components/layout/types';

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

export function AppShellProvider({ 
  children, 
  initialConfig = { type: 'standard' } 
}: { 
  children: ReactNode;
  initialConfig?: LayoutConfig;
}) {
  const [layout, setLayout] = useState<LayoutConfig>(initialConfig);
  const [isLoading, setLoading] = useState(false);

  const contextValue: AppShellContextValue = {
    layout,
    setLayout,
    isLoading,
    setLoading
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (context === undefined) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }
  return context;
}

export function useLayout() {
  const { layout, setLayout } = useAppShell();
  return { layout, setLayout };
}

export function useLoading() {
  const { isLoading, setLoading } = useAppShell();
  return { isLoading, setLoading };
}

export default AppShellContext;