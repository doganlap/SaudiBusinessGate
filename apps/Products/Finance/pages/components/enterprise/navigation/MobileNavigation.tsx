'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CreditCard,
  Receipt,
  PiggyBank,
  ArrowRightLeft,
  FileText,
  Calculator,
  CheckCircle,
  X,
  Home
} from 'lucide-react'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Accounts', href: '/accounts', icon: Building2 },
  { name: 'Payable', href: '/accounts-payable', icon: CreditCard },
  { name: 'Receivable', href: '/accounts-receivable', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Cost Centers', href: '/cost-centers', icon: Calculator },
  { name: 'Acceptance', href: '/acceptance', icon: CheckCircle }
]

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Backdrop */}
      <div
        className="enterprise-fixed enterprise-inset-0 enterprise-bg-black enterprise-bg-opacity-50 enterprise-z-50 enterprise-lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Navigation Panel */}
      <div className="enterprise-fixed enterprise-top-0 enterprise-left-0 enterprise-right-0 enterprise-bottom-0 enterprise-z-50 enterprise-bg-white enterprise-flex enterprise-flex-col enterprise-lg:hidden">
        {/* Header */}
        <div className="enterprise-flex enterprise-items-center enterprise-justify-between enterprise-p-4 enterprise-border-b enterprise-border-gray-200">
          <div className="enterprise-flex enterprise-items-center enterprise-gap-3">
            <Calculator className="enterprise-h-8 enterprise-w-8 enterprise-text-primary" />
            <div>
              <h2 className="enterprise-font-bold enterprise-text-lg enterprise-text-gray-900">Finance</h2>
              <p className="enterprise-text-sm enterprise-text-gray-600">Mobile Navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="enterprise-p-2 enterprise-rounded-lg enterprise-text-gray-600 hover:enterprise-bg-gray-100"
          >
            <X className="enterprise-h-6 enterprise-w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="enterprise-flex-1 enterprise-overflow-y-auto enterprise-p-4">
          <div className="enterprise-space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-p-3 enterprise-rounded-lg enterprise-transition-colors ${
                    active
                      ? 'enterprise-bg-primary enterprise-text-white'
                      : 'enterprise-text-gray-700 hover:enterprise-bg-gray-100'
                  }`}
                >
                  <Icon className="enterprise-h-5 enterprise-w-5 enterprise-flex-shrink-0" />
                  <span className="enterprise-font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="enterprise-p-4 enterprise-border-t enterprise-border-gray-200">
          <div className="enterprise-grid enterprise-grid-cols-2 enterprise-gap-2">
            <button className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-p-3 enterprise-rounded-lg enterprise-text-gray-700 hover:enterprise-bg-gray-100">
              <Calculator className="enterprise-h-5 enterprise-w-5" />
              <span className="enterprise-font-medium">Settings</span>
            </button>
            <button className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-p-3 enterprise-rounded-lg enterprise-text-gray-700 hover:enterprise-bg-gray-100">
              <Calculator className="enterprise-h-5 enterprise-w-5" />
              <span className="enterprise-font-medium">Help</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}