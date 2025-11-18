import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  width?: 'narrow' | 'normal' | 'wide';
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  position?: 'left' | 'right';
}

interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  collapsible?: boolean;
}

interface SidebarItemProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  badge?: ReactNode;
}

export function Sidebar({ 
  children, 
  className,
  width = 'normal',
  collapsible = false,
  collapsed = false,
  onCollapse,
  position = 'left'
}: SidebarProps) {
  const widthClasses = {
    narrow: 'w-48',
    normal: 'w-64',
    wide: 'w-80'
  };

  const positionClasses = position === 'left' ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300",
        widthClasses[width],
        positionClasses,
        collapsed && 'w-16',
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("p-4 border-b border-gray-200 dark:border-gray-700", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      {children}
    </div>
  );
}

export function SidebarSection({ 
  children, 
  className, 
  title,
  collapsible = false
}: SidebarSectionProps) {
  return (
    <div className={cn("mb-4", className)}>
      {title && (
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function SidebarItem({ 
  children, 
  className, 
  active = false,
  href,
  onClick,
  icon,
  badge
}: SidebarItemProps) {
  const baseClasses = cn(
    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 cursor-pointer",
    active 
      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    className
  );

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {badge && <span className="flex-shrink-0">{badge}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {content}
    </div>
  );
}

export function SidebarFooter({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("p-4 border-t border-gray-200 dark:border-gray-700", className)}>
      {children}
    </div>
  );
}

export default Sidebar;
