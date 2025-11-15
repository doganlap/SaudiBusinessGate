'use client';

/**
 * DYNAMIC NAVIGATION SYSTEM
 * Automatically generates navigation from API_MASTER_TRACKING_TABLE.csv
 * Updates in real-time based on available APIs and user permissions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface NavItem {
    id: string;
    module: string;
    label: string;
    path: string;
    icon: string;
    badge?: number;
    children?: NavItem[];
}

interface NavigationData {
    modules: string[];
    items: NavItem[];
    stats: {
        totalAPIs: number;
        availableAPIs: number;
        modules: number;
    };
}

export default function DynamicNavigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [navigation, setNavigation] = useState<NavigationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        loadNavigation();
    }, []);

    const loadNavigation = async () => {
        try {
            const response = await fetch('/api/navigation/dynamic');
            if (response.ok) {
                const data = await response.json();
                setNavigation(data);
            }
        } catch (error) {
            console.error('Failed to load navigation:', error);
        } finally {
            setLoading(false);
        }
    };

    const getModuleIcon = (module: string) => {
        const icons: Record<string, string> = {
            'Dashboard': '??',
            'Analytics': '??',
            'Reports': '??',
            'Finance': '??',
            'CRM': '??',
            'Billing': '??',
            'License': '??',
            'GRC': '???',
            'HR': '??',
            'AI': '??',
            'Integrations': '??',
            'Themes': '??',
            'Platform': '??',
            'Workflows': '??',
            'Payment': '??',
            'Authentication': '??',
        };
        return icons[module] || '??';
    };

    if (loading) {
        return (
            <nav className="w-64 bg-gray-900 text-white h-screen p-4">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-gray-700 rounded"></div>
                    ))}
                </div>
            </nav>
        );
    }

    if (!navigation) {
        return null;
    }

    return (
        <nav className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen transition-all duration-300 ${
            collapsed ? 'w-20' : 'w-64'
        } flex flex-col shadow-2xl`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                DoganHub
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                {navigation.stats.availableAPIs}/{navigation.stats.totalAPIs} APIs
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {collapsed ? '?' : '?'}
                    </button>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {navigation.items.map((item) => {
                    const isActive = pathname?.startsWith(item.path);
                    
                    return (
                        <div key={item.id}>
                            <Link
                                href={item.path}
                                className={`
                                    flex items-center space-x-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-primary-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                                `}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="flex-1 font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Link>

                            {/* Sub-items */}
                            {!collapsed && item.children && item.children.length > 0 && (
                                <div className="ml-6 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={child.path}
                                            className={`
                                                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                                                transition-colors
                                                ${pathname === child.path
                                                    ? 'bg-gray-700 text-white'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            <span>•</span>
                                            <span>{child.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                {!collapsed && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Modules</span>
                            <span className="font-semibold text-primary-400">{navigation.stats.modules}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Health</span>
                            <span className={`font-semibold ${
                                (navigation.stats.availableAPIs / navigation.stats.totalAPIs) * 100 >= 80
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                            }`}>
                                {Math.round((navigation.stats.availableAPIs / navigation.stats.totalAPIs) * 100)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
