/**
 * Dynamic Sidebar Component
 * Saudi Store - Multi-tenant Navigation
 * 
 * Displays navigation based on user's:
 * - Role permissions
 * - Enabled modules
 * - Subscription tier
 * - Team membership
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  ShoppingCart,
  Shield,
  BarChart,
  Bot,
  GitBranch,
  Plug,
  CreditCard,
  Activity,
  UsersRound,
  Store,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  ShoppingCart,
  Shield,
  BarChart,
  Bot,
  GitBranch,
  Plug,
  CreditCard,
  Activity,
  UsersRound,
  Store,
  Settings,
};

interface DynamicSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DynamicSidebar({
  className = '',
  collapsed = false,
  onToggle,
}: DynamicSidebarProps) {
  const pathname = usePathname();
  const { navigation, metadata, isLoading, error } = useNavigation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    core: true, // Core expanded by default
  });
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Toggle item expansion
  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Check if route is active
  const isActive = (path: string): boolean => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Render icon
  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent className={className} />;
  };

  // Loading state
  if (isLoading) {
    return (
      <aside
        className={`bg-gray-900 text-white h-screen overflow-y-auto ${className}`}
        style={{ width: collapsed ? '60px' : '280px' }}
      >
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </aside>
    );
  }

  // Error state
  if (error) {
    return (
      <aside
        className={`bg-gray-900 text-white h-screen overflow-y-auto ${className}`}
        style={{ width: collapsed ? '60px' : '280px' }}
      >
        <div className="p-4">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen overflow-y-auto transition-all duration-300 border-r border-gray-700 ${className}`}
      style={{ width: collapsed ? '60px' : '280px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        {!collapsed ? (
          <div>
            <h2 className="text-xl font-bold text-blue-400">
              {metadata?.isWhiteLabel ? 'Store' : 'Saudi Store'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {metadata?.subscriptionTier?.toUpperCase() || 'FREE'}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Store className="w-6 h-6 text-blue-400 mx-auto" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navigation.map((group) => (
          <div key={group.id} className="mb-4">
            {/* Group Header */}
            {!collapsed && group.collapsible && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span>{group.label}</span>
                {expandedGroups[group.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {!collapsed && !group.collapsible && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}

            {/* Group Items */}
            {(!group.collapsible || expandedGroups[group.id] || collapsed) && (
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    {/* Main Item */}
                    <Link
                      href={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } ${item.requiresUpgrade ? 'opacity-60' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {renderIcon(item.icon, 'w-5 h-5')}
                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.children && item.children.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleItem(item.id);
                              }}
                            >
                              {expandedItems[item.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Sub Items */}
                    {!collapsed &&
                      item.children &&
                      expandedItems[item.id] && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.path}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                isActive(child.path)
                                  ? 'bg-blue-600/50 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && metadata && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800/50 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {metadata.userId.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{metadata.role}</p>
              <p className="text-xs text-gray-400 truncate">
                {metadata.tenantSlug}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default DynamicSidebar;
