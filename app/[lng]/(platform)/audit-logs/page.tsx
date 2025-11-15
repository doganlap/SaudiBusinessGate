"use client";
import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Eye, Calendar, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  tenantId: string;
}

export default function AuditLogsPage({ params }: { params: Promise<{ lng: string }> }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'سجلات التدقيق',
      subtitle: 'مراقبة وتتبع جميع أنشطة النظام',
      totalLogs: 'إجمالي السجلات',
      todayLogs: 'سجلات اليوم',
      failedActions: 'الإجراءات الفاشلة',
      uniqueUsers: 'المستخدمون الفريدون',
      filters: 'المرشحات',
      allActions: 'جميع الإجراءات',
      allStatuses: 'جميع الحالات',
      allUsers: 'جميع المستخدمين',
      dateFrom: 'من تاريخ',
      dateTo: 'إلى تاريخ',
      search: 'البحث...',
      export: 'تصدير',
      viewDetails: 'عرض التفاصيل',
      timestamp: 'الوقت',
      user: 'المستخدم',
      action: 'الإجراء',
      resource: 'المورد',
      status: 'الحالة',
      ipAddress: 'عنوان IP',
      success: 'نجح',
      failed: 'فشل',
      warning: 'تحذير',
      noLogs: 'لا توجد سجلات',
      noLogsDesc: 'لم يتم العثور على سجلات تدقيق'
    },
    en: {
      title: 'Audit Logs',
      subtitle: 'Monitor and track all system activities',
      totalLogs: 'Total Logs',
      todayLogs: 'Today\'s Logs',
      failedActions: 'Failed Actions',
      uniqueUsers: 'Unique Users',
      filters: 'Filters',
      allActions: 'All Actions',
      allStatuses: 'All Statuses',
      allUsers: 'All Users',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      search: 'Search...',
      export: 'Export',
      viewDetails: 'View Details',
      timestamp: 'Timestamp',
      user: 'User',
      action: 'Action',
      resource: 'Resource',
      status: 'Status',
      ipAddress: 'IP Address',
      success: 'Success',
      failed: 'Failed',
      warning: 'Warning',
      noLogs: 'No Logs',
      noLogsDesc: 'No audit logs found'
    }
  }[locale];

  // Mock audit logs data
  const mockLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      userId: 'user-1',
      userName: 'أحمد محمد',
      action: 'LOGIN',
      resource: 'Authentication',
      resourceId: 'auth-session-123',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      tenantId: 'demo-tenant'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      userId: 'user-2',
      userName: 'فاطمة علي',
      action: 'CREATE_LICENSE',
      resource: 'License',
      resourceId: 'lic-456',
      details: 'Created new professional license',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      tenantId: 'demo-tenant'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: 'user-3',
      userName: 'محمد سالم',
      action: 'DELETE_USER',
      resource: 'User',
      resourceId: 'user-789',
      details: 'Attempted to delete user without permission',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      status: 'failed',
      tenantId: 'demo-tenant'
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      userId: 'user-1',
      userName: 'أحمد محمد',
      action: 'UPDATE_RED_FLAG',
      resource: 'RedFlag',
      resourceId: 'rf-101',
      details: 'Updated red flag status to approved',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      tenantId: 'demo-tenant'
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'user-4',
      userName: 'سارة أحمد',
      action: 'EXPORT_DATA',
      resource: 'AuditLogs',
      resourceId: 'export-202',
      details: 'Exported audit logs for compliance review',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'warning',
      tenantId: 'demo-tenant'
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <User className="h-4 w-4" />;
      case 'CREATE_LICENSE': return <Shield className="h-4 w-4" />;
      case 'DELETE_USER': return <User className="h-4 w-4" />;
      case 'UPDATE_RED_FLAG': return <Activity className="h-4 w-4" />;
      case 'EXPORT_DATA': return <Download className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        log.userName.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.resource.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  }).filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.userId && log.userId !== filters.userId) return false;
    return true;
  });

  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date().toDateString();
      return new Date(log.timestamp).toDateString() === today;
    }).length,
    failed: logs.filter(log => log.status === 'failed').length,
    uniqueUsers: new Set(logs.map(log => log.userId)).size
  };

  const StatCard = ({ title, value, icon, color }: any) => (
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalLogs}
            value={stats.total}
            icon={<Activity className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.todayLogs}
            value={stats.today}
            icon={<Calendar className="h-6 w-6" />}
            color="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 text-green-700"
          />
          <StatCard
            title={t.failedActions}
            value={stats.failed}
            icon={<Shield className="h-6 w-6" />}
            color="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200 text-red-700"
          />
          <StatCard
            title={t.uniqueUsers}
            value={stats.uniqueUsers}
            icon={<User className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 text-purple-700"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t.filters}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allActions}</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE_LICENSE">CREATE_LICENSE</option>
              <option value="DELETE_USER">DELETE_USER</option>
              <option value="UPDATE_RED_FLAG">UPDATE_RED_FLAG</option>
              <option value="EXPORT_DATA">EXPORT_DATA</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">{t.allStatuses}</option>
              <option value="success">{t.success}</option>
              <option value="failed">{t.failed}</option>
              <option value="warning">{t.warning}</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              placeholder={t.dateFrom}
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              placeholder={t.dateTo}
            />

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

            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
              <Download className="h-4 w-4" />
              {t.export}
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {t.noLogs}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.noLogsDesc}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.timestamp}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.user}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.action}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.resource}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {t.ipAddress}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {new Date(log.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {log.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {t[log.status as keyof typeof t]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {t.viewDetails}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
