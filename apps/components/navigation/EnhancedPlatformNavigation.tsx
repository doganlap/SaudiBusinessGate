'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronDown, Menu, X, Building, Home, TrendingUp, Users, 
  UserCheck, Package, BarChart3, CreditCard, Settings, 
  Database, Sparkles, Globe, Shield, Bell
} from 'lucide-react';
import { navigationRoutes, getAllRoutes, type NavigationRoute } from '@/lib/navigation/routes';

interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: string;
}

// Arabic translations for navigation items
const translations = {
  ar: {
    'Dashboard': 'لوحة التحكم',
    'Finance': 'المالية',
    'Sales': 'المبيعات',
    'CRM': 'إدارة العملاء',
    'HR': 'الموارد البشرية',
    'Procurement': 'المشتريات',
    'Analytics': 'التحليلات',
    'Billing': 'الفوترة',
    'Platform Admin': 'إدارة المنصة',
    'API Testing': 'اختبار واجهات البرمجة',
    'Products': 'المنتجات',
    'Services': 'الخدمات',
    'Administration': 'الإدارة',
    'Welcome': 'مرحباً',
    'Online': 'متصل',
    'Offline': 'غير متصل'
  },
  en: {
    'Dashboard': 'Dashboard',
    'Finance': 'Finance',
    'Sales': 'Sales',
    'CRM': 'CRM',
    'HR': 'HR',
    'Procurement': 'Procurement',
    'Analytics': 'Analytics',
    'Billing': 'Billing',
    'Platform Admin': 'Platform Admin',
    'API Testing': 'API Testing',
    'Products': 'Products',
    'Services': 'Services',
    'Administration': 'Administration',
    'Welcome': 'Welcome',
    'Online': 'Online',
    'Offline': 'Offline'
  }
};

export default function EnhancedPlatformNavigation() {
  const params = useParams();
  const pathname = usePathname();
  const lng = (params?.lng as string) || 'ar';
  const isRTL = lng === 'ar';
  
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products', 'services']);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      } else {
        // Mock user for development
        setUser({
          id: '1',
          name: lng === 'ar' ? 'مدير النظام' : 'Admin User',
          email: 'admin@doganhub.com',
          tenantId: 'default-tenant',
          role: 'admin'
        });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser({
        id: '1',
        name: lng === 'ar' ? 'مدير النظام' : 'Admin User',
        email: 'admin@doganhub.com',
        tenantId: 'default-tenant',
        role: 'admin'
      });
    }
  };

  const t = (key: string): string => {
    return translations[lng as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActiveRoute = (route: NavigationRoute): boolean => {
    if (!pathname) return false;
    if (route.href === `/${lng}/dashboard` && pathname === `/${lng}`) return true;
    return pathname.startsWith(`/${lng}${route.href}`);
  };

  const getRoutesByCategory = (category: string) => {
    return getAllRoutes().filter(route => route.category === category);
  };

  interface Category {
    id: string;
    name: string;
    icon: any;
    routes: NavigationRoute[];
  }

  const categories: Category[] = [
    { id: 'dashboard', name: t('Dashboard'), icon: Home, routes: [{ id: 'dashboard', name: t('Dashboard'), href: '/dashboard', icon: Home, description: '', category: 'platform' }] },
    { id: 'products', name: t('Products'), icon: Package, routes: getRoutesByCategory('products') },
    { id: 'services', name: t('Services'), icon: Sparkles, routes: getRoutesByCategory('services') },
    { id: 'admin', name: t('Administration'), icon: Shield, routes: getRoutesByCategory('admin') }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-40 w-72 
        bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {lng === 'ar' ? 'دوغان هاب' : 'DoganHub'}
              </h2>
              <p className="text-xs text-blue-100">
                {lng === 'ar' ? 'منصة إدارة الأعمال' : 'Business Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500">{t('Online')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleMenu(category.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
                  transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
                  ${expandedMenus.includes(category.id) ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' : 'text-gray-700 hover:text-blue-700'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  expandedMenus.includes(category.id) ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Submenu */}
              {expandedMenus.includes(category.id) && (
                <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {category.routes.map((route) => (
                    <Link
                      key={route.id}
                      href={`/${lng}${route.href}`}
                      className={`
                        flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200
                        ${isActiveRoute(route)
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.icon && <route.icon className="w-4 h-4" />}
                      <span className="flex-1">{t(route.name)}</span>
                      
                      {/* Badges */}
                      {route.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-medium rounded-full
                          ${route.badge === 'New' ? 'bg-green-100 text-green-700' : 
                            route.badge === 'Demo' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-blue-100 text-blue-700'}
                        `}>
                          {route.badge}
                        </span>
                      )}
                      
                      {route.isNew && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>v2.0.0</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{lng === 'ar' ? 'نشط' : 'Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
