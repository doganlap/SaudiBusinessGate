'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
  Home,
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  Package,
  CreditCard,
  Settings,
  ChevronDown,
  Menu,
  X,
  Building,
  BarChart3,
  FileText,
  Workflow,
  Zap,
  Shield,
  Bell,
  Search,
  Globe,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronRight,
  Languages,
  Laptop,
  Key,
  Activity,
  Clock,
  ArrowUp
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

interface NavigationItem {
  id: string;
  title: string;
  titleAr: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  descriptionAr?: string;
  children?: NavigationItem[];
  badge?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: string;
  avatar?: string;
}

export function PlatformNavigation() {
  const params = useParams();
  const pathname = usePathname();
  const lng = (params?.lng as string) || 'ar';
  const isRTL = lng === 'ar';
  
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products']);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user !== undefined) {
      fetchNavigation();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      } else if (response.status === 401) {
        // User not authenticated - redirect to login or show appropriate message
        console.warn('User not authenticated');
        setUser(null);
      } else {
        console.error('Failed to fetch user:', response.status);
        // Use fallback user for demo purposes, but mark as demo
        setUser({
          id: 'demo-1',
          name: 'أحمد محمد (Demo)',
          email: 'ahmed@doganhub.com',
          tenantId: 'demo-tenant',
          role: 'admin'
        });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Fallback user for demo with clear indication
      setUser({
        id: 'demo-1',
        name: 'أحمد محمد (Demo)',
        email: 'ahmed@doganhub.com',
        tenantId: 'demo-tenant',
        role: 'admin'
      });
    }
  };

  const fetchNavigation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/navigation/dynamic');
      if (!response.ok) {
        throw new Error('Failed to fetch navigation');
      }
      
      const data = await response.json();
      const dynamicNavItems = transformDynamicNavToNavItems(data.items, lng, user);
      setNavigationItems(dynamicNavItems);
    } catch (err) {
      console.error('Failed to fetch navigation:', err);
      setError('Failed to load navigation. Using fallback navigation.');
      // Fallback to hardcoded navigation if API fails
      setNavigationItems(getFallbackNavigationItems(lng));
    } finally {
      setIsLoading(false);
    }
  };

  const transformDynamicNavToNavItems = (dynamicItems: any[], language: string, currentUser: User | null): NavigationItem[] => {
    return dynamicItems.map(item => {
      // Filter admin-only items based on user role
      if (item.module === 'admin' && currentUser?.role !== 'platform_admin' && currentUser?.role !== 'admin') {
        return null;
      }
      
      return {
        id: item.id,
        title: item.label,
        titleAr: item.label, // For now, using same label for Arabic - can be enhanced later
        href: item.path,
        icon: getIconForModule(item.module),
        description: `${item.module} module`,
        descriptionAr: `وحدة ${item.module}`,
        children: item.children ? transformDynamicNavToNavItems(item.children, language, currentUser)?.filter(Boolean) as NavigationItem[] : undefined,
        badge: item.badge ? String(item.badge) : undefined,
      };
    }).filter(Boolean) as NavigationItem[];
  };

  const getIconForModule = (module: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Dashboard': <Home className="h-5 w-5" />,
      'Finance': <DollarSign className="h-5 w-5" />,
      'Sales': <TrendingUp className="h-5 w-5" />,
      'CRM': <Users className="h-5 w-5" />,
      'HR': <UserCheck className="h-5 w-5" />,
      'Procurement': <Package className="h-5 w-5" />,
      'License': <Key className="h-5 w-5" />,
      'Billing': <CreditCard className="h-5 w-5" />,
      'Analytics': <BarChart3 className="h-5 w-5" />,
      'Reports': <FileText className="h-5 w-5" />,
      'GRC': <Shield className="h-5 w-5" />,
      'Workflows': <Workflow className="h-5 w-5" />,
      'AI': <Zap className="h-5 w-5" />,
      'Integrations': <Globe className="h-5 w-5" />,
      'Platform': <Settings className="h-5 w-5" />,
    };
    
    return iconMap[module] || <Package className="h-5 w-5" />;
  };

  const getFallbackNavigationItems = (language: string): NavigationItem[] => {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        titleAr: 'لوحة التحكم',
        href: `/${language}/dashboard`,
        icon: <Home className="h-5 w-5" />,
        description: 'Overview and analytics',
        descriptionAr: 'نظرة عامة والتحليلات'
      },
      {
        id: 'products',
        title: 'Products',
        titleAr: 'المنتجات',
        href: '#',
        icon: <Package className="h-5 w-5" />,
        description: 'Business modules',
        descriptionAr: 'وحدات الأعمال',
        children: [
          {
            id: 'finance',
            title: 'Finance',
            titleAr: 'المالية',
            href: `/${language}/finance`,
            icon: <DollarSign className="h-4 w-4" />,
            description: 'Financial management',
            descriptionAr: 'الإدارة المالية'
          },
          {
            id: 'sales',
            title: 'Sales',
            titleAr: 'المبيعات',
            href: `/${language}/sales`,
            icon: <TrendingUp className="h-4 w-4" />,
            description: 'Sales pipeline',
            descriptionAr: 'خط أنابيب المبيعات'
          },
          {
            id: 'crm',
            title: 'CRM',
            titleAr: 'إدارة العملاء',
            href: `/${language}/crm`,
            icon: <Users className="h-4 w-4" />,
            description: 'Customer management',
            descriptionAr: 'إدارة العملاء'
          },
          {
            id: 'hr',
            title: 'HR',
            titleAr: 'الموارد البشرية',
            href: `/${language}/hr`,
            icon: <UserCheck className="h-4 w-4" />,
            description: 'Human resources',
            descriptionAr: 'الموارد البشرية'
          },
          {
            id: 'procurement',
            title: 'Procurement',
            titleAr: 'المشتريات',
            href: `/${language}/procurement`,
            icon: <Package className="h-4 w-4" />,
            description: 'Purchase management',
            descriptionAr: 'إدارة المشتريات'
          }
        ]
      },
      {
        id: 'license-management',
        title: 'License Management',
        titleAr: 'إدارة التراخيص',
        href: '#',
        icon: <Key className="h-5 w-5" />,
        description: 'License administration',
        descriptionAr: 'إدارة التراخيص',
        children: [
          {
            id: 'usage-dashboard',
            title: 'Usage Analytics',
            titleAr: 'تحليلات الاستخدام',
            href: `/${language}/licenses/usage`,
            icon: <Activity className="h-4 w-4" />,
            description: 'Monitor feature usage',
            descriptionAr: 'مراقبة استخدام الميزات'
          },
          {
            id: 'license-upgrade',
            title: 'Upgrade License',
            titleAr: 'ترقية الترخيص',
            href: `/${language}/licenses/upgrade`,
            icon: <ArrowUp className="h-4 w-4" />,
            description: 'Upgrade your plan',
            descriptionAr: 'ترقية خطتك'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        titleAr: 'الخدمات',
        href: '#',
        icon: <Zap className="h-5 w-5" />,
        description: 'Platform services',
        descriptionAr: 'خدمات المنصة',
        children: [
          {
            id: 'billing',
            title: 'Billing',
            titleAr: 'الفوترة',
            href: `/${language}/billing`,
            icon: <CreditCard className="h-4 w-4" />,
            description: 'Subscription management',
            descriptionAr: 'إدارة الاشتراكات'
          },
          {
            id: 'analytics',
            title: 'Analytics',
            titleAr: 'التحليلات',
            href: `/${language}/analytics`,
            icon: <BarChart3 className="h-4 w-4" />,
            description: 'Business intelligence',
            descriptionAr: 'ذكاء الأعمال'
          },
          {
            id: 'reporting',
            title: 'Reporting',
            titleAr: 'التقارير',
            href: `/${language}/reporting`,
            icon: <FileText className="h-4 w-4" />,
            description: 'Reports and insights',
            descriptionAr: 'التقارير والرؤى'
          },
        ]
      }
    ];
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(menuId => menuId !== id) : [...prev, id]
    );
  };

  const renderNavItems = (items: NavigationItem[]) => {
    return items.map(item => {
      const isActive = pathname?.startsWith(item.href) && item.href !== '#';
      const isExpanded = expandedMenus.includes(item.id);

      if (item.children) {
        return (
          <div key={item.id}>
            <button 
              onClick={() => toggleMenu(item.id)} 
              className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg transition-colors duration-200 ${isRTL ? 'pr-2' : 'pl-2'} hover:bg-brand-100 dark:hover:bg-brand-900/50`}>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-900/80 text-brand-600 dark:text-brand-400 shadow-sm">
                  {item.icon}
                </div>
                <span className={`font-semibold text-sm text-neutral-800 dark:text-neutral-200 ${isRTL ? 'mr-3' : 'ml-3'}`}>{isRTL ? item.titleAr : item.title}</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
            </button>
            {isExpanded && (
              <div className={`${isRTL ? 'mr-4 pr-4 border-r-2' : 'ml-4 pl-4 border-l-2'} border-brand-200 dark:border-brand-800 mt-2 space-y-1`}>
                {renderNavItems(item.children)}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link href={item.href} key={item.id}>
          <div className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-brand-100 dark:hover:bg-brand-900/50'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive ? 'bg-brand-500/20' : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900/50 dark:to-neutral-900/80'} shadow-sm`}>
              {item.icon}
            </div>
            <span className={`font-medium text-sm ${isRTL ? 'mr-3' : 'ml-3'}`}>{isRTL ? item.titleAr : item.title}</span>
          </div>
        </Link>
      );
    });
  };

  return (
    <aside className={`bg-white dark:bg-neutral-950/70 backdrop-blur-lg border-neutral-200 dark:border-neutral-800/50 ${isRTL ? 'border-l' : 'border-r'} w-72 flex-col flex transition-all duration-300`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800/50 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className={`text-xl font-bold text-neutral-900 dark:text-white ${isRTL ? 'mr-3' : 'ml-3'}`}>DoganHub</h1>
        </div>
        <LanguageSwitcher />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {isLoading && (
          <div className="space-y-2 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
            ))}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <span className={`ml-3 text-neutral-600 dark:text-neutral-400`}>
              {isRTL ? 'جاري التحميل...' : 'Loading navigation...'}
            </span>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={`ml-3 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {isRTL ? 'فشل تحميل التنقل. يتم استخدام التنقل الاحتياطي.' : error}
                </p>
              </div>
            </div>
          </div>
        ) : navigationItems.length > 0 ? (
          renderNavItems(navigationItems)
        ) : (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            <p>{isRTL ? 'لا توجد عناصر تنقل متاحة' : 'No navigation items available'}</p>
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/50">
        {user && (
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                {user.id.startsWith('demo-') && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    {isRTL ? 'وضع تجريبي' : 'Demo Mode'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-around bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
          <button onClick={() => setTheme('light')} className={`p-2 rounded-md ${theme === 'light' ? 'bg-white dark:bg-neutral-700' : ''}`}>
            <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          <button onClick={() => setTheme('dark')} className={`p-2 rounded-md ${theme === 'dark' ? 'bg-white dark:bg-neutral-700' : ''}`}>
            <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          <button onClick={() => setTheme('system')} className={`p-2 rounded-md ${theme === 'system' ? 'bg-white dark:bg-neutral-700' : ''}`}>
            <Laptop className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
        </div>
      </div>
    </aside>
  );
}
