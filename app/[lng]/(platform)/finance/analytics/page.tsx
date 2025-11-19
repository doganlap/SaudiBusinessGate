import { Suspense } from 'react';
import { FinanceLoading } from '@/components/finance/FinanceLoading';
import { FinancialAnalytics } from '@/components/finance/FinancialAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced financial analysis and insights
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <FinancialAnalytics />
      </Suspense>
    </div>
  );
}

