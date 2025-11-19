'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  ChevronLeft
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
  badge?: number;
  isNew?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main overview and metrics'
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: DollarSign,
    description: 'Financial management and accounting',
    children: [
      { name: 'Dashboard', href: '/finance', icon: LayoutDashboard },
      { name: 'Accounts', href: '/finance/accounts', icon: Building2 },
      { name: 'Transactions', href: '/finance/transactions', icon: FileText },
      { name: 'Reports', href: '/finance/reports', icon: BarChart3 }
    ]
  },
  {
    name: 'Sales & CRM',
    href: '/sales',
    icon: TrendingUp,
    description: 'Sales pipeline and customer management',
    children: [
      { name: 'Dashboard', href: '/sales', icon: LayoutDashboard },
      { name: 'Opportunities', href: '/sales/opportunities', icon: TrendingUp },
      { name: 'Customers', href: '/sales/customers', icon: Users },
      { name: 'Activities', href: '/sales/activities', icon: Calendar }
    ]
  },
  {
    name: 'HR Management',
    href: '/hr',
    icon: Users,
    description: 'Human resources and employee management',
    children: [
      { name: 'Dashboard', href: '/hr', icon: LayoutDashboard },
      { name: 'Employees', href: '/hr/employees', icon: Users },
      { name: 'Leaves', href: '/hr/leaves', icon: Calendar },
      { name: 'Reports', href: '/hr/reports', icon: BarChart3 }
    ]
  },
  {
    name: 'AI & Automation',
    href: '/ai',
    icon: Bot,
    description: 'AI integration and automation tools',
    isNew: true,
    children: [
      { name: 'AI Hub', href: '/ai', icon: Bot },
      { name: 'Local LLM', href: '/ai/local-llm', icon: Bot },
      { name: 'Agents', href: '/agents', icon: Bot }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Data insights and reporting'
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    description: 'System administration and configuration'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings and preferences'
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

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
            <item.icon className={`h-5 w-5 ${isCollapsed && level === 0 ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="flex-1">{item.name}</span>
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
          {isCollapsed 
            ? (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
            : (isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavigationItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
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
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
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
