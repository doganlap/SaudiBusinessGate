import { Suspense } from 'react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';
import { TaxManager } from '@/components/finance/TaxManager';

export default function TaxPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tax Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tax calculations and compliance
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <TaxManager />
      </Suspense>
    </div>
  );
}