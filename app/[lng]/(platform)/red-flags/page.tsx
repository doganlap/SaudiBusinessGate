"use client";
import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Filter, Search, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import RedFlagsCard from '@/components/RedFlagsCard';

interface RedFlag {
  id: string;
  tenantId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high';
  sourceTable: string;
  sourceId: string;
  eventData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
  detectedAt: string;
  processedAt?: string;
  assignedTo?: string;
  notes?: string;
}

interface RedFlagsStats {
  total: number;
  pending: number;
  investigating: number;
  approved: number;
  rejected: number;
  high: number;
  medium: number;
  low: number;
}

export default function RedFlagsPage({ params }: { params: Promise<{ lng: string }> }) {
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [stats, setStats] = useState<RedFlagsStats>({
    total: 0, pending: 0, investigating: 0, approved: 0, rejected: 0,
    high: 0, medium: 0, low: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    eventType: '',
    search: ''
  });

  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'الأعلام الحمراء',
      subtitle: 'نظام كشف الأنماط المشبوهة والمعاملات غير العادية',
      totalFlags: 'إجمالي الأعلام',
      pending: 'معلق',
      investigating: 'قيد التحقيق',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      filters: 'المرشحات',
      allStatuses: 'جميع الحالات',
      allSeverities: 'جميع المستويات',
      allTypes: 'جميع الأنواع',
      search: 'البحث...',
      refresh: 'تحديث',
      export: 'تصدير',
      noFlags: 'لا توجد أعلام حمراء',
      noFlagsDesc: 'لم يتم اكتشاف أي أنماط مشبوهة حتى الآن',
      eventTypes: {
        large_transaction: 'معاملة كبيرة',
        duplicate_payment: 'دفع مكرر',
        round_amount: 'مبلغ مدور',
        unusual_time: 'وقت غير عادي',
        budget_overrun: 'تجاوز الميزانية',
        rapid_transactions: 'معاملات سريعة'
      }
    },
    en: {
      title: 'Red Flags',
      subtitle: 'Suspicious pattern detection and unusual transaction monitoring',
      totalFlags: 'Total Flags',
      pending: 'Pending',
      investigating: 'Investigating',
      approved: 'Approved',
      rejected: 'Rejected',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      filters: 'Filters',
      allStatuses: 'All Statuses',
      allSeverities: 'All Severities',
      allTypes: 'All Types',
      search: 'Search...',
      refresh: 'Refresh',
      export: 'Export',
      noFlags: 'No Red Flags',
      noFlagsDesc: 'No suspicious patterns detected yet',
      eventTypes: {
        large_transaction: 'Large Transaction',
        duplicate_payment: 'Duplicate Payment',
        round_amount: 'Round Amount',
        unusual_time: 'Unusual Time',
        budget_overrun: 'Budget Overrun',
        rapid_transactions: 'Rapid Transactions'
      }
    }
  }[locale];

  useEffect(() => {
    fetchRedFlags();
  }, [filters]);

  const fetchRedFlags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.eventType) params.append('eventType', filters.eventType);

      const response = await fetch(`/api/red-flags?${params.toString()}`, {
        headers: {
          'x-tenant-id': 'demo-tenant'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setRedFlags(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch red flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/red-flags?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        fetchRedFlags(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update red flag:', error);
    }
  };

  const filteredRedFlags = redFlags.filter(flag => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        flag.sourceId.toLowerCase().includes(searchTerm) ||
        flag.eventType.toLowerCase().includes(searchTerm) ||
        (flag.eventData.description && flag.eventData.description.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalFlags}
            value={stats.total}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.pending}
            value={stats.pending}
            icon={<Shield className="h-6 w-6" />}
            color="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200 text-orange-700"
          />
          <StatCard
            title={t.investigating}
            value={stats.investigating}
            icon={<Eye className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.high}
            value={stats.high}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200 text-red-700"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t.filters}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allStatuses}</option>
              <option value="pending">{t.pending}</option>
              <option value="investigating">{t.investigating}</option>
              <option value="approved">{t.approved}</option>
              <option value="rejected">{t.rejected}</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allSeverities}</option>
              <option value="high">{t.high}</option>
              <option value="medium">{t.medium}</option>
              <option value="low">{t.low}</option>
            </select>

            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allTypes}</option>
              {Object.entries(t.eventTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
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
              onClick={fetchRedFlags}
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

        {/* Red Flags List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredRedFlags.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {t.noFlags}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t.noFlagsDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRedFlags.map((redFlag, index) => (
              <motion.div
                key={redFlag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RedFlagsCard
                  redFlag={redFlag}
                  onStatusChange={handleStatusChange}
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
