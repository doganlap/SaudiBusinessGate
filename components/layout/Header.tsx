import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  children?: ReactNode;
  className?: string;
  leftSection?: ReactNode;
  centerSection?: ReactNode;
  rightSection?: ReactNode;
  sticky?: boolean;
  border?: boolean;
  shadow?: boolean;
}

export function Header({ 
  children,
  className,
  leftSection,
  centerSection,
  rightSection,
  sticky = true,
  border = true,
  shadow = true
}: HeaderProps) {
  return (
    <header 
      className={cn(
        "bg-white dark:bg-gray-900 transition-colors duration-200",
        sticky && "sticky top-0 z-50",
        border && "border-b border-gray-200 dark:border-gray-700",
        shadow && "shadow-sm",
        className
      )}
    >
      {children ? (
        <div className="px-4 py-3">
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center flex-1">
            {leftSection}
          </div>
          
          {centerSection && (
            <div className="flex items-center justify-center flex-1">
              {centerSection}
            </div>
          )}
          
          <div className="flex items-center justify-end flex-1">
            {rightSection}
          </div>
        </div>
      )}
    </header>
  );
}

export function HeaderSection({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function HeaderTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <h1 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>
      {children}
    </h1>
  );
}

export function HeaderActions({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

export default Header;
