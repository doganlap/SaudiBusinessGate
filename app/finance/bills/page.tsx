import { Suspense } from 'react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';
import { BillsManager } from '@/components/finance/BillsManager';

export default function BillsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bills & Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage vendor bills and track payments
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <BillsManager />
      </Suspense>
    </div>
  );
}