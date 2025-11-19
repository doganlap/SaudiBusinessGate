"use client";

import { Suspense } from 'react';
import { BankingManager } from '@/components/finance/BankingManager';
import { FinanceLoading } from '@/components/finance/FinanceLoading';

export default function FinanceBankingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          الخدمات البنكية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          حسابات، معاملات، ومطابقة بنكية
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <BankingManager />
      </Suspense>
    </div>
  );
}