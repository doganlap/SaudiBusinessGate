'use client'

import React, { useState } from 'react'
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
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Settings,
  User,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  description?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Financial overview and key metrics'
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: Building2,
    description: 'Chart of accounts management',
    children: [
      { name: 'Chart of Accounts', href: '/accounts', icon: Building2 },
      { name: 'Account Groups', href: '/accounts/groups', icon: Building2 },
      { name: 'Account Types', href: '/accounts/types', icon: Building2 }
    ]
  },
  {
    name: 'Accounts Payable',
    href: '/accounts-payable',
    icon: CreditCard,
    description: 'Manage vendor payments and bills'
  },
  {
    name: 'Accounts Receivable',
    href: '/accounts-receivable',
    icon: Receipt,
    description: 'Manage customer invoices and payments'
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: PiggyBank,
    description: 'Budget planning and expense tracking'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowRightLeft,
    description: 'Transaction history and management'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Financial reports and analytics',
    children: [
      { name: 'Financial Statements', href: '/reports/statements', icon: FileText },
      { name: 'Trial Balance', href: '/reports/trial-balance', icon: FileText },
      { name: 'Cash Flow', href: '/reports/cash-flow', icon: FileText },
      { name: 'Profit & Loss', href: '/reports/profit-loss', icon: FileText }
    ]
  },
  {
    name: 'Cost Centers',
    href: '/cost-centers',
    icon: Calculator,
    description: 'Cost center management and allocation'
  },
  {
    name: 'Acceptance',
    href: '/acceptance',
    icon: CheckCircle,
    description: 'Transaction approval and acceptance'
  }
]

interface EnterpriseNavigationProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function EnterpriseNavigation({ isCollapsed = false, onToggleCollapse }: EnterpriseNavigationProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleItem = (itemName: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName)
    } else {
      newExpanded.add(itemName)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const NavigationItemComponent = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.name)
    const active = isActive(item.href)

    return (
      <div>
        <div
          className={`enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-p-3 enterprise-rounded-lg enterprise-transition-colors enterprise-cursor-pointer ${
            active
              ? 'enterprise-bg-primary enterprise-text-white'
              : 'enterprise-text-gray-700 hover:enterprise-bg-gray-100'
          } ${level > 0 ? 'enterprise-pl-8' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.name)
            }
          }}
        >
          <item.icon className="enterprise-h-5 enterprise-w-5 enterprise-flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="enterprise-flex-1 enterprise-font-medium">{item.name}</span>
              {hasChildren && (
                <ChevronDown
                  className={`enterprise-h-4 enterprise-w-4 enterprise-transition-transform ${
                    isExpanded ? 'enterprise-rotate-180' : ''
                  }`}
                />
              )}
            </>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="enterprise-ml-6 enterprise-border-l enterprise-border-gray-200 enterprise-pl-2">
            {item.children!.map((child) => (
              <NavigationItemComponent key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="enterprise-lg:hidden enterprise-fixed enterprise-top-4 enterprise-left-4 enterprise-z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="enterprise-p-2 enterprise-rounded-lg enterprise-bg-white enterprise-shadow-md enterprise-border enterprise-border-gray-200"
        >
          {mobileOpen ? <X className="enterprise-h-6 enterprise-w-6" /> : <Menu className="enterprise-h-6 enterprise-w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div className="enterprise-lg:hidden enterprise-fixed enterprise-inset-0 enterprise-z-40 enterprise-bg-black enterprise-bg-opacity-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Navigation Sidebar */}
      <div
        className={`enterprise-fixed enterprise-top-0 enterprise-left-0 enterprise-h-screen enterprise-bg-white enterprise-border-r enterprise-border-gray-200 enterprise-z-40 enterprise-transition-all enterprise-duration-300 enterprise-flex enterprise-flex-col ${
          isCollapsed ? 'enterprise-w-16' : 'enterprise-w-64'
        } ${mobileOpen ? 'enterprise-translate-x-0' : '-enterprise-translate-x-full enterprise-lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="enterprise-p-4 enterprise-border-b enterprise-border-gray-200">
          <div className="enterprise-flex enterprise-items-center enterprise-gap-3">
            <Calculator className="enterprise-h-8 enterprise-w-8 enterprise-text-primary" />
            {!isCollapsed && (
              <div>
                <h2 className="enterprise-font-bold enterprise-text-lg enterprise-text-gray-900">Finance</h2>
                <p className="enterprise-text-sm enterprise-text-gray-600">Enterprise Module</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="enterprise-flex-1 enterprise-overflow-y-auto enterprise-p-4">
          <nav className="enterprise-space-y-1">
            {navigationItems.map((item) => (
              <NavigationItemComponent key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="enterprise-p-4 enterprise-border-t enterprise-border-gray-200">
          <div className="enterprise-space-y-2">
            <button className="enterprise-w-full enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-p-3 enterprise-rounded-lg enterprise-text-gray-700 hover:enterprise-bg-gray-100">
              <Settings className="enterprise-h-5 enterprise-w-5" />
              {!isCollapsed && <span className="enterprise-flex-1 enterprise-font-medium">Settings</span>}
            </button>
            <button className="enterprise-w-full enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-p-3 enterprise-rounded-lg enterprise-text-gray-700 hover:enterprise-bg-gray-100">
              <HelpCircle className="enterprise-h-5 enterprise-w-5" />
              {!isCollapsed && <span className="enterprise-flex-1 enterprise-font-medium">Help</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="enterprise-hidden enterprise-lg:block enterprise-fixed enterprise-top-4 enterprise-left-60 enterprise-z-50 enterprise-p-2 enterprise-rounded-full enterprise-bg-white enterprise-shadow-md enterprise-border enterprise-border-gray-200 enterprise-transition-transform enterprise-duration-300 ${
          isCollapsed ? 'enterprise-rotate-180 enterprise-left-4' : ''
        }"
      >
        <ChevronRight className="enterprise-h-4 enterprise-w-4" />
      </button>
    </>
  )
}

export function EnterpriseTopBar() {
  return (
    <div className="enterprise-fixed enterprise-top-0 enterprise-right-0 enterprise-left-64 enterprise-h-16 enterprise-bg-white enterprise-border-b enterprise-border-gray-200 enterprise-z-30 enterprise-px-6 enterprise-flex enterprise-items-center enterprise-justify-between">
      {/* Search */}
      <div className="enterprise-relative enterprise-flex-1 enterprise-max-w-md">
        <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions, accounts, reports..."
          className="enterprise-w-full enterprise-pl-10 enterprise-pr-4 enterprise-py-2 enterprise-border enterprise-border-gray-300 enterprise-rounded-lg enterprise-focus:enterprise-outline-none enterprise-focus:enterprise-ring-2 enterprise-focus:enterprise-ring-primary enterprise-focus:enterprise-border-transparent"
        />
      </div>

      {/* User Actions */}
      <div className="enterprise-flex enterprise-items-center enterprise-gap-4">
        <button className="enterprise-p-2 enterprise-rounded-lg enterprise-text-gray-600 hover:enterprise-bg-gray-100">
          <Bell className="enterprise-h-5 enterprise-w-5" />
        </button>
        <div className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-p-2 enterprise-rounded-lg enterprise-bg-gray-50">
          <div className="enterprise-w-8 enterprise-h-8 enterprise-bg-primary enterprise-rounded-full enterprise-flex enterprise-items-center enterprise-justify-center">
            <User className="enterprise-h-5 enterprise-w-5 enterprise-text-white" />
          </div>
          <div>
            <p className="enterprise-text-sm enterprise-font-medium enterprise-text-gray-900">Finance User</p>
            <p className="enterprise-text-xs enterprise-text-gray-600">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}