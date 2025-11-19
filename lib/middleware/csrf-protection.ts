/**
 * CSRF Protection Middleware - Production-Ready Implementation
 * Protects against Cross-Site Request Forgery attacks
 * 
 * Features:
 * - Token generation and validation
 * - Double-submit cookie pattern
 * - Secure token storage
 * - Automatic token refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

interface CSRFTokenData {
  token: string;
  timestamp: number;
}

class CSRFProtection {
  private tokenStore: Map<string, CSRFTokenData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create a hash of the token for validation
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Store token with timestamp
   */
  storeToken(token: string): void {
    const hash = this.hashToken(token);
    this.tokenStore.set(hash, {
      token,
      timestamp: Date.now(),
    });
  }

  /**
   * Validate CSRF token
   */
  validateToken(token: string): boolean {
    if (!token) return false;

    const hash = this.hashToken(token);
    const stored = this.tokenStore.get(hash);

    if (!stored) return false;

    // Check if token has expired
    const age = Date.now() - stored.timestamp;
    if (age > TOKEN_EXPIRY) {
      this.tokenStore.delete(hash);
      return false;
    }

    return true;
  }

  /**
   * Remove expired tokens
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [hash, data] of this.tokenStore.entries()) {
      if (now - data.timestamp > TOKEN_EXPIRY) {
        this.tokenStore.delete(hash);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Destroy CSRF protection (cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.tokenStore.clear();
  }
}

// Singleton instance
const csrfProtection = new CSRFProtection();

/**
 * CSRF Protection middleware for API routes
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null; // Allow request to continue
  }

  // Skip CSRF check if disabled in environment
  if (process.env.ENABLE_CSRF_PROTECTION === 'false') {
    console.warn('⚠️ CSRF Protection is disabled');
    return null;
  }

  // Get token from header
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME);
  
  // Get token from cookie
  const cookies = request.cookies;
  const tokenFromCookie = cookies.get(CSRF_COOKIE_NAME)?.value;

  // Validate tokens
  if (!tokenFromHeader || !tokenFromCookie) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }

  if (tokenFromHeader !== tokenFromCookie) {
    return NextResponse.json(
      { error: 'CSRF token mismatch' },
      { status: 403 }
    );
  }

  if (!csrfProtection.validateToken(tokenFromHeader)) {
    return NextResponse.json(
      { error: 'CSRF token invalid or expired' },
      { status: 403 }
    );
  }

  // Token is valid, allow request to continue
  return null;
}

/**
 * Generate and set CSRF token in response
 */
export function setCSRFToken(response: NextResponse): NextResponse {
  const token = csrfProtection.generateToken();
  csrfProtection.storeToken(token);

  // Set secure cookie
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
  });

  // Also send token in header for client to use
  response.headers.set(CSRF_HEADER_NAME, token);

  return response;
}

/**
 * API route handler wrapper with CSRF protection
 */
export function withCSRFProtection<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T> | NextResponse> => {
    // Check CSRF token
    const csrfError = csrfMiddleware(request);
    if (csrfError) {
      return csrfError;
    }

    // Call the actual handler
    const response = await handler(request);

    // Refresh CSRF token in response
    return setCSRFToken(response);
  };
}

/**
 * Get CSRF token for client-side use
 * Call this from a GET endpoint to get a new token
 */
export function getCSRFToken(): { token: string; expiresIn: number } {
  const token = csrfProtection.generateToken();
  csrfProtection.storeToken(token);

  return {
    token,
    expiresIn: TOKEN_EXPIRY,
  };
}

// Export for cleanup in tests
export { csrfProtection };
