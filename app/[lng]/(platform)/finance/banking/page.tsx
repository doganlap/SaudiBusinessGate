import { Suspense } from 'react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';
import { BankingManager } from '@/components/finance/BankingManager';

export default function BankingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Banking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bank account reconciliation and management
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <BankingManager />
      </Suspense>
    </div>
  );
}

