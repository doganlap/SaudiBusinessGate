'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Calendar, DollarSign } from 'lucide-react';
import { EnterpriseForm, formConfigs } from '@/components/enterprise/forms';

const TransactionCreationPage: React.FC = () => {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense');

  const transactionFields = [
    ...formConfigs.transaction.fields,
    {
      name: 'transactionType',
      label: 'Transaction Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Expense', value: 'expense' },
        { label: 'Income', value: 'income' },
        { label: 'Transfer', value: 'transfer' },
      ],
    },
    {
      name: 'accountId',
      label: 'Account',
      type: 'select',
      required: true,
      options: [
        { label: 'Cash Account', value: 'cash-001' },
        { label: 'Bank Account', value: 'bank-001' },
        { label: 'Credit Card', value: 'credit-001' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Office Supplies', value: 'office-supplies' },
        { label: 'Utilities', value: 'utilities' },
        { label: 'Rent', value: 'rent' },
        { label: 'Salary', value: 'salary' },
        { label: 'Consulting', value: 'consulting' },
      ],
    },
    {
      name: 'reference',
      label: 'Reference Number',
      type: 'text',
      required: false,
      placeholder: 'Optional reference number',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Additional notes about this transaction',
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Transaction creation submitted:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to transactions list
    router.push('/finance/transactions');
  };

  const handleCancel = () => {
    router.push('/finance/transactions');
  };

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        {/* Header */}
        <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-8">
          <button
            onClick={handleCancel}
            className="enterprise-btn enterprise-btn-ghost enterprise-p-2 enterprise-rounded-lg hover:enterprise-bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900">
              Create New Transaction
            </h1>
            <p className="enterprise-text-gray-600 enterprise-mt-1">
              Record a new financial transaction
            </p>
          </div>
        </div>

        {/* Transaction Creation Form */}
        <div className="enterprise-grid enterprise-grid-cols-1 enterprise-lg:enterprise-grid-cols-3 enterprise-gap-8">
          <div className="enterprise-lg:enterprise-col-span-2">
            <EnterpriseForm
              fields={transactionFields}
              onSubmit={handleSubmit}
              submitButtonText="Create Transaction"
              cancelButtonText="Cancel"
              onCancel={handleCancel}
              className="enterprise-space-y-6"
            />
          </div>

          {/* Form Help Section */}
          <div className="enterprise-space-y-6">
            <div className="enterprise-card enterprise-p-6 enterprise-bg-green-50 enterprise-border-green-200">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-3">
                <DollarSign className="h-5 w-5 enterprise-text-green-600" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-green-900">
                  Transaction Tips
                </h3>
              </div>
              <ul className="enterprise-space-y-2 enterprise-text-sm enterprise-text-green-700">
                <li>• Use descriptive transaction descriptions</li>
                <li>• Categorize transactions accurately for better reporting</li>
                <li>• Include reference numbers for easy tracking</li>
                <li>• Add notes for additional context</li>
              </ul>
            </div>

            <div className="enterprise-card enterprise-p-6 enterprise-bg-blue-50 enterprise-border-blue-200">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-3">
                <Calendar className="h-5 w-5 enterprise-text-blue-600" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-blue-900">
                  Transaction Types
                </h3>
              </div>
              <div className="enterprise-space-y-3 enterprise-text-sm enterprise-text-blue-700">
                <div>
                  <span className="enterprise-font-medium">Expense:</span> Money spent on business operations
                </div>
                <div>
                  <span className="enterprise-font-medium">Income:</span> Money received from business activities
                </div>
                <div>
                  <span className="enterprise-font-medium">Transfer:</span> Moving money between accounts
                </div>
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6 enterprise-bg-purple-50 enterprise-border-purple-200">
              <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-purple-900 enterprise-mb-3">
                Quick Actions
              </h3>
              <div className="enterprise-space-y-3 enterprise-text-sm enterprise-text-purple-700">
                <button className="enterprise-btn enterprise-btn-outline enterprise-w-full enterprise-justify-start">
                  Save as Template
                </button>
                <button className="enterprise-btn enterprise-btn-outline enterprise-w-full enterprise-justify-start">
                  Duplicate Last Transaction
                </button>
                <button className="enterprise-btn enterprise-btn-outline enterprise-w-full enterprise-justify-start">
                  Import from File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCreationPage;