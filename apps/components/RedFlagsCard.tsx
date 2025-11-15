"use client";
import { useState } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle2, XCircle, Eye, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface RedFlagsCardProps {
  redFlag: RedFlag;
  onStatusChange?: (id: string, status: string, notes?: string) => void;
  locale?: 'ar' | 'en';
}

export default function RedFlagsCard({ redFlag, onStatusChange, locale = 'ar' }: RedFlagsCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(redFlag.notes || '');

  const t = {
    ar: {
      pending: 'معلق',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      investigating: 'قيد التحقيق',
      approve: 'موافقة',
      reject: 'رفض',
      investigate: 'تحقيق',
      details: 'التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      amount: 'المبلغ',
      currency: 'العملة',
      detectedAt: 'تم اكتشافه في',
      processedAt: 'تم معالجته في',
      assignedTo: 'مُعيّن إلى',
      notes: 'الملاحظات',
      addNotes: 'إضافة ملاحظات',
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
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      investigating: 'Investigating',
      approve: 'Approve',
      reject: 'Reject',
      investigate: 'Investigate',
      details: 'Details',
      hideDetails: 'Hide Details',
      amount: 'Amount',
      currency: 'Currency',
      detectedAt: 'Detected At',
      processedAt: 'Processed At',
      assignedTo: 'Assigned To',
      notes: 'Notes',
      addNotes: 'Add Notes',
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'investigating': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Shield className="h-5 w-5" />;
      case 'low': return <Eye className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'investigating': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(redFlag.id, newStatus, notes);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatAmount = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getSeverityColor(redFlag.severity)}`}>
            {getSeverityIcon(redFlag.severity)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {t.eventTypes[redFlag.eventType as keyof typeof t.eventTypes] || redFlag.eventType}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              ID: {redFlag.sourceId}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(redFlag.status)}`}>
          {getStatusIcon(redFlag.status)}
          <span>{t[redFlag.status as keyof typeof t]}</span>
        </div>
      </div>

      {/* Amount (if available) */}
      {redFlag.eventData.amount && (
        <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatAmount(redFlag.eventData.amount, redFlag.eventData.currency)}
          </div>
          {redFlag.eventData.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {redFlag.eventData.description}
            </p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(redFlag.detectedAt)}</span>
        </div>
        {redFlag.assignedTo && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <User className="h-4 w-4" />
            <span>{redFlag.assignedTo}</span>
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
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <strong>Event Data:</strong>
          </div>
          <pre className="text-xs bg-white dark:bg-neutral-900 p-2 rounded border overflow-x-auto">
            {JSON.stringify(redFlag.eventData, null, 2)}
          </pre>
          
          {redFlag.processedAt && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              <strong>{t.processedAt}:</strong> {formatDate(redFlag.processedAt)}
            </div>
          )}
        </motion.div>
      )}

      {/* Notes */}
      {(redFlag.notes || redFlag.status === 'pending') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t.notes}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.addNotes}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
            rows={2}
            disabled={redFlag.status !== 'pending'}
          />
        </div>
      )}

      {/* Actions */}
      {redFlag.status === 'pending' && onStatusChange && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange('approved')}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t.approve}
          </button>
          <button
            onClick={() => handleStatusChange('investigating')}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {t.investigate}
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            {t.reject}
          </button>
        </div>
      )}
    </motion.div>
  );
}
