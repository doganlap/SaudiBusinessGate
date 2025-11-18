import { User } from '@/src/contexts/UserContext';

export interface NavigationItem {
  id: string;
  title: string;
  titleAr: string;
  href: string;
  icon: string; // Icon component name as string
  description?: string;
  descriptionAr?: string;
  children?: NavigationItem[];
  badge?: string;
  permissions?: string[]; // Required permissions to show this item
  roles?: string[]; // Required roles to show this item
}

export interface NavigationResponse {
  success: boolean;
  data: NavigationItem[];
  message?: string;
}

export class NavigationService {
  private static instance: NavigationService;
  private navigationCache: NavigationResponse | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Fetch navigation items based on user context
   */
  async getNavigation(user?: User): Promise<NavigationItem[]> {
    try {
      // Check if we have valid cached data
      if (this.navigationCache && Date.now() < this.cacheExpiry) {
        return this.filterNavigationByPermissions(this.navigationCache.data, user);
      }

      const response = await fetch('/api/navigation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user?.tenantId || 'default',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Navigation fetch failed: ${response.status}`);
      }

      const data: NavigationResponse = await response.json();
      
      if (data.success && data.data) {
        // Cache the response
        this.navigationCache = data;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        
        return this.filterNavigationByPermissions(data.data, user);
      }
      
      // Fallback to static navigation if API fails
      console.warn('Navigation API failed, using fallback navigation');
      return this.getFallbackNavigation(user);
    } catch (error) {
      console.error('Navigation service error:', error);
      return this.getFallbackNavigation(user);
    }
  }

  /**
   * Filter navigation items based on user permissions and roles
   */
  private filterNavigationByPermissions(items: NavigationItem[], user?: User): NavigationItem[] {
    if (!user) return [];

    return items.filter(item => {
      // Check role-based permissions
      if (item.roles && item.roles.length > 0) {
        if (!item.roles.includes(user.role)) {
          return false;
        }
      }

      // Check permission-based access
      if (item.permissions && item.permissions.length > 0) {
        const hasPermission = item.permissions.some(permission => 
          user.permissions?.includes(permission)
        );
        if (!hasPermission) {
          return false;
        }
      }

      // Filter children recursively
      if (item.children && item.children.length > 0) {
        item.children = this.filterNavigationByPermissions(item.children, user);
        // If all children are filtered out, hide the parent too
        if (item.children.length === 0) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Fallback navigation when API is unavailable
   */
  private getFallbackNavigation(user?: User): NavigationItem[] {
    const baseNavigation: NavigationItem[] = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        titleAr: 'لوحة التحكم',
        href: '/dashboard',
        icon: 'Home',
        description: 'Overview and analytics',
        descriptionAr: 'نظرة عامة والتحليلات'
      },
      {
        id: 'products',
        title: 'Products',
        titleAr: 'المنتجات',
        href: '#',
        icon: 'Package',
        description: 'Business modules',
        descriptionAr: 'وحدات الأعمال',
        children: [
          {
            id: 'finance',
            title: 'Finance',
            titleAr: 'المالية',
            href: '/finance',
            icon: 'DollarSign',
            description: 'Financial management',
            descriptionAr: 'الإدارة المالية'
          },
          {
            id: 'sales',
            title: 'Sales',
            titleAr: 'المبيعات',
            href: '/sales',
            icon: 'TrendingUp',
            description: 'Sales pipeline',
            descriptionAr: 'خط أنابيب المبيعات',
            roles: ['admin', 'sales_manager', 'sales_rep']
          },
          {
            id: 'crm',
            title: 'CRM',
            titleAr: 'إدارة العملاء',
            href: '/crm',
            icon: 'Users',
            description: 'Customer management',
            descriptionAr: 'إدارة العملاء'
          },
          {
            id: 'hr',
            title: 'HR',
            titleAr: 'الموارد البشرية',
            href: '/hr',
            icon: 'UserCheck',
            description: 'Human resources',
            descriptionAr: 'الموارد البشرية'
          },
          {
            id: 'procurement',
            title: 'Procurement',
            titleAr: 'المشتريات',
            href: '/procurement',
            icon: 'Package',
            description: 'Purchase management',
            descriptionAr: 'إدارة المشتريات'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        titleAr: 'الخدمات',
        href: '#',
        icon: 'Zap',
        description: 'Platform services',
        descriptionAr: 'خدمات المنصة',
        children: [
          {
            id: 'billing',
            title: 'Billing',
            titleAr: 'الفوترة',
            href: '/billing',
            icon: 'CreditCard',
            description: 'Subscription management',
            descriptionAr: 'إدارة الاشتراكات'
          },
          {
            id: 'analytics',
            title: 'Analytics',
            titleAr: 'التحليلات',
            href: '/analytics',
            icon: 'BarChart3',
            description: 'Business intelligence',
            descriptionAr: 'ذكاء الأعمال'
          },
          {
            id: 'reporting',
            title: 'Reporting',
            titleAr: 'التقارير',
            href: '/reporting',
            icon: 'FileText',
            description: 'Reports and insights',
            descriptionAr: 'التقارير والرؤى'
          }
        ]
      }
    ];

    // Filter based on user role
    return this.filterNavigationByPermissions(baseNavigation, user);
  }

  /**
   * Clear navigation cache
   */
  clearCache(): void {
    this.navigationCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get navigation item by ID
   */
  async getNavigationItem(id: string, user?: User): Promise<NavigationItem | null> {
    const navigation = await this.getNavigation(user);
    return this.findNavigationItemById(navigation, id);
  }

  private findNavigationItemById(items: NavigationItem[], id: string): NavigationItem | null {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = this.findNavigationItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }
}

export default NavigationService.getInstance();