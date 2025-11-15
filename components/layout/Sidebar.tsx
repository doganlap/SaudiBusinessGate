'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users className="w-5 h-5" />,
    path: '/crm/customers',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <ShoppingCart className="w-5 h-5" />,
    path: '/sales',
    children: [
      { id: 'deals', label: 'Deals', icon: null, path: '/sales/deals' },
      { id: 'orders', label: 'Orders', icon: null, path: '/sales/orders' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="w-5 h-5" />,
    path: '/products',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Saudi Store
        </h2>
        
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <Link
                href={item.path}
                onClick={(e) => {
                  if (item.children && item.children.length > 0) {
                    e.preventDefault();
                    toggleItem(item.id);
                  }
                }}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                
                {item.children && item.children.length > 0 && (
                  <span>
                    {expandedItems.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                )}
              </Link>

              {item.children && expandedItems.includes(item.id) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.path}
                      className={`
                        block px-3 py-2 rounded-md text-sm
                        transition-colors duration-150
                        ${
                          isActive(child.path)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }
                      `}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
