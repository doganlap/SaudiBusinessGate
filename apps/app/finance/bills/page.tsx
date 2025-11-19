"use client";

import { Suspense } from 'react';
import { BillsManager } from '@/components/finance/BillsManager';
import { FinanceLoading } from '@/components/finance/FinanceLoading';

export default function FinanceBillsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          الفواتير
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          فواتير الموردين وتتبع الدفعات
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <BillsManager />
      </Suspense>
    </div>
  );
}