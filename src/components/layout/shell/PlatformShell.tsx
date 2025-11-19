import { ReactNode, useEffect, useState } from 'react';
import { PlatformNavigation } from '../navigation/PlatformNavigation';

interface PlatformShellProps {
  children: ReactNode;
}

// Comprehensive client-only wrapper to prevent hydration mismatches
const ClientOnly: React.FC<{ 
  children: ReactNode; 
  fallback?: ReactNode;
  className?: string;
}> = ({ 
  children, 
  fallback = null,
  className = ''
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? (
      <div className={className}>
        {fallback}
      </div>
    ) : null;
  }

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
};

export function PlatformShell({ children }: PlatformShellProps) {
  return (
    <ClientOnly
      className="flex flex-1 bg-gray-100 dark:bg-gray-900"
      fallback={
        <div className="flex flex-1 bg-gray-100 dark:bg-gray-900">
          <div className="w-72 bg-white dark:bg-neutral-950/70 border-neutral-200 dark:border-neutral-800/50 border-r flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading navigation...</p>
            </div>
          </div>
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ClientOnly fallback={<div className="w-72 bg-gray-200 animate-pulse" />}>
        <PlatformNavigation />
      </ClientOnly>
      <main className="flex-1 p-6">
        {children}
      </main>
    </ClientOnly>
  );
}