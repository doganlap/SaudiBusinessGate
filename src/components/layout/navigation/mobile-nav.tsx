'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, ShoppingCart, Settings } from 'lucide-react';

interface MobileNavProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function MobileNav({ isOpen = false, onToggle }: MobileNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(isOpen);

  React.useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onToggle?.();
  };

  const navItems = [
    { label: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Customers', href: '/crm/customers', icon: <Users className="w-5 h-5" /> },
    { label: 'Sales', href: '/sales', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
        aria-label="Toggle mobile menu"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleToggle}
            aria-hidden="true"
          />
          
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-900 z-50 shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Menu
                </h2>
                <button
                  onClick={handleToggle}
                  className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleToggle}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                        transition-colors duration-150
                        ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }
                      `}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
