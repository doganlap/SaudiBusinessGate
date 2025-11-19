'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  Shield
} from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  children?: NavigationItem[];
}

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
  const lng = params.lng as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      href: `/${lng}/dashboard`,
      icon: <Home className="h-5 w-5" />,
      description: 'Overview and analytics'
    },
    {
      id: 'products',
      title: 'Products',
      href: '#',
      icon: <Package className="h-5 w-5" />,
      description: 'Business modules',
      children: [
        {
          id: 'finance',
          title: 'Finance',
          href: `/${lng}/finance`,
          icon: <DollarSign className="h-4 w-4" />,
          description: 'Financial management'
        },
        {
          id: 'sales',
          title: 'Sales',
          href: `/${lng}/sales`,
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'Sales pipeline'
        },
        {
          id: 'crm',
          title: 'CRM',
          href: `/${lng}/crm`,
          icon: <Users className="h-4 w-4" />,
          description: 'Customer management'
        },
        {
          id: 'hr',
          title: 'HR',
          href: `/${lng}/hr`,
          icon: <UserCheck className="h-4 w-4" />,
          description: 'Human resources',
          children: [
            {
              id: 'hr-dashboard',
              title: 'HR Dashboard',
              href: `/${lng}/hr`,
              icon: <BarChart3 className="h-4 w-4" />,
              description: 'HR overview and metrics'
            },
            {
              id: 'employees',
              title: 'Employees',
              href: `/${lng}/hr/employees`,
              icon: <Users className="h-4 w-4" />,
              description: 'Employee management'
            },
            {
              id: 'attendance',
              title: 'Attendance',
              href: `/${lng}/hr/attendance`,
              icon: <Calendar className="h-4 w-4" />,
              description: 'Attendance tracking'
            },
            {
              id: 'payroll',
              title: 'Payroll',
              href: `/${lng}/hr/payroll`,
              icon: <DollarSign className="h-4 w-4" />,
              description: 'Payroll management'
            }
          ]
        },
        {
          id: 'procurement',
          title: 'Procurement',
          href: `/${lng}/procurement`,
          icon: <Package className="h-4 w-4" />,
          description: 'Purchase management'
        }
      ]
    },
    {
      id: 'services',
      title: 'Services',
      href: '#',
      icon: <Zap className="h-5 w-5" />,
      description: 'Platform services',
      children: [
        {
          id: 'billing',
          title: 'Billing',
          href: `/${lng}/billing`,
          icon: <CreditCard className="h-4 w-4" />,
          description: 'Subscription management'
        },
        {
          id: 'analytics',
          title: 'Analytics',
          href: `/${lng}/analytics`,
          icon: <BarChart3 className="h-4 w-4" />,
          description: 'Business intelligence'
        },
        {
          id: 'reporting',
          title: 'Reporting',
          href: `/${lng}/reporting`,
          icon: <FileText className="h-4 w-4" />,
          description: 'Reports and insights'
        },
        {
          id: 'workflow',
          title: 'Workflow',
          href: `/${lng}/workflow`,
          icon: <Workflow className="h-4 w-4" />,
          description: 'Process automation'
        },
        {
          id: 'grc',
          title: 'GRC',
          href: `/${lng}/grc`,
          icon: <Shield className="h-4 w-4" />,
          description: 'Governance, Risk & Compliance'
        }
      ]
    }
  ];

  // Add platform management for admin users
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navigationItems.push({
      id: 'platform',
      title: 'Platform',
      href: '#',
      icon: <Building className="h-5 w-5" />,
      description: 'Platform management',
      children: [
        {
          id: 'users',
          title: 'Users',
          href: `/${lng}/platform/users`,
          icon: <Users className="h-4 w-4" />,
          description: 'User management'
        },
        {
          id: 'tenants',
          title: 'Tenants',
          href: `/${lng}/platform/tenants`,
          icon: <Building className="h-4 w-4" />,
          description: 'Tenant management'
        },
        {
          id: 'settings',
          title: 'Settings',
          href: `/${lng}/platform/settings`,
          icon: <Settings className="h-4 w-4" />,
          description: 'System settings'
        }
      ]
    });
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
    return pathname.startsWith(href);
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
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
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
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                {user?.tenantId || 'Platform'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>

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
