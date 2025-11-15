"use client";
import { useState } from 'react';
import { Crown, Users, HardDrive, Calendar, DollarSign, Settings, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface LicenseCardProps {
  license: License;
  onRenew?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onDelete?: (id: string) => void;
  onManage?: (id: string) => void;
  locale?: 'ar' | 'en';
}

export default function LicenseCard({ 
  license, 
  onRenew, 
  onSuspend, 
  onDelete, 
  onManage, 
  locale = 'ar' 
}: LicenseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const t = {
    ar: {
      active: 'نشط',
      expired: 'منتهي الصلاحية',
      suspended: 'معلق',
      cancelled: 'ملغي',
      trial: 'تجريبي',
      basic: 'أساسي',
      professional: 'احترافي',
      enterprise: 'مؤسسي',
      owner: 'مالك',
      users: 'المستخدمين',
      storage: 'التخزين',
      transactions: 'المعاملات',
      apiCalls: 'استدعاءات API',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ الانتهاء',
      daysLeft: 'يوم متبقي',
      unlimited: 'غير محدود',
      monthly: 'شهري',
      annual: 'سنوي',
      oneTime: 'دفعة واحدة',
      autoRenew: 'تجديد تلقائي',
      features: 'الميزات',
      usage: 'الاستخدام',
      renew: 'تجديد',
      suspend: 'تعليق',
      delete: 'حذف',
      manage: 'إدارة',
      details: 'التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      licenseKey: 'مفتاح الترخيص',
      billingCycle: 'دورة الفوترة',
      cost: 'التكلفة'
    },
    en: {
      active: 'Active',
      expired: 'Expired',
      suspended: 'Suspended',
      cancelled: 'Cancelled',
      trial: 'Trial',
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
      owner: 'Owner',
      users: 'Users',
      storage: 'Storage',
      transactions: 'Transactions',
      apiCalls: 'API Calls',
      startDate: 'Start Date',
      endDate: 'End Date',
      daysLeft: 'days left',
      unlimited: 'Unlimited',
      monthly: 'Monthly',
      annual: 'Annual',
      oneTime: 'One-time',
      autoRenew: 'Auto-renew',
      features: 'Features',
      usage: 'Usage',
      renew: 'Renew',
      suspend: 'Suspend',
      delete: 'Delete',
      manage: 'Manage',
      details: 'Details',
      hideDetails: 'Hide Details',
      licenseKey: 'License Key',
      billingCycle: 'Billing Cycle',
      cost: 'Cost'
    }
  }[locale];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'owner': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'enterprise': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'professional': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'basic': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'trial': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'suspended': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'trial': return <Clock className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'owner': return <Crown className="h-5 w-5" />;
      default: return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const calculateDaysLeft = () => {
    if (!license.endDate) return null;
    const endDate = new Date(license.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatStorage = (gb: number) => {
    return `${gb.toFixed(1)} GB`;
  };

  const getUsagePercentage = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const daysLeft = calculateDaysLeft();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getTypeColor(license.type)}`}>
            {getTypeIcon(license.type)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {t[license.type as keyof typeof t]}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {license.licenseKey}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(license.status)}`}>
          {getStatusIcon(license.status)}
          <span>{t[license.status as keyof typeof t]}</span>
        </div>
      </div>

      {/* Cost */}
      <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {license.billingCycle === 'annual' 
                ? formatCurrency(license.annualCost)
                : license.billingCycle === 'monthly'
                ? formatCurrency(license.monthlyCost)
                : formatCurrency(0)
              }
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t[license.billingCycle as keyof typeof t]}
              {license.autoRenew && ` • ${t.autoRenew}`}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-emerald-600" />
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.users}</span>
            <span className="font-medium">
              {license.currentUsers}{license.maxUsers ? `/${license.maxUsers}` : ` (${t.unlimited})`}
            </span>
          </div>
          {license.maxUsers && (
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(license.currentUsers, license.maxUsers)}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{t.storage}</span>
            <span className="font-medium">
              {formatStorage(license.currentStorage)}{license.maxStorage ? `/${formatStorage(license.maxStorage)}` : ` (${t.unlimited})`}
            </span>
          </div>
          {license.maxStorage && (
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(license.currentStorage, license.maxStorage)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Calendar className="h-4 w-4" />
          <div>
            <div className="font-medium">{t.startDate}</div>
            <div>{formatDate(license.startDate)}</div>
          </div>
        </div>
        {license.endDate && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Calendar className="h-4 w-4" />
            <div>
              <div className="font-medium">{t.endDate}</div>
              <div>{formatDate(license.endDate)}</div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="text-xs text-emerald-600">{daysLeft} {t.daysLeft}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4"
      >
        {showDetails ? t.hideDetails : t.details}
      </button>

      {/* Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
        >
          <div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {t.features}:
            </div>
            <div className="flex flex-wrap gap-1">
              {license.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {t.usage}:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-white dark:bg-neutral-900 rounded">
                <div className="font-medium">{license.usageStats.transactions.toLocaleString()}</div>
                <div className="text-neutral-500">{t.transactions}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-neutral-900 rounded">
                <div className="font-medium">{license.usageStats.apiCalls.toLocaleString()}</div>
                <div className="text-neutral-500">{t.apiCalls}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-neutral-900 rounded">
                <div className="font-medium">{formatStorage(license.usageStats.storageUsed)}</div>
                <div className="text-neutral-500">{t.storage}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onManage && (
          <button
            onClick={() => onManage(license.id)}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t.manage}
          </button>
        )}
        
        {onRenew && license.status !== 'cancelled' && (
          <button
            onClick={() => onRenew(license.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t.renew}
          </button>
        )}
        
        {onSuspend && license.status === 'active' && !license.isOwner && (
          <button
            onClick={() => onSuspend(license.id)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition"
          >
            {t.suspend}
          </button>
        )}
        
        {onDelete && !license.isOwner && (
          <button
            onClick={() => onDelete(license.id)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t.delete}
          </button>
        )}
      </div>
    </motion.div>
  );
}
