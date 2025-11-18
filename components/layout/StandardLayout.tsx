'use client';

import { ReactNode } from 'react';
import { AppShell } from '@/src/components/layout/shell/AppShell';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContentArea } from '@/components/layout/ContentArea';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface StandardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  layout?: 'sidebar' | 'dashboard' | 'minimal';
}

export function StandardLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  layout = 'sidebar'
}: StandardLayoutProps) {
  const renderHeader = () => {
    if (!title && !actions && !showSearch && !showNotifications && !showUserMenu) {
      return null;
    }

    return (
      <Header>
        <div className="flex items-center gap-4 flex-1">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-gray-900 dark:hover:text-gray-100">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4 flex-1 justify-center">
          {/* Title */}
          {title && (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Actions */}
          {actions}

          {/* Quick Actions */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          )}

          {/* User Menu */}
          {showUserMenu && (
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          )}

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </Header>
    );
  };

  return (
    <AppShell 
      layout={layout}
      header={renderHeader()}
      showNavigation={layout !== 'minimal'}
    >
      {children}
    </AppShell>
  );
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  ...props
}: StandardLayoutProps) {
  return (
    <StandardLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      layout="dashboard"
      {...props}
    >
      {children}
    </StandardLayout>
  );
}

export function MinimalLayout({
  children,
  title,
  subtitle,
  actions,
  ...props
}: StandardLayoutProps) {
  return (
    <StandardLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      layout="minimal"
      showSearch={false}
      showNotifications={false}
      showUserMenu={false}
      {...props}
    >
      {children}
    </StandardLayout>
  );
}

export default StandardLayout;