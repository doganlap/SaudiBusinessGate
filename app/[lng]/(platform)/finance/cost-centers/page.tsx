import { Suspense } from 'react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';
import { CostCentersManager } from '@/components/finance/CostCentersManager';

export default function CostCentersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cost Centers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track expenses by department and cost centers
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <CostCentersManager />
      </Suspense>
    </div>
  );
}

