import { NextRequest, NextResponse } from 'next/server'
import { languages, defaultLanguage } from './lib/i18n'

// React Router to Next.js App Router redirects
// This map will be updated as routes are migrated
const routeRedirects: Record<string, string> = {
  // Dashboard routes
  '/app': '/dashboard',
  '/app/dashboard': '/dashboard',
  
  // Finance routes (already migrated)
  '/app/finance': '/finance',
  '/app/finance/accounts': '/finance/accounts',
  '/app/finance/budgets': '/finance/budgets',
  '/app/finance/transactions': '/finance/transactions',
  '/app/finance/reports': '/finance/reports',
  
  // CRM routes (already migrated)
  '/app/crm': '/crm',
  '/app/crm/contacts': '/crm/contacts',
  '/app/crm/customers': '/crm/customers',
  
  // Sales routes (already migrated)
  '/app/sales': '/sales',
  '/app/sales/pipeline': '/sales/pipeline',
  '/app/sales/deals': '/sales/deals',
  
  // HR routes (already migrated)
  '/app/hr': '/hr',
  '/app/hr/employees': '/hr/employees',
  '/app/hr/payroll': '/hr/payroll',
  
  // GRC routes (partial migration)
  '/app/frameworks': '/grc/frameworks',
  '/app/controls': '/grc/controls',
  '/app/grc': '/grc',
  
  // Platform routes (partial migration)
  '/app/users': '/platform/users',
  '/app/settings': '/platform/settings',
  '/app/system/api': '/platform/api-status',
  
  // Licenses (already migrated)
  '/app/licenses': '/licenses/management',
  '/app/renewals': '/licenses/renewals',
  '/app/usage': '/licenses/usage',
  '/app/upgrade': '/licenses/upgrade',
  
  // Workflows (partial migration)
  '/app/workflows': '/workflows/designer',
  
  // Analytics (already migrated)
  '/app/analytics': '/analytics',
  
  // Audit logs (already migrated)
  '/app/audit': '/audit-logs',
  '/app/audit-logs': '/audit-logs',
  '/app/logs': '/audit-logs',
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/apple-touch-icon.png') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for React Router to Next.js redirects
  // Only redirect if the route exists in our redirect map
  if (routeRedirects[pathname]) {
    const locale = getLocale(request) || defaultLanguage
    const redirectPath = routeRedirects[pathname]
    const redirectUrl = new URL(`/${locale}/(platform)${redirectPath}`, request.url)
    
    // Preserve query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value)
    })
    
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the pathname already includes a locale
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get preferred language from Accept-Language header or use default
    const locale = getLocale(request) || defaultLanguage
    
    // Redirect to the same path with locale prefix
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

function getLocale(request: NextRequest): string {
  // Try to get locale from cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && languages.includes(cookieLocale as any)) {
    return cookieLocale
  }

  // Try to get from Accept-Language header (prioritize Arabic)
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Simple parsing of Accept-Language header
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
    
    // Check for Arabic first (RTL default)
    for (const lang of preferredLanguages) {
      if (lang === 'ar' || lang.startsWith('ar-')) return 'ar'
    }
    // Then check for English
    for (const lang of preferredLanguages) {
      if (lang === 'en' || lang.startsWith('en-')) return 'en'
    }
  }

  // Default to Arabic (RTL)
  return defaultLanguage
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png).*)',
  ],
}
