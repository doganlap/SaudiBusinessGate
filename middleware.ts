import { NextRequest, NextResponse } from 'next/server'
import { languages, defaultLanguage } from './lib/i18n'

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
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

  // Try to get from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Simple parsing of Accept-Language header
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
    
    for (const lang of preferredLanguages) {
      if (lang === 'ar' || lang.startsWith('ar-')) return 'ar'
      if (lang === 'en' || lang.startsWith('en-')) return 'en'
    }
  }

  return defaultLanguage
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png).*)',
  ],
}
