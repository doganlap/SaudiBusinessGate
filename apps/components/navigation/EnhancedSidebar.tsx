'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Bot,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  Shield,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Home,
  Briefcase,
  Package,
  ShoppingCart,
  Warehouse,
  UserCog,
  CreditCard,
  Globe,
  Zap,
  Database,
  Cloud,
  Lock,
  Bell,
  Mail,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useLanguage } from '@/components/i18n/LanguageProvider';

interface NavigationItem {
  name: string;
  nameAr: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
  badge?: number;
  isNew?: boolean;
  color?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    nameAr: 'لوحة القيادة',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main overview and metrics',
    color: 'emerald',
  },
  {
    name: 'Finance',
    nameAr: 'المالية',
    href: '/finance',
    icon: DollarSign,
    description: 'Financial management',
    color: 'blue',
    children: [
      { name: 'Dashboard', nameAr: 'لوحة القيادة', href: '/finance', icon: LayoutDashboard },
      { name: 'Accounts', nameAr: 'الحسابات', href: '/finance/accounts', icon: Building2 },
      { name: 'Transactions', nameAr: 'المعاملات', href: '/finance/transactions', icon: FileText },
      { name: 'Reports', nameAr: 'التقارير', href: '/finance/reports', icon: BarChart3 },
    ],
  },
  {
    name: 'Sales & CRM',
    nameAr: 'المبيعات وإدارة العملاء',
    href: '/sales',
    icon: TrendingUp,
    description: 'Sales pipeline',
    color: 'violet',
    children: [
      { name: 'Dashboard', nameAr: 'لوحة القيادة', href: '/sales', icon: LayoutDashboard },
      { name: 'Opportunities', nameAr: 'الفرص', href: '/sales/opportunities', icon: TrendingUp },
      { name: 'Customers', nameAr: 'العملاء', href: '/sales/customers', icon: Users },
      { name: 'Activities', nameAr: 'الأنشطة', href: '/sales/activities', icon: Calendar },
    ],
  },
  {
    name: 'HR Management',
    nameAr: 'إدارة الموارد البشرية',
    href: '/hr',
    icon: Users,
    description: 'Human resources',
    color: 'cyan',
    children: [
      { name: 'Dashboard', nameAr: 'لوحة القيادة', href: '/hr', icon: LayoutDashboard },
      { name: 'Employees', nameAr: 'الموظفون', href: '/hr/employees', icon: Users },
      { name: 'Leaves', nameAr: 'الإجازات', href: '/hr/leaves', icon: Calendar },
      { name: 'Payroll', nameAr: 'الرواتب', href: '/hr/payroll', icon: CreditCard },
    ],
  },
  {
    name: 'Inventory',
    nameAr: 'المخزون',
    href: '/inventory',
    icon: Package,
    description: 'Stock management',
    color: 'orange',
    children: [
      { name: 'Products', nameAr: 'المنتجات', href: '/inventory/products', icon: Package },
      { name: 'Warehouse', nameAr: 'المستودع', href: '/inventory/warehouse', icon: Warehouse },
      { name: 'Orders', nameAr: 'الطلبات', href: '/inventory/orders', icon: ShoppingCart },
    ],
  },
  {
    name: 'AI & Automation',
    nameAr: 'الذكاء الاصطناعي والأتمتة',
    href: '/ai',
    icon: Bot,
    description: 'AI tools',
    isNew: true,
    color: 'purple',
    children: [
      { name: 'AI Hub', nameAr: 'مركز الذكاء الاصطناعي', href: '/ai', icon: Sparkles },
      { name: 'Local LLM', nameAr: 'نموذج محلي', href: '/ai/local-llm', icon: Database },
      { name: 'Agents', nameAr: 'الوكلاء الذكيون', href: '/agents', icon: Bot },
    ],
  },
  {
    name: 'Analytics',
    nameAr: 'التحليلات',
    href: '/analytics',
    icon: BarChart3,
    description: 'Data insights',
    color: 'indigo',
  },
  {
    name: 'Billing',
    nameAr: 'الفواتير',
    href: '/billing',
    icon: CreditCard,
    description: 'Billing management',
    color: 'rose',
    badge: 3,
  },
  {
    name: 'Admin',
    nameAr: 'الإدارة',
    href: '/admin',
    icon: Shield,
    description: 'System admin',
    color: 'red',
  },
  {
    name: 'Settings',
    nameAr: 'الإعدادات',
    href: '/settings',
    icon: Settings,
    description: 'Preferences',
    color: 'gray',
  },
];

interface EnhancedSidebarProps {
  defaultCollapsed?: boolean;
}

export default function EnhancedSidebar({ defaultCollapsed = false }: EnhancedSidebarProps) {
  const pathname = usePathname();
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getColorClasses = (color?: string) => {
    const colors = {
      emerald: 'text-emerald-600 dark:text-emerald-400',
      blue: 'text-blue-600 dark:text-blue-400',
      violet: 'text-violet-600 dark:text-violet-400',
      cyan: 'text-cyan-600 dark:text-cyan-400',
      orange: 'text-orange-600 dark:text-orange-400',
      purple: 'text-purple-600 dark:text-purple-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      rose: 'text-rose-600 dark:text-rose-400',
      red: 'text-red-600 dark:text-red-400',
      gray: 'text-gray-600 dark:text-gray-400',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const NavigationItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);
    const itemName = language === 'ar' ? (item.nameAr || item.name) : item.name;

    return (
      <div className={`w-full ${level > 0 ? 'ms-4' : ''}`}>
        <Link
          href={item.href}
          className={`
            group relative flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl
            transition-all duration-200
            ${active
              ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
            }
            ${isCollapsed && level === 0 ? 'justify-center' : 'justify-between'}
          `}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.name);
            }
          }}
        >
          <div className={`flex items-center ${isCollapsed && level === 0 ? '' : 'flex-1'}`}>
            <div className={`relative ${isCollapsed && level === 0 ? '' : 'me-3'}`}>
              <item.icon className={`h-5 w-5 ${active ? getColorClasses(item.color) : ''}`} />
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg opacity-20 blur-sm"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </div>
            {!isCollapsed && (
              <span className="flex-1 truncate">{itemName}</span>
            )}
          </div>

          {!isCollapsed && (
            <>
              {hasChildren && (
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              )}
              {item.isNew && (
                <span className="ms-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg">
                  {language === 'ar' ? 'جديد' : 'New'}
                </span>
              )}
              {item.badge && item.badge > 0 && (
                <span className="ms-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full shadow-lg animate-pulse">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>

        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 space-y-1 overflow-hidden"
            >
              {item.children!.map((child) => (
                <NavigationItem key={child.name} item={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-neutral-900/80 dark:via-neutral-900/70 dark:to-neutral-900/60 border-e border-white/20 dark:border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {language === 'ar' ? 'المتجر السعودي' : 'Saudi Store'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'منصة المؤسسات' : 'Enterprise Platform'}
              </p>
            </div>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200 group"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigationItems.map((item) => (
          <NavigationItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 dark:border-white/10">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 rtl:space-x-reverse'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
            <UserCog className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {language === 'ar' ? 'اسم المستخدم' : 'User Name'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                user@company.com
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-20 start-4 z-50 p-3 bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-900/90 dark:to-neutral-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 lg:hidden hover:scale-110 transition-transform"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          x: isMobileOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed inset-y-0 start-0 z-50
          lg:relative lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-70'}
        `}
      >
        <SidebarContent />
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </>
  );
}
