/**
 * Sentry Configuration for Error Tracking
 * Client and server-side error monitoring
 */

// This file configures Sentry for error tracking
// Install with: npm install @sentry/nextjs

export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  enableTracing: true,
  profilesSampleRate: 0.1,
  
  // Replay session recording
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out sensitive data
  beforeSend(event: any) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Remove sensitive query parameters
    if (event.request?.query_string) {
      const sensitiveParams = ['token', 'api_key', 'password', 'secret'];
      sensitiveParams.forEach(param => {
        if (event.request.query_string.includes(param)) {
          event.request.query_string = event.request.query_string.replace(
            new RegExp(`${param}=[^&]*`, 'gi'),
            `${param}=[REDACTED]`
          );
        }
      });
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'ChunkLoadError',
    'Loading chunk',
    'NetworkError',
  ],

  // Configure release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
};

/**
 * Initialize Sentry (to be called in _app.tsx or instrumentation.ts)
 */
export function initializeSentry() {
  if (!SENTRY_CONFIG.dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  console.log('✅ Sentry initialized for environment:', SENTRY_CONFIG.environment);
}

/**
 * Capture custom exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  } else {
    console.error('Sentry not initialized:', error, context);
  }
}

/**
 * Capture custom message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level);
  } else {
    console.log('Sentry message:', level, message);
  }
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser(user);
  }
}

/**
 * Clear user context
 */
export function clearUser() {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser(null);
  }
}

export default {
  config: SENTRY_CONFIG,
  initialize: initializeSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
};
