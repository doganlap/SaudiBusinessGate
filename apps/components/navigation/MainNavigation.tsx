'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import {
  IconHome,
  IconDollar,
  IconTrendingUp,
  IconUsers,
  IconUserCheck,
  IconPackage,
  IconCreditCard,
  IconSettings,
  IconChevronDown,
  IconMenu,
  IconClose,
  IconBuilding,
  IconBarChart,
  IconFileText,
  IconWorkflow,
  IconZap,
  IconShield,
  IconLoader,
  IconAlert,
  IconSaudiFlag
} from '@/components/ui/IconSystem';

interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: string;
}

export default function MainNavigation() {
  const params = useParams();
  const pathname = usePathname();
  const lng = params?.lng as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Use the navigation hook for API-driven navigation
  const { 
    navigation, 
    flatNavigation, 
    userMenu, 
    quickActions, 
    metadata, 
    isLoading, 
    error,
    refetch 
  } = useNavigation();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button className="p-2 bg-white rounded-lg shadow-md text-gray-600">
            <IconMenu size="md" />
          </button>
        </div>

        {/* Loading sidebar */}
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg lg:static lg:shadow-none lg:border-r lg:border-gray-200">
          <div className="flex flex-col h-full">
            {/* Header skeleton */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* Navigation skeleton */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
                </div>
              ))}
            </nav>

            {/* User info skeleton */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content spacer */}
        <div className="hidden lg:block w-64 flex-shrink-0" />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button className="p-2 bg-white rounded-lg shadow-md text-gray-600">
            <IconMenu size="md" />
          </button>
        </div>

        {/* Error sidebar */}
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg lg:static lg:shadow-none lg:border-r lg:border-gray-200">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-900">DoganHub</h1>
                <p className="text-sm text-gray-500">Navigation Error</p>
              </div>
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
            {user && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content spacer */}
        <div className="hidden lg:block w-64 flex-shrink-0" />
      </>
    );
  }

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname?.startsWith(href) || false;
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
        'workflow': <IconWorkflow size="sm" />,
        'grc': <IconShield size="sm" />,
        'platform': <IconBuilding size="md" />,
        'users': <IconUsers size="sm" />,
        'tenants': <IconBuilding size="sm" />,
        'settings': <IconSettings size="sm" />,
        'services': <IconZap size="md" />,
        'products': <IconPackage size="md" />,
      };
      
      return iconMap[id] || <IconHome size="md" />;
    };

    return {
      id: item.id,
      title: item.label || item.title,
      href: item.path || item.href,
      icon: getIcon(item.id, item.category),
      description: item.description,
      children: item.children ? item.children.map(mapNavigationItem) : undefined
    };
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <IconChevronDown 
              size="sm"
              className={`transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          active
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {item.icon}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-gray-900"
        >
          {isOpen ? <IconClose size="md" /> : <IconMenu size="md" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">DoganHub</h1>
              <p className="text-sm text-gray-500">
                {metadata?.tenantId || user?.tenantId || 'Platform'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map(item => renderNavigationItem(mapNavigationItem(item)))}
          </nav>

          {/* User menu */}
          {userMenu.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="space-y-1">
                {userMenu.map(item => (
                  <Link
                    key={item.id}
                    href={item.path || item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {item.icon || <IconSettings size="sm" />}
                    <span>{item.label || item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User info */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
