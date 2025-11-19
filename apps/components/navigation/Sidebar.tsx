'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import {
  IconHome,
  IconBuilding,
  IconUsers,
  IconTrendingUp,
  IconDollar,
  IconZap,
  IconSettings,
  IconBarChart,
  IconFileText,
  IconCalendar,
  IconShield,
  IconMenu,
  IconClose,
  IconChevronRight,
  IconChevronDown,
  IconChevronLeft,
  IconLoader,
  IconAlert,
  IconPackage,
  IconCreditCard,
  IconUserCheck
} from '@/components/ui/IconSystem';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
  badge?: number;
  isNew?: boolean;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  
  // Use the navigation hook for API-driven navigation
  const { 
    navigation, 
    userMenu, 
    isLoading, 
    error,
    refetch 
  } = useNavigation();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/') || false;
  };

  // Map API navigation items to component format with icons
  const mapNavigationItem = (item: any): NavigationItem => {
    // Icon mapping based on item id or category
    const getIcon = (id: string, category?: string) => {
      const iconMap: { [key: string]: React.ReactNode } = {
        'dashboard': <IconHome size="md" />,
        'finance': <IconDollar size="sm" />,
        'sales': <IconTrendingUp size="sm" />,
        'crm': <IconUsers size="sm" />,
        'hr': <IconUserCheck size="sm" />,
        'procurement': <IconPackage size="sm" />,
        'billing': <IconCreditCard size="sm" />,
        'analytics': <IconBarChart size="sm" />,
        'reporting': <IconFileText size="sm" />,
        'workflow': <IconFileText size="sm" />,
        'grc': <IconShield size="sm" />,
        'platform': <IconBuilding size="md" />,
        'users': <IconUsers size="sm" />,
        'tenants': <IconBuilding size="sm" />,
        'settings': <IconSettings size="sm" />,
        'services': <IconZap size="md" />,
        'products': <IconPackage size="md" />,
        'ai': <IconZap size="sm" />,
        'admin': <IconShield size="sm" />,
      };
      
      return iconMap[id] || <IconHome size="md" />;
    };

    return {
      id: item.id,
      name: item.label || item.title,
      href: item.path || item.href,
      icon: getIcon(item.id, item.category),
      description: item.description,
      children: item.children ? item.children.map(mapNavigationItem) : undefined,
      badge: item.badge,
      isNew: item.isNew
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
        >
          <IconMenu size="md" />
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Loading Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header skeleton */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!isCollapsed && (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              )}
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isCollapsed 
                  ? (isRTL ? <IconChevronLeft size="sm" /> : <IconChevronRight size="sm" />)
                  : (isRTL ? <IconChevronRight size="sm" /> : <IconChevronLeft size="sm" />)
                }
              </button>
            </div>

            {/* Navigation skeleton */}
            <nav className="flex-1 p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
                </div>
              ))}
            </nav>

            {/* User info skeleton */}
            <div className="p-4 border-t border-gray-200">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
        >
          <IconMenu size="md" />
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Error Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DH</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">DoganHub</h2>
                    <p className="text-xs text-gray-500">Navigation Error</p>
                  </div>
                </div>
              )}
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isCollapsed 
                  ? (isRTL ? <IconChevronLeft size="sm" /> : <IconChevronRight size="sm" />)
                  : (isRTL ? <IconChevronRight size="sm" /> : <IconChevronLeft size="sm" />)
                }
              </button>
            </div>

            {/* Error message */}
            <div className="flex-1 px-4 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <IconAlert size="md" />
                  <span className="font-medium">Navigation Error</span>
                </div>
                <p className="text-red-600 text-sm mt-2">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-3 flex items-center space-x-2 text-sm text-red-600 hover:text-red-800"
                >
                  <IconLoader size="sm" />
                  <span>Retry</span>
                </button>
              </div>
            </div>

            {/* User info */}
            <div className="p-4 border-t border-gray-200">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Unknown User</p>
                    <p className="text-xs text-gray-500 truncate">Connection failed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const NavigationItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    return (
      <div className={`w-full ${level > 0 ? 'ml-4' : ''}`}>
        <Link
          href={item.href}
          className={`
            flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors
            ${active 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${isCollapsed && level === 0 ? 'justify-center' : 'justify-between'}
          `}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.name);
            }
            if (isMobileOpen) {
              setIsMobileOpen(false);
            }
          }}
        >
          <div className={`flex items-center ${isCollapsed && level === 0 ? '' : 'flex-1'}`}>
            {item.icon}
            {!isCollapsed && (
              <span className="flex-1">{item.name}</span>
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <IconChevronDown size="sm" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
          {!isCollapsed && item.isNew && (
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
              New
            </span>
          )}
          {!isCollapsed && item.badge && item.badge > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavigationItem key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DH</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">DoganHub</h2>
              <p className="text-xs text-gray-500">Enterprise Platform</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <IconChevronRight size="sm" /> : <IconChevronLeft size="sm" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavigationItem key={item.id} item={mapNavigationItem(item)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {/* User menu */}
        {userMenu.length > 0 && !isCollapsed && (
          <div className="mb-4 space-y-1">
            {userMenu.map(item => (
              <Link
                key={item.id}
                href={item.path || item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <span>{item.label || item.title}</span>
              </Link>
            ))}
          </div>
        )}
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
              <p className="text-xs text-gray-500 truncate">user@company.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
      >
        <IconMenu size="md" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}
