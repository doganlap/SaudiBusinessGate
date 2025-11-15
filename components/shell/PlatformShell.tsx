import { ReactNode } from 'react';
import { PlatformNavigation } from '@/components/navigation/PlatformNavigation';

interface PlatformShellProps {
  children: ReactNode;
}

export function PlatformShell({ children }: PlatformShellProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <PlatformNavigation />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}