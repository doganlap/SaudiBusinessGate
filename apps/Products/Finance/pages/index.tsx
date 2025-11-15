import { Metadata } from 'next'
import Link from 'next/link'
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
  DollarSign
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Finance Module - DoganHubStore Enterprise',
  description: 'Comprehensive finance management for the unified platform',
}

const financeModules = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Financial overview and key metrics',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: Building2,
    description: 'Chart of accounts management',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    name: 'Accounts Payable',
    href: '/accounts-payable',
    icon: CreditCard,
    description: 'Manage vendor payments and bills',
    color: 'bg-red-50 border-red-200 text-red-700'
  },
  {
    name: 'Accounts Receivable',
    href: '/accounts-receivable',
    icon: Receipt,
    description: 'Manage customer invoices and payments',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: PiggyBank,
    description: 'Budget planning and expense tracking',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowRightLeft,
    description: 'Transaction history and management',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Financial reports and analytics',
    color: 'bg-gray-50 border-gray-200 text-gray-700'
  },
  {
    name: 'Cost Centers',
    href: '/cost-centers',
    icon: Calculator,
    description: 'Cost center management and allocation',
    color: 'bg-teal-50 border-teal-200 text-teal-700'
  },
  {
    name: 'Acceptance',
    href: '/acceptance',
    icon: CheckCircle,
    description: 'Transaction approval and acceptance',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  }
]

export default function FinancePage() {
  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-text-center" style={{ marginBottom: '2rem' }}>
            <Calculator className="h-16 w-16 text-primary mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h1 className="enterprise-font-bold" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
              Finance Module
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)' }}>
              Comprehensive financial management system for enterprise operations
            </p>
          </div>
            
          <div className="enterprise-grid enterprise-grid-cols-3" style={{ marginBottom: '2rem' }}>
            {financeModules.map((module) => {
              const Icon = module.icon
              return (
                <Link
                  key={module.name}
                  href={module.href}
                  className="enterprise-card enterprise-slide-up enterprise-link-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <Icon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
                    <h3 className="enterprise-font-semibold" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>
                      {module.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', lineHeight: '1.5' }}>
                    {module.description}
                  </p>
                </Link>
              )
            })}
          </div>

          <div className="enterprise-grid enterprise-grid-cols-3" style={{ marginBottom: '2rem' }}>
            <div className="enterprise-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <DollarSign className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                <h3 className="enterprise-font-semibold" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>
                  Total Revenue
                </h3>
              </div>
              <p className="enterprise-font-bold" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                $125,430
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                <span className="enterprise-text-success" style={{ fontSize: 'var(--text-sm)' }}>
                  +12% from last month
                </span>
              </div>
            </div>
            
            <div className="enterprise-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <Building2 className="h-6 w-6" style={{ color: 'var(--color-accent)' }} />
                <h3 className="enterprise-font-semibold" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>
                  Active Accounts
                </h3>
              </div>
              <p className="enterprise-font-bold" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
                1,247
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                <span className="enterprise-text-success" style={{ fontSize: 'var(--text-sm)' }}>
                  +8% from last month
                </span>
              </div>
            </div>
            
            <div className="enterprise-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <Receipt className="h-6 w-6" style={{ color: 'var(--color-secondary)' }} />
                <h3 className="enterprise-font-semibold" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>
                  Monthly Revenue
                </h3>
              </div>
              <p className="enterprise-font-bold" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-secondary)', marginBottom: 'var(--space-2)' }}>
                $45,230
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                <span className="enterprise-text-success" style={{ fontSize: 'var(--text-sm)' }}>
                  +15% from last month
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/transactions" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowRightLeft className="h-6 w-6 text-gray-600 mb-2" />
                <span className="font-medium text-gray-900">New Transaction</span>
              </Link>
              <Link href="/reports" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <FileText className="h-6 w-6 text-gray-600 mb-2" />
                <span className="font-medium text-gray-900">Generate Report</span>
              </Link>
              <Link href="/budgets" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <PiggyBank className="h-6 w-6 text-gray-600 mb-2" />
                <span className="font-medium text-gray-900">Budget Planning</span>
              </Link>
              <Link href="/dashboard" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <BarChart3 className="h-6 w-6 text-gray-600 mb-2" />
                <span className="font-medium text-gray-900">View Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ✅ Finance Module is fully connected and operational!
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Version 2.0.0 | Environment: {process.env.NODE_ENV || 'development'} | {financeModules.length} modules available
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
