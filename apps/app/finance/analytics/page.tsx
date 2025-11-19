"use client";

import { Suspense } from 'react';
import { FinancialAnalytics } from '@/components/finance/FinancialAnalytics';
import { FinanceLoading } from '@/components/finance/FinanceLoading';

export default function FinanceAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          تحليلات المالية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          لوحات وتحليلات مالية متقدمة
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <FinancialAnalytics />
      </Suspense>
    </div>
  );
}