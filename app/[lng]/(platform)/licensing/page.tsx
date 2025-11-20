"use client";
import { useState, useEffect } from 'react';
import { Crown, Users, HardDrive, Plus, Filter, Search, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LicenseCard from '@/components/LicenseCard';

interface License {
  id: string;
  userId: string;
  tenantId: string;
  licenseTypeId: string;
  licenseKey: string;
  type: 'basic' | 'professional' | 'enterprise' | 'owner';
  status: 'active' | 'expired' | 'suspended' | 'cancelled' | 'trial';
  startDate: string;
  endDate?: string;
  isOwner: boolean;
  currentUsers: number;
  maxUsers?: number;
  currentStorage: number;
  maxStorage?: number;
  monthlyCost: number;
  annualCost: number;
  features: string[];
  billingCycle: 'monthly' | 'annual' | 'one-time';
  autoRenew: boolean;
  trialDays?: number;
  usageStats: {
    transactions: number;
    apiCalls: number;
    storageUsed: number;
  };
}

interface LicenseStats {
  total: number;
  active: number;
  trial: number;
  expired: number;
  suspended: number;
  totalUsers: number;
  totalCost: number;
  storageUsed: number;
}

export default function LicensingPage({ params }: { params: Promise<{ lng: string }> }) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<LicenseStats>({
    total: 0, active: 0, trial: 0, expired: 0, suspended: 0,
    totalUsers: 0, totalCost: 0, storageUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  // Fallback demo data
  const fallbackLicenses: License[] = [
    {
      id: 'demo-1',
      userId: 'user-1',
      tenantId: 'demo-tenant',
      licenseTypeId: 'basic',
      licenseKey: 'DEMO-BASIC-001',
      type: 'basic',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2025-01-01T00:00:00Z',
      isOwner: false,
      currentUsers: 5,
      maxUsers: 10,
      currentStorage: 500,
      maxStorage: 1000,
      monthlyCost: 29.99,
      annualCost: 299.99,
      features: ['Basic Support', '5 Users', '1GB Storage'],
      billingCycle: 'monthly',
      autoRenew: true,
      trialDays: 14,
      usageStats: {
        transactions: 1250,
        apiCalls: 5000,
        storageUsed: 500
      }
    },
    {
      id: 'demo-2',
      userId: 'user-2',
      tenantId: 'demo-tenant',
      licenseTypeId: 'professional',
      licenseKey: 'DEMO-PRO-001',
      type: 'professional',
      status: 'trial',
      startDate: '2024-11-01T00:00:00Z',
      endDate: '2024-11-15T00:00:00Z',
      isOwner: false,
      currentUsers: 2,
      maxUsers: 50,
      currentStorage: 2500,
      maxStorage: 5000,
      monthlyCost: 99.99,
      annualCost: 999.99,
      features: ['Priority Support', '50 Users', '5GB Storage', 'Advanced Analytics'],
      billingCycle: 'annual',
      autoRenew: false,
      trialDays: 14,
      usageStats: {
        transactions: 500,
        apiCalls: 2000,
        storageUsed: 2500
      }
    }
  ];

  const fallbackStats: LicenseStats = {
    total: 2,
    active: 1,
    trial: 1,
    expired: 0,
    suspended: 0,
    totalUsers: 7,
    totalCost: 129.98,
    storageUsed: 3000
  };

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'إدارة التراخيص',
      subtitle: 'إدارة تراخيص المستخدمين والاشتراكات والصلاحيات',
      totalLicenses: 'إجمالي التراخيص',
      activeLicenses: 'التراخيص النشطة',
      trialLicenses: 'التراخيص التجريبية',
      totalUsers: 'إجمالي المستخدمين',
      totalCost: 'التكلفة الإجمالية',
      storageUsed: 'التخزين المستخدم',
      filters: 'المرشحات',
      allTypes: 'جميع الأنواع',
      allStatuses: 'جميع الحالات',
      search: 'البحث...',
      addLicense: 'إضافة ترخيص',
      refresh: 'تحديث',
      export: 'تصدير',
      noLicenses: 'لا توجد تراخيص',
      noLicensesDesc: 'لم يتم إنشاء أي تراخيص حتى الآن',
      basic: 'أساسي',
      professional: 'احترافي',
      enterprise: 'مؤسسي',
      owner: 'مالك',
      active: 'نشط',
      expired: 'منتهي الصلاحية',
      suspended: 'معلق',
      cancelled: 'ملغي',
      trial: 'تجريبي'
    },
    en: {
      title: 'License Management',
      subtitle: 'Manage user licenses, subscriptions, and permissions',
      totalLicenses: 'Total Licenses',
      activeLicenses: 'Active Licenses',
      trialLicenses: 'Trial Licenses',
      totalUsers: 'Total Users',
      totalCost: 'Total Cost',
      storageUsed: 'Storage Used',
      filters: 'Filters',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      search: 'Search...',
      addLicense: 'Add License',
      refresh: 'Refresh',
      export: 'Export',
      noLicenses: 'No Licenses',
      noLicensesDesc: 'No licenses have been created yet',
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
      owner: 'Owner',
      active: 'Active',
      expired: 'Expired',
      suspended: 'Suspended',
      cancelled: 'Cancelled',
      trial: 'Trial'
    }
  }[locale];

  useEffect(() => {
    fetchLicenses();
  }, [filters]);

  const fetchLicenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/licensing?${params.toString()}`, {
        headers: {
          'x-tenant-id': 'demo-tenant'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLicenses(data.data);
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch licenses');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load licenses';
      setError(errorMessage);
      // Use fallback data
      setLicenses(fallbackLicenses);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const response = await fetch(`/api/licensing?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({ action: 'renew' })
      });

      if (response.ok) {
        fetchLicenses();
        alert(locale === 'ar' ? 'تم تجديد الترخيص بنجاح' : 'License renewed successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to renew license:', error);
      alert(locale === 'ar' ? 'فشل في تجديد الترخيص' : 'Failed to renew license');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      const response = await fetch(`/api/licensing?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({ action: 'suspend' })
      });

      if (response.ok) {
        fetchLicenses();
        alert(locale === 'ar' ? 'تم تعليق الترخيص بنجاح' : 'License suspended successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to suspend license:', error);
      alert(locale === 'ar' ? 'فشل في تعليق الترخيص' : 'Failed to suspend license');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا الترخيص؟' : 'Are you sure you want to delete this license?')) return;
    
    try {
      const response = await fetch(`/api/licensing?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': 'demo-tenant'
        }
      });

      if (response.ok) {
        fetchLicenses();
        alert(locale === 'ar' ? 'تم حذف الترخيص بنجاح' : 'License deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete license:', error);
      alert(locale === 'ar' ? 'فشل في حذف الترخيص' : 'Failed to delete license');
    }
  };

  const handleManage = (id: string) => {
    // Navigate to license management page
    console.log('Manage license:', id);
  };

  const filteredLicenses = licenses.filter(license => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        license.licenseKey.toLowerCase().includes(searchTerm) ||
        license.type.toLowerCase().includes(searchTerm) ||
        license.status.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatStorage = (gb: number) => {
    return `${gb.toFixed(1)} GB`;
  };

  const StatCard = ({ title, value, icon, color, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t.subtitle}
            </p>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>{locale === 'ar' ? 'عرض البيانات التجريبية' : 'Showing demo data'}</span>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
            <Plus className="h-4 w-4" />
            {t.addLicense}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalLicenses}
            value={stats.total}
            icon={<Crown className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.activeLicenses}
            value={stats.active}
            icon={<Users className="h-6 w-6" />}
            color="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 text-green-700"
          />
          <StatCard
            title={t.totalUsers}
            value={stats.totalUsers}
            icon={<Users className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 text-purple-700"
          />
          <StatCard
            title={t.totalCost}
            value={formatCurrency(stats.totalCost)}
            subtitle={t.storageUsed + ': ' + formatStorage(stats.storageUsed)}
            icon={<HardDrive className="h-6 w-6" />}
            color="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-200 text-emerald-700"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t.filters}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              aria-label={locale === 'ar' ? 'تصفية حسب نوع الترخيص' : 'Filter by license type'}
            >
              <option value="">{t.allTypes}</option>
              <option value="basic">{t.basic}</option>
              <option value="professional">{t.professional}</option>
              <option value="enterprise">{t.enterprise}</option>
              <option value="owner">{t.owner}</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              aria-label={locale === 'ar' ? 'تصفية حسب حالة الترخيص' : 'Filter by license status'}
            >
              <option value="">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="trial">{t.trial}</option>
              <option value="expired">{t.expired}</option>
              <option value="suspended">{t.suspended}</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder={t.search}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={fetchLicenses}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition">
              <Download className="h-4 w-4" />
              {t.export}
            </button>
          </div>
        </div>

        {/* Licenses List */}
        {error ? (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {locale === 'ar' ? 'خطأ في تحميل التراخيص' : 'Error Loading Licenses'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md mx-auto">
              {error}
            </p>
            <div className="text-sm text-neutral-500 mb-6">
              {locale === 'ar' ? 'يتم عرض البيانات التجريبية. يرجى المحاولة مرة أخرى لتحميل البيانات الحقيقية.' : 'Showing demo data. Please try again to load real data.'}
            </div>
            <button
              onClick={fetchLicenses}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {t.noLicenses}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t.noLicensesDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLicenses.map((license, index) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LicenseCard
                  license={license}
                  onRenew={handleRenew}
                  onSuspend={handleSuspend}
                  onDelete={handleDelete}
                  onManage={handleManage}
                  locale={locale}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
