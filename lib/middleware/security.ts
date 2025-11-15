import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production
 */

export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy (CSP)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.stripe.com https://*.openai.com https://*.anthropic.com https://*.google.com wss://localhost:* ws://localhost:*",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Security Headers
  const securityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Content Security Policy
    'Content-Security-Policy': csp,
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()'
    ].join(', '),
    
    // HTTP Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Remove X-Powered-By header
    'X-Powered-By': '',
    
    // CORS headers (adjust based on your needs)
    'Access-Control-Allow-Credentials': 'true',
  };

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Rate Limiting Store (in-memory, use Redis in production)
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (record.count >= limit) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    this.store.set(key, record);
    return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate Limiting Middleware
 */
export function rateLimitMiddleware(
  request: NextRequest,
  config: { limit: number; windowMs: number } = { limit: 100, windowMs: 60000 }
) {
  // Get client identifier (IP address or user ID)
  const clientId = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const key = `ratelimit:${clientId}:${request.nextUrl.pathname}`;
  const result = rateLimitStore.check(key, config.limit, config.windowMs);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.resetTime)
        }
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(config.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetTime));

  return response;
}

/**
 * API Route Protection
 */
export function isAPIRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/health',
  '/api/billing/webhook'
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}
