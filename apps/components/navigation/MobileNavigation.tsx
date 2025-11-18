'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Bot,
  BarChart3,
  Shield,
  Settings,
  ChevronRight,
  User,
  LogOut,
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MobileNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: MobileNavigationItem[];
}

const mobileNavigationItems: MobileNavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home
  },
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
      { name: 'Accounts', href: '/finance/accounts', icon: DollarSign },
      { name: 'Transactions', href: '/finance/transactions', icon: DollarSign },
      { name: 'Reports', href: '/finance/reports', icon: BarChart3 }
    ]
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: TrendingUp,
    description: 'Sales pipeline and customer management',
    children: [
      { name: 'Dashboard', href: '/sales', icon: LayoutDashboard },
      { name: 'Opportunities', href: '/sales/opportunities', icon: TrendingUp },
      { name: 'Customers', href: '/sales/customers', icon: Users },
      { name: 'Activities', href: '/sales/activities', icon: TrendingUp }
    ]
  },
  {
    name: 'HR',
    href: '/hr',
    icon: Users,
    description: 'Human resources and employee management',
    children: [
      { name: 'Dashboard', href: '/hr', icon: LayoutDashboard },
      { name: 'Employees', href: '/hr/employees', icon: Users },
      { name: 'Leaves', href: '/hr/leaves', icon: Users },
      { name: 'Reports', href: '/hr/reports', icon: BarChart3 }
    ]
  },
  {
    name: 'AI Hub',
    href: '/ai',
    icon: Bot,
    description: 'AI integration and automation tools',
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

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}

export default function MobileNavigation({ 
  isOpen, 
  onClose, 
  onNavigate 
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    onClose();
  };

  const NavigationItem = ({ item, level = 0 }: { item: MobileNavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    return (
      <div className={`w-full ${level > 0 ? 'ml-4' : ''}`}>
        <div
          className={`
            flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
            ${active 
              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${level === 0 ? 'border-b border-gray-100' : ''}
          `}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.name);
            } else {
              handleNavigation(item.href);
            }
          }}
        >
          <div className="flex items-center flex-1">
            <item.icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.name}</p>
              {item.description && (
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              )}
            </div>
          </div>
          {hasChildren && (
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 bg-gray-50 rounded-lg">
            {item.children!.map((child) => (
              <NavigationItem key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DH</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">DoganHub</h2>
                <p className="text-xs text-gray-500">Enterprise Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john.doe@company.com</p>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            {showUserMenu && (
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => handleNavigation('/settings/profile')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={() => handleNavigation('/help')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => handleNavigation('/auth/signout')}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {mobileNavigationItems.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2024 DoganHub</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}