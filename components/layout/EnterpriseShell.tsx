'use client';

import React from 'react';
import { PlatformNavigation } from '@/apps/components/navigation/PlatformNavigation';

interface EnterpriseShellProps {
  children: React.ReactNode;
}

export default function EnterpriseShell({ children }: EnterpriseShellProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <PlatformNavigation />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
