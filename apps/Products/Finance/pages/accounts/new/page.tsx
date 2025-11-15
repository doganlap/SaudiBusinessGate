'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { EnterpriseForm, formConfigs } from '@/components/enterprise/forms';

const AccountCreationPage: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Account creation submitted:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to accounts list
    router.push('/finance/accounts');
  };

  const handleCancel = () => {
    router.push('/finance/accounts');
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
              Create New Account
            </h1>
            <p className="enterprise-text-gray-600 enterprise-mt-1">
              Add a new account to your chart of accounts
            </p>
          </div>
        </div>

        {/* Account Creation Form */}
        <div className="enterprise-grid enterprise-grid-cols-1 enterprise-lg:enterprise-grid-cols-2 enterprise-gap-8">
          <div>
            <EnterpriseForm
              fields={formConfigs.account.fields}
              onSubmit={handleSubmit}
              submitButtonText="Create Account"
              cancelButtonText="Cancel"
              onCancel={handleCancel}
              className="enterprise-space-y-6"
            />
          </div>

          {/* Form Help Section */}
          <div className="enterprise-space-y-6">
            <div className="enterprise-card enterprise-p-6 enterprise-bg-blue-50 enterprise-border-blue-200">
              <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-blue-900 enterprise-mb-3">
                Account Setup Guide
              </h3>
              <ul className="enterprise-space-y-2 enterprise-text-sm enterprise-text-blue-700">
                <li>• Account names should be descriptive and unique</li>
                <li>• Account numbers follow your organization's numbering system</li>
                <li>• Opening balance represents the initial account value</li>
                <li>• Choose the appropriate account type for proper categorization</li>
              </ul>
            </div>

            <div className="enterprise-card enterprise-p-6 enterprise-bg-gray-50">
              <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900 enterprise-mb-3">
                Account Types
              </h3>
              <div className="enterprise-space-y-3 enterprise-text-sm enterprise-text-gray-700">
                <div>
                  <span className="enterprise-font-medium">Assets:</span> Resources owned by the company
                </div>
                <div>
                  <span className="enterprise-font-medium">Liabilities:</span> Obligations and debts
                </div>
                <div>
                  <span className="enterprise-font-medium">Equity:</span> Owner's investment and retained earnings
                </div>
                <div>
                  <span className="enterprise-font-medium">Revenue:</span> Income from business operations
                </div>
                <div>
                  <span className="enterprise-font-medium">Expenses:</span> Costs incurred in operations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreationPage;