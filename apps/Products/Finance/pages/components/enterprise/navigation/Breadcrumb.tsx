'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumb() {
  const pathname = usePathname()
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return []
    
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Add home breadcrumb
    breadcrumbs.push({ label: 'Home', href: '/' })
    
    // Add finance breadcrumb (always show since we're in finance module)
    breadcrumbs.push({ label: 'Finance', href: '/' })
    
    // Add specific finance pages
    if (paths.length > 0) {
      const page = paths[0]
      const pageLabels: Record<string, string> = {
        'dashboard': 'Dashboard',
        'accounts': 'Accounts',
        'accounts-payable': 'Accounts Payable',
        'accounts-receivable': 'Accounts Receivable',
        'budgets': 'Budgets',
        'transactions': 'Transactions',
        'reports': 'Reports',
        'cost-centers': 'Cost Centers',
        'acceptance': 'Acceptance',
        'analytics': 'Analytics'
      }
      
      if (pageLabels[page]) {
        breadcrumbs.push({
          label: pageLabels[page],
          href: `/${page}`
        })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-text-sm enterprise-text-gray-600 enterprise-mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="enterprise-flex enterprise-items-center enterprise-gap-2">
          {index === 0 ? (
            <Home className="enterprise-h-4 enterprise-w-4" />
          ) : (
            <ChevronRight className="enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
          )}
          
          {index === breadcrumbs.length - 1 ? (
            <span className="enterprise-font-medium enterprise-text-gray-900">{breadcrumb.label}</span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="enterprise-text-gray-600 hover:enterprise-text-gray-900 enterprise-transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}