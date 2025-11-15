'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const financeModules = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Financial overview and key metrics',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    bgColor: 'bg-blue-500'
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: Building2,
    description: 'Chart of accounts management',
    color: 'bg-green-50 border-green-200 text-green-700',
    bgColor: 'bg-green-500'
  },
  {
    name: 'Accounts Payable',
    href: '/accounts-payable',
    icon: CreditCard,
    description: 'Manage vendor payments and bills',
    color: 'bg-red-50 border-red-200 text-red-700',
    bgColor: 'bg-red-500'
  },
  {
    name: 'Accounts Receivable',
    href: '/accounts-receivable',
    icon: Receipt,
    description: 'Manage customer invoices and payments',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    bgColor: 'bg-purple-500'
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: PiggyBank,
    description: 'Budget planning and expense tracking',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    bgColor: 'bg-yellow-500'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowRightLeft,
    description: 'Transaction history and management',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    bgColor: 'bg-indigo-500'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Financial reports and analytics',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    bgColor: 'bg-gray-500'
  },
  {
    name: 'Cost Centers',
    href: '/cost-centers',
    icon: Calculator,
    description: 'Cost center management and allocation',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    bgColor: 'bg-teal-500'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Financial analytics and insights',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    bgColor: 'bg-orange-500'
  },
  {
    name: 'Acceptance',
    href: '/acceptance',
    icon: CheckCircle,
    description: 'Transaction approval and acceptance',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    bgColor: 'bg-emerald-500'
  }
];

export default function FinancePage() {
  const params = useParams();
  const lng = params.lng as string;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive financial management system for enterprise operations
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
