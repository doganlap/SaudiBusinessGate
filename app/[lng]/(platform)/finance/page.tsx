'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { t } from '@/lib/i18n';
import { 
  Calculator, 
  CreditCard, 
  Receipt, 
  PiggyBank, 
  ArrowRightLeft, 
  FileText, 
  Building2,
  CheckCircle,
  BarChart3,
  TrendingUp,
  DollarSign,
  ChevronRight
} from 'lucide-react';

// Finance modules with i18n keys matching the documented routes in docs/PAGES.md
const getFinanceModules = (lng: string) => [
  {
    key: 'dashboard',
    name: t('finance.dashboard', lng as any),
    href: '/dashboard',
    icon: BarChart3,
    description: t('finance.dashboardDesc', lng as any),
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    bgColor: 'bg-blue-500'
  },
  {
    key: 'accounts',
    name: t('finance.accounts', lng as any),
    href: '/accounts',
    icon: Building2,
    description: t('finance.accountsDesc', lng as any),
    color: 'bg-green-50 border-green-200 text-green-700',
    bgColor: 'bg-green-500'
  },
  {
    key: 'budgets',
    name: t('finance.budgets', lng as any),
    href: '/budgets',
    icon: PiggyBank,
    description: t('finance.budgetsDesc', lng as any),
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    bgColor: 'bg-yellow-500'
  },
  {
    key: 'transactions',
    name: t('finance.transactions', lng as any),
    href: '/transactions',
    icon: ArrowRightLeft,
    description: t('finance.transactionsDesc', lng as any),
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    bgColor: 'bg-indigo-500'
  },
  {
    key: 'reports',
    name: t('finance.reports', lng as any),
    href: '/reports',
    icon: FileText,
    description: t('finance.reportsDesc', lng as any),
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    bgColor: 'bg-gray-500'
  },
  {
    key: 'analytics',
    name: t('finance.analytics', lng as any),
    href: '/analytics',
    icon: TrendingUp,
    description: t('finance.analyticsDesc', lng as any),
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    bgColor: 'bg-orange-500'
  },
  {
    key: 'banking',
    name: t('finance.banking', lng as any),
    href: '/banking',
    icon: CreditCard,
    description: t('finance.bankingDesc', lng as any),
    color: 'bg-red-50 border-red-200 text-red-700',
    bgColor: 'bg-red-500'
  },
  {
    key: 'cashFlow',
    name: t('finance.cashFlow', lng as any),
    href: '/cash-flow',
    icon: DollarSign,
    description: t('finance.cashFlowDesc', lng as any),
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    bgColor: 'bg-cyan-500'
  },
  {
    key: 'costCenters',
    name: t('finance.costCenters', lng as any),
    href: '/cost-centers',
    icon: Calculator,
    description: t('finance.costCentersDesc', lng as any),
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    bgColor: 'bg-teal-500'
  }
];

export default function FinancePage() {
  const params = useParams();
  const lng = params.lng as string;
  const financeModules = getFinanceModules(lng);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('finance.title', lng as any)}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('finance.description', lng as any)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$125,000</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accounts Payable</p>
                <p className="text-2xl font-bold text-gray-900">$45,000</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accounts Receivable</p>
                <p className="text-2xl font-bold text-gray-900">$78,000</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">$32,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Finance Modules Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Finance Modules</h2>
            <p className="text-sm text-gray-600">Access all financial management tools</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financeModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link
                    key={module.name}
                    href={`/${lng}/finance${module.href}`}
                    className="group p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg ${module.bgColor} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
