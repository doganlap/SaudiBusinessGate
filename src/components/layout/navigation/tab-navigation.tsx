'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabNavigationProps {
  tabs: Tab[];
  variant?: 'default' | 'pills' | 'underline';
}

export default function TabNavigation({ tabs, variant = 'default' }: TabNavigationProps) {
  const pathname = usePathname();

  const getTabStyles = (isActive: boolean) => {
    const baseStyles = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors';

    if (variant === 'pills') {
      return `${baseStyles} rounded-full ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`;
    }

    if (variant === 'underline') {
      return `${baseStyles} border-b-2 ${
        isActive
          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`;
    }

    // default variant
    return `${baseStyles} rounded-md ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
    }`;
  };

  return (
    <nav className="flex flex-wrap gap-1" aria-label="Tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={getTabStyles(isActive)}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`
                  px-2 py-0.5 text-xs font-semibold rounded-full
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
