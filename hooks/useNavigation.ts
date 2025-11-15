/**
 * useNavigation Hook
 * Fetch and manage dynamic navigation for authenticated users
 */

'use client';

import { useEffect, useState } from 'react';
import { NavigationGroup, NavigationItem } from '@/lib/routing/NavigationGenerator';

interface NavigationData {
  navigation: NavigationGroup[];
  flatNavigation: NavigationItem[];
  userMenu: NavigationItem[];
  quickActions: NavigationItem[];
  metadata: {
    tenantId: string;
    tenantSlug: string;
    userId: string;
    role: string;
    roleLevel: number;
    subscriptionTier: string;
    isWhiteLabel: boolean;
    isReseller: boolean;
    enabledModules: string[];
  };
}

interface UseNavigationReturn {
  navigation: NavigationGroup[];
  flatNavigation: NavigationItem[];
  userMenu: NavigationItem[];
  quickActions: NavigationItem[];
  metadata: NavigationData['metadata'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNavigation(): UseNavigationReturn {
  const [data, setData] = useState<NavigationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNavigation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from localStorage or cookie
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/navigation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch navigation: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load navigation');
      }

      setData(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load navigation';
      setError(errorMessage);
      console.error('Navigation fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  return {
    navigation: data?.navigation || [],
    flatNavigation: data?.flatNavigation || [],
    userMenu: data?.userMenu || [],
    quickActions: data?.quickActions || [],
    metadata: data?.metadata || null,
    isLoading,
    error,
    refetch: fetchNavigation,
  };
}

/**
 * Hook to get current user's accessible modules
 */
export function useEnabledModules(): string[] {
  const { metadata } = useNavigation();
  return metadata?.enabledModules || [];
}

/**
 * Hook to check if user can access a specific module
 */
export function useCanAccessModule(module: string): boolean {
  const enabledModules = useEnabledModules();
  return enabledModules.includes(module);
}

/**
 * Hook to get user's subscription tier
 */
export function useSubscriptionTier(): string | null {
  const { metadata } = useNavigation();
  return metadata?.subscriptionTier || null;
}

export default useNavigation;
