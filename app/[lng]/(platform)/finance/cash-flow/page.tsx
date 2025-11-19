'use client';

import React from 'react';
import { CashFlowStatement } from '@/components/finance/CashFlowStatement';

export default function CashFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <CashFlowStatement />
    </div>
  );
}

