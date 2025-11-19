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
  ArrowUp,
  Target,
  Calendar,
  UserCircle
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
  const [currentTime, setCurrentTime] = useState(new Date());


  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          // User authentication is optional - don't block navigation
          console.warn('User authentication failed, continuing without user data');
          setUserError('Optional: User not authenticated');
        }
      } catch (error) {
        // User authentication is optional - don't block navigation
        console.warn('User fetch error:', error);
        setUserError('Optional: User not authenticated');
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Auto-collapse navigation menus when navigating to different sections
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split('/').filter(Boolean);
      const currentSection = pathSegments[1]; // e.g., 'finance', 'crm', 'sales', etc.
      
      // Define which menus should stay expanded based on current path
      const relevantMenus: string[] = [];
      
      if (currentSection === 'finance') {
        relevantMenus.push('products');
      } else if (currentSection === 'sales') {
        relevantMenus.push('products');
      } else if (currentSection === 'crm') {
        relevantMenus.push('products');
      } else if (currentSection === 'hr') {
        relevantMenus.push('products');
      } else if (currentSection === 'procurement') {
        relevantMenus.push('products');
      } else if (currentSection === 'licenses') {
        relevantMenus.push('license-management');
      } else if (currentSection === 'billing' || currentSection === 'analytics') {
        relevantMenus.push('services');
      }
      
      // Keep only relevant menus expanded, collapse others
      setExpandedMenus(prev => {
        const newExpanded = prev.filter(menuId => relevantMenus.includes(menuId));
        // Auto-expand the relevant menu if not already expanded
        relevantMenus.forEach(menuId => {
          if (!newExpanded.includes(menuId)) {
            newExpanded.push(menuId);
          }
        });
        return newExpanded;
      });
    }
  }, [pathname]);

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
          id: 'motivation',
          title: 'Motivation & AI',
          titleAr: 'التحفيز والذكاء الاصطناعي',
          href: `/${lng}/motivation`,
          icon: <Target className="h-4 w-4" />,
          description: 'Daily goals and AI agents',
          descriptionAr: 'الأهداف اليومية والوكلاء الذكيون'
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
          descriptionAr: 'الموارد البشرية',
          children: [
            {
              id: 'hr-dashboard',
              title: 'HR Dashboard',
              titleAr: 'لوحة الموارد البشرية',
              href: `/${lng}/hr`,
              icon: <BarChart3 className="h-4 w-4" />,
              description: 'HR overview and metrics',
              descriptionAr: 'نظرة عامة ومقاييس الموارد البشرية'
            },
            {
              id: 'employees',
              title: 'Employees',
              titleAr: 'الموظفون',
              href: `/${lng}/hr/employees`,
              icon: <Users className="h-4 w-4" />,
              description: 'Employee management',
              descriptionAr: 'إدارة الموظفين'
            },
            {
              id: 'attendance',
              title: 'Attendance',
              titleAr: 'الحضور',
              href: `/${lng}/hr/attendance`,
              icon: <Calendar className="h-4 w-4" />,
              description: 'Attendance tracking',
              descriptionAr: 'تتبع الحضور'
            },
            {
              id: 'payroll',
              title: 'Payroll',
              titleAr: 'الرواتب',
              href: `/${lng}/hr/payroll`,
              icon: <DollarSign className="h-4 w-4" />,
              description: 'Payroll management',
              descriptionAr: 'إدارة الرواتب'
            }
          ]
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
          id: 'motivation',
          title: 'Motivation & AI',
          titleAr: 'التحفيز والذكاء الاصطناعي',
          href: `/${lng}/motivation`,
          icon: <Target className="h-4 w-4" />,
          description: 'Daily goals and AI agents',
          descriptionAr: 'الأهداف اليومية والوكلاء الذكيون'
        }
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
              <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
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

  const formatTime = () => {
    return currentTime.toLocaleTimeString(lng === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString(lng === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <aside className={`bg-white dark:bg-neutral-950/70 backdrop-blur-lg border-neutral-200 dark:border-neutral-800/50 ${isRTL ? 'border-l' : 'border-r'} w-72 flex-col flex transition-all duration-300`}>
      {/* Enterprise Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              {/* Enterprise AI Circuit Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl"></div>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse"/>
                <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.6"/>
                <circle cx="16" cy="8" r="0.5" fill="currentColor" opacity="0.6"/>
                <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.6"/>
                <circle cx="16" cy="16" r="0.5" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                {isRTL ? 'بوابة الأعمال السعودية' : 'Saudi Business Gate'}
              </h1>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                {isRTL ? 'المؤسسية' : 'Enterprise'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Time and Theme Controls */}
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-lg px-3 py-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400 mr-2" />
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">{formatTime()}</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{formatDate()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setTheme('light')} 
              className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'hover:bg-white/50'}`}
              title={isRTL ? 'فاتح' : 'Light'}>
              <Sun className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-neutral-700 shadow-sm' : 'hover:bg-white/50'}`}
              title={isRTL ? 'داكن' : 'Dark'}>
              <Moon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
            </button>
            <button 
              onClick={() => setTheme('system')} 
              className={`p-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'hover:bg-white/50'}`}
              title={isRTL ? 'تلقائي' : 'System'}>
              <Laptop className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Show loading only for navigation, not user (user is optional) */}
        {navLoading && (
          <div className="flex items-center justify-center py-6 text-neutral-500">
            <div className="h-5 w-5 mr-2 animate-spin border-2 border-neutral-400 rounded-full border-t-transparent" />
            <span>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        )}
        {/* Show navigation error if navigation fails to load */}
        {!navLoading && navError && (
          <div className={`${isRTL ? 'text-right' : 'text-left'} text-xs text-orange-600 dark:text-orange-400 py-2 px-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg`}>
            {isRTL ? '⚠️ فشل تحميل القائمة' : '⚠️ Navigation load failed'}
          </div>
        )}
        {/* Render navigation items regardless of user authentication status */}
        {!navLoading && renderNavItems(items.length ? items : navigationItems)}
      </nav>
      {/* Footer with tagline */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="text-center">
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
            {isRTL ? 'أول بوابة أعمال ذاتية التشغيل في المنطقة' : 'The 1st Autonomous Business Gate'}
          </p>
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            {isRTL ? 'من السعودية إلى العالم' : 'From Saudi Arabia to the World'}
          </p>
        </div>
      </div>
    </aside>
  );
}
