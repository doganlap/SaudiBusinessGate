import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentAreaProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  background?: 'transparent' | 'white' | 'gray' | 'dark';
  scrollable?: boolean;
}

interface ContentHeaderProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  bordered?: boolean;
  padded?: boolean;
}

export function ContentArea({ 
  children, 
  className,
  padding = 'medium',
  background = 'transparent',
  scrollable = true
}: ContentAreaProps) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const backgroundClasses = {
    transparent: '',
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800',
    dark: 'bg-gray-900 dark:bg-black'
  };

  const scrollClasses = scrollable ? 'overflow-auto' : '';

  return (
    <main 
      className={cn(
        "flex-1",
        paddingClasses[padding],
        backgroundClasses[background],
        scrollClasses,
        className
      )}
    >
      {children}
    </main>
  );
}

export function ContentHeader({ 
  children, 
  className,
  title,
  subtitle,
  actions
}: ContentHeaderProps) {
  if (children) {
    return (
      <div className={cn("mb-6", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        {title && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function ContentSection({ 
  children, 
  className,
  title,
  subtitle,
  actions,
  bordered = false,
  padded = true
}: ContentSectionProps) {
  return (
    <div 
      className={cn(
        "mb-6",
        bordered && "border border-gray-200 dark:border-gray-700 rounded-lg",
        padded && "p-6",
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function ContentGrid({ 
  children, 
  className,
  cols = 1,
  gap = 6
}: { 
  children: ReactNode; 
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 2 | 4 | 6 | 8;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={cn(
      "grid",
      gridClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

export default ContentArea;