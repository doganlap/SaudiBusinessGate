'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  UserCircle,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe
} from 'lucide-react';

interface UserMenuItem {
  name?: string;
  href?: string;
  icon?: React.ComponentType<any>;
  action?: () => void;
  separator?: boolean;
  isAdmin?: boolean;
}

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className = '' }: UserMenuProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Determine user role from session or localStorage
    if (session && session.user && (session.user as any).role) {
      setUserRole((session.user as any).role as string);
    } else {
      // Fallback to localStorage or default
      const storedRole = localStorage.getItem('userRole') || 'user';
      setUserRole(storedRole);
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem('userRole');
      localStorage.removeItem('userPreferences');
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      router.push('/auth/signin');
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push('/settings/profile');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleAdminClick = () => {
    setIsOpen(false);
    router.push('/admin');
  };

  const handleBillingClick = () => {
    setIsOpen(false);
    router.push('/billing');
  };

  const handleHelpClick = () => {
    setIsOpen(false);
    router.push('/help');
  };

  const handleThemeClick = () => {
    setIsOpen(false);
    router.push('/settings/appearance');
  };

  const handleLanguageClick = () => {
    setIsOpen(false);
    router.push('/settings/language');
  };

  const menuItems: UserMenuItem[] = [
    {
      name: 'Profile',
      icon: UserCircle,
      action: handleProfileClick
    },
    {
      name: 'Settings',
      icon: Settings,
      action: handleSettingsClick
    },
    {
      name: 'Notifications',
      icon: Bell,
      action: () => {
        setIsOpen(false);
        router.push('/settings/notifications');
      }
    },
    {
      name: 'Theme',
      icon: Palette,
      action: handleThemeClick
    },
    {
      name: 'Language',
      icon: Globe,
      action: handleLanguageClick
    },
    {
      name: 'Billing',
      icon: CreditCard,
      action: handleBillingClick
    },
    {
      name: 'Help & Support',
      icon: HelpCircle,
      action: handleHelpClick
    },
    {
      name: 'Admin Panel',
      icon: Shield,
      action: handleAdminClick,
      isAdmin: true
    },
    {
      separator: true
    },
    {
      name: 'Sign Out',
      icon: LogOut,
      action: handleLogout
    }
  ];

  const getUserDisplayName = () => {
    if (session?.user?.name) {
      return session.user.name;
    }
    if (session?.user?.email) {
      return session.user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserEmail = () => {
    return session?.user?.email || 'user@company.com';
  };

  const getUserAvatar = () => {
    if (session?.user?.image) {
      return session.user.image;
    }
    return undefined;
  };

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="hidden md:block">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-24 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded animate-pulse w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        {getUserAvatar() ? (
          <img
            src={getUserAvatar()}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {userRole.replace('_', ' ')}
          </p>
        </div>
        
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserEmail()}
                </p>
                <p className="text-xs text-blue-600 capitalize">
                  {userRole.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              if (item.separator) {
                return <hr key={`separator-${index}`} className="my-2 border-gray-100" />;
              }

              // Skip admin items if user is not admin
              if (item.isAdmin && userRole !== 'admin' && userRole !== 'super_admin') {
                return null;
              }

              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`
                    w-full flex items-center px-4 py-2 text-sm transition-colors
                    ${item.name === 'Sign Out' 
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-3" />}
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Status Footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Status: <span className="text-green-600">Online</span></span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}