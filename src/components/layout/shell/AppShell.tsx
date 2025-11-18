'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PlatformNavigation } from '../navigation/PlatformNavigation';
import { Header } from '@/components/layout/Header';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Settings,
  User,
  LogOut,
  Globe
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface AppShellProps {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  layout?: 'sidebar' | 'topbar' | 'minimal' | 'dashboard' | 'fullscreen';
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppShell({ 
  children, 
  className,
  sidebar,
  header,
  footer,
  showNavigation = true,
  showHeader = true,
  showBreadcrumbs = true,
  showSearch = true,
  showNotifications = true,
  layout = 'sidebar',
  breadcrumbs,
  title,
  subtitle,
  actions
}: AppShellProps) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Load notifications
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // Mock notifications - replace with real API call
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        title: 'New User Registration',
        message: 'A new user has registered for your platform',
        type: 'info',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of $299 received for subscription',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) return breadcrumbs;
    
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (segment !== 'en' && segment !== 'ar') {
        items.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: index === pathSegments.length - 1 ? undefined : currentPath
        });
      }
    });
    
    return items;
  };

  const renderEnhancedHeader = () => (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Title and subtitle */}
          <div>
            {title && <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <button 
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 relative"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Actions */}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </div>

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav className="flex items-center space-x-2 mt-3 text-sm">
          {generateBreadcrumbs().map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
              {item.href ? (
                <a href={item.href} className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'fullscreen':
        return (
          <div className="min-h-screen">
            <main className={cn("h-screen", className)}>
              {children}
            </main>
          </div>
        );

      case 'topbar':
        return (
          <div className="min-h-screen flex flex-col">
            {showHeader && (header || renderEnhancedHeader())}
            <div className="flex-1 flex">
              {showNavigation && (
                <div className={cn("transition-all duration-300", isMobileMenuOpen ? "block" : "hidden md:block")}>
                  <PlatformNavigation />
                </div>
              )}
              <main className={cn("flex-1 p-6", className)}>
                {children}
              </main>
            </div>
            {footer && <footer>{footer}</footer>}
          </div>
        );
      
      case 'minimal':
        return (
          <div className="min-h-screen flex flex-col">
            {showHeader && (header || renderEnhancedHeader())}
            <main className={cn("flex-1", className)}>
              {children}
            </main>
            {footer && <footer>{footer}</footer>}
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen flex">
            {showNavigation && (
              <div className={cn("transition-all duration-300", isMobileMenuOpen ? "block" : "hidden md:block")}>
                <PlatformNavigation />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              {showHeader && (header || renderEnhancedHeader())}
              <main className={cn("flex-1 p-6 bg-gray-50 dark:bg-gray-900", className)}>
                {children}
              </main>
              {footer && <footer className="bg-white dark:bg-gray-800 border-t">{footer}</footer>}
            </div>
          </div>
        );
      
      case 'sidebar':
      default:
        return (
          <div className="min-h-screen flex">
            {showNavigation && (
              <div className={cn("transition-all duration-300", isMobileMenuOpen ? "block" : "hidden md:block")}>
                {sidebar || <PlatformNavigation />}
              </div>
            )}
            <div className="flex-1 flex flex-col">
              {showHeader && (header || renderEnhancedHeader())}
              <main className={cn("flex-1 overflow-auto", className)}>
                {children}
              </main>
              {footer && <footer>{footer}</footer>}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "min-h-screen bg-background text-foreground",
        isMounted && theme === 'dark' ? 'dark' : '',
        className
      )}
      data-theme={isMounted ? theme : 'light'}
    >
      {renderLayout()}
    </div>
  );
}

export default AppShell;