import { ReactNode } from 'react';
import { StandardLayout, DashboardLayout, MinimalLayout } from '@/components/layout/StandardLayout';
import { AppShell } from '@/src/components/layout/shell/AppShell';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContentArea } from '@/components/layout/ContentArea';

export interface LayoutComponents {
  AppShell: typeof AppShell;
  StandardLayout: typeof StandardLayout;
  DashboardLayout: typeof DashboardLayout;
  MinimalLayout: typeof MinimalLayout;
  Header: typeof Header;
  Sidebar: typeof Sidebar;
  ContentArea: typeof ContentArea;
}

export interface LayoutConfig {
  type: 'standard' | 'dashboard' | 'minimal' | 'custom';
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  headerHeight?: number;
  sidebarWidth?: number;
  theme?: 'light' | 'dark' | 'auto';
  rtl?: boolean;
}

export interface AppShellContextValue {
  layout: LayoutConfig;
  setLayout: (config: LayoutConfig) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface LayoutProps {
  children: ReactNode;
  config?: LayoutConfig;
  className?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  titleAr?: string;
  href: string;
  icon?: ReactNode;
  children?: NavigationItem[];
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

export interface UserMenuItem {
  id: string;
  title: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  separator?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export type LayoutType = 'standard' | 'dashboard' | 'minimal' | 'custom';
export type LayoutSize = 'compact' | 'normal' | 'spacious';
export type LayoutDensity = 'comfortable' | 'compact' | 'spacious';

export default {
  AppShell,
  StandardLayout,
  DashboardLayout,
  MinimalLayout,
  Header,
  Sidebar,
  ContentArea
};