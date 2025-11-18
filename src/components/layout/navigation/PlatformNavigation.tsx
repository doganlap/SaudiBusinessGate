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

export function PlatformNavigation() {
  const params = useParams();
  const pathname = usePathname();
  const lng = params.lng as string || 'ar';
  const isRTL = lng === 'ar';
  
  const [user, setUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products']);
  const { theme, setTheme } = useTheme();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [navLoading, setNavLoading] = useState(true);
  const [navError, setNavError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        setUserError(null);
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          setUser(json?.data || null);
        } else {
          setUserError('Failed to load user');
        }
      } catch {
        setUserError('Failed to load user');
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        setNavError(null);
        setNavLoading(true);
        const res = await fetch('/api/navigation/dynamic');
        if (res.ok) {
          const data = await res.json();
          const apiItems = (data?.items || data?.data?.navigation || []);
          const normalized = normalizeApiItems(apiItems);
          setItems(normalized.length ? normalized : getFallbackItems());
        } else {
          setItems(getFallbackItems());
          setNavError('Failed to load navigation');
        }
      } catch {
        setItems(getFallbackItems());
        setNavError('Failed to load navigation');
      } finally {
        setNavLoading(false);
      }
    };
    loadNavigation();
  }, [lng]);

  const normalizeApiItems = (apiItems: any[]): NavigationItem[] => {
    const iconMap: Record<string, React.ReactNode> = {
      '📊': <BarChart3 className="h-5 w-5" />,
      '💰': <DollarSign className="h-5 w-5" />,
      '👥': <Users className="h-5 w-5" />,
      '👤': <User className="h-5 w-5" />,
      '📈': <TrendingUp className="h-5 w-5" />,
    };

    const toHref = (path: string) => {
      const base = path?.startsWith('/') ? path : `/${path || ''}`;
      return `/${lng}${base}`;
    };

    const normalizeItem = (item: any): NavigationItem => ({
      id: item.id || item.path || item.label,
      title: item.label || item.title || '',
      titleAr: item.titleAr || item.label || '',
      href: toHref(item.path || '#'),
      icon: iconMap[item.icon] ?? <span className="text-lg">{item.icon || '•'}</span>,
      badge: item.badge ? String(item.badge) : undefined,
      children: Array.isArray(item.children) ? item.children.map(normalizeItem) : undefined,
    });

    return Array.isArray(apiItems) ? apiItems.map(normalizeItem) : [];
  };

  const getFallbackItems = (): NavigationItem[] => ([
    {
      id: 'dashboard',
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      href: `/${lng}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: 'products',
      title: 'Products',
      titleAr: 'المنتجات',
      href: '#',
      icon: <Package className="h-5 w-5" />,
      children: [
        {
          id: 'finance',
          title: 'Finance',
          titleAr: 'المالية',
          href: `/${lng}/finance`,
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          id: 'sales',
          title: 'Sales',
          titleAr: 'المبيعات',
          href: `/${lng}/sales`,
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          id: 'crm',
          title: 'CRM',
          titleAr: 'إدارة العملاء',
          href: `/${lng}/crm`,
          icon: <Users className="h-4 w-4" />,
        },
        {
          id: 'hr',
          title: 'HR',
          titleAr: 'الموارد البشرية',
          href: `/${lng}/hr`,
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          id: 'procurement',
          title: 'Procurement',
          titleAr: 'المشتريات',
          href: `/${lng}/procurement`,
          icon: <Package className="h-4 w-4" />,
        }
      ]
    },
    {
      id: 'license-management',
      title: 'License Management',
      titleAr: 'إدارة التراخيص',
      href: '#',
      icon: <Key className="h-5 w-5" />,
      children: [
        {
          id: 'licenses-overview',
          title: 'All Licenses',
          titleAr: 'جميع التراخيص',
          href: `/${lng}/licenses/management`,
          icon: <Key className="h-4 w-4" />,
        },
        {
          id: 'renewals-pipeline',
          title: 'Renewals Pipeline',
          titleAr: 'خط تجديد التراخيص',
          href: `/${lng}/licenses/renewals`,
          icon: <Clock className="h-4 w-4" />,
        },
        {
          id: 'usage-dashboard',
          title: 'Usage Analytics',
          titleAr: 'تحليلات الاستخدام',
          href: `/${lng}/licenses/usage`,
          icon: <Activity className="h-4 w-4" />,
        },
        {
          id: 'license-upgrade',
          title: 'Upgrade License',
          titleAr: 'ترقية الترخيص',
          href: `/${lng}/licenses/upgrade`,
          icon: <ArrowUp className="h-4 w-4" />,
        }
      ]
    },
    {
      id: 'services',
      title: 'Services',
      titleAr: 'الخدمات',
      href: '#',
      icon: <Zap className="h-5 w-5" />,
      children: [
        {
          id: 'billing',
          title: 'Billing',
          titleAr: 'الفوترة',
          href: `/${lng}/billing`,
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          id: 'analytics',
          title: 'Analytics',
          titleAr: 'التحليلات',
          href: `/${lng}/analytics`,
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          id: 'reporting',
          title: 'Reporting',
          titleAr: 'التقارير',
          href: `/${lng}/reporting`,
          icon: <FileText className="h-4 w-4" />,
        }
      ]
    }
  ]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      href: `/${lng}/dashboard`,
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
          href: `/${lng}/finance`,
          icon: <DollarSign className="h-4 w-4" />,
          description: 'Financial management',
          descriptionAr: 'الإدارة المالية'
        },
        {
          id: 'sales',
          title: 'Sales',
          titleAr: 'المبيعات',
          href: `/${lng}/sales`,
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'Sales pipeline',
          descriptionAr: 'خط أنابيب المبيعات'
        },
        {
          id: 'crm',
          title: 'CRM',
          titleAr: 'إدارة العملاء',
          href: `/${lng}/crm`,
          icon: <Users className="h-4 w-4" />,
          description: 'Customer management',
          descriptionAr: 'إدارة العملاء'
        },
        {
          id: 'hr',
          title: 'HR',
          titleAr: 'الموارد البشرية',
          href: `/${lng}/hr`,
          icon: <UserCheck className="h-4 w-4" />,
          description: 'Human resources',
          descriptionAr: 'الموارد البشرية'
        },
        {
          id: 'procurement',
          title: 'Procurement',
          titleAr: 'المشتريات',
          href: `/${lng}/procurement`,
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
        ...(user?.role === 'platform_admin' || user?.role === 'admin' ? [
          {
            id: 'licenses-overview',
            title: 'All Licenses',
            titleAr: 'جميع التراخيص',
            href: `/${lng}/licenses/management`,
            icon: <Key className="h-4 w-4" />,
            description: 'Platform-wide license management',
            descriptionAr: 'إدارة التراخيص على مستوى المنصة'
          },
          {
            id: 'renewals-pipeline',
            title: 'Renewals Pipeline',
            titleAr: 'خط تجديد التراخيص',
            href: `/${lng}/licenses/renewals`,
            icon: <Clock className="h-4 w-4" />,
            description: '120-day renewal tracking',
            descriptionAr: 'تتبع التجديد لـ 120 يوم'
          }
        ] : []),
        {
          id: 'usage-dashboard',
          title: 'Usage Analytics',
          titleAr: 'تحليلات الاستخدام',
          href: `/${lng}/licenses/usage`,
          icon: <Activity className="h-4 w-4" />,
          description: 'Monitor feature usage',
          descriptionAr: 'مراقبة استخدام الميزات'
        },
        {
          id: 'license-upgrade',
          title: 'Upgrade License',
          titleAr: 'ترقية الترخيص',
          href: `/${lng}/licenses/upgrade`,
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
          href: `/${lng}/billing`,
          icon: <CreditCard className="h-4 w-4" />,
          description: 'Subscription management',
          descriptionAr: 'إدارة الاشتراكات'
        },
        {
          id: 'analytics',
          title: 'Analytics',
          titleAr: 'التحليلات',
          href: `/${lng}/analytics`,
          icon: <BarChart3 className="h-4 w-4" />,
          description: 'Business intelligence',
          descriptionAr: 'ذكاء الأعمال'
        },
        {
          id: 'reporting',
          title: 'Reporting',
          titleAr: 'التقارير',
          href: `/${lng}/reporting`,
          icon: <FileText className="h-4 w-4" />,
          description: 'Reports and insights',
          descriptionAr: 'التقارير والرؤى'
        },
      ]
    }
  ];

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
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {userLoading && (
          <div className="flex items-center justify-center py-6 text-neutral-500">
            <div className="h-5 w-5 mr-2 animate-spin border-2 border-neutral-400 rounded-full border-t-transparent" />
            <span>Loading user...</span>
          </div>
        )}
        {userError && (
          <div className={`${isRTL ? 'text-right' : 'text-left'} text-sm text-red-600 py-2`}>
            Failed to load user: {userError}
          </div>
        )}
        {!userLoading && !userError && navLoading && (
          <div className="flex items-center justify-center py-6 text-neutral-500">
            <div className="h-5 w-5 mr-2 animate-spin border-2 border-neutral-400 rounded-full border-t-transparent" />
            <span>Loading navigation...</span>
          </div>
        )}
        {!userLoading && !userError && navError && (
          <div className={`${isRTL ? 'text-right' : 'text-left'} text-sm text-red-600 py-2`}>
            {navError}
          </div>
        )}
        {!userLoading && !userError && !navLoading && renderNavItems(items.length ? items : navigationItems)}
      </nav>
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/50">
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
