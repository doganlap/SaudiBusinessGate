"use client";

import { Suspense } from 'react';
import { TaxManager } from '@/components/finance/TaxManager';
import { FinanceLoading } from '@/components/finance/FinanceLoading';

export default function FinanceTaxPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          الضرائب
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          زكاة، VAT، ونماذج الضرائب
        </p>
      </div>
      
      <Suspense fallback={<FinanceLoading />}>
        <TaxManager />
      </Suspense>
    </div>
  );
}