/**
 * API Configuration
 * Centralized API endpoint and integration settings
 */

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  
  endpoints: {
    auth: {
      signin: '/api/auth/signin',
      signup: '/api/auth/signup',
      signout: '/api/auth/signout',
      session: '/api/auth/session',
      resetPassword: '/api/auth/reset-password',
    },
    
    user: {
      profile: '/api/user/profile',
      update: '/api/user/update',
      preferences: '/api/user/preferences',
    },
    
    billing: {
      plans: '/api/billing/plans',
      subscribe: '/api/billing/subscribe',
      portal: '/api/billing/portal',
      webhook: '/api/billing/webhook',
    },
    
    dashboard: {
      stats: '/api/dashboard/stats',
      kpis: '/api/dashboard/kpis',
      analytics: '/api/dashboard/analytics',
    },
    
    admin: {
      users: '/api/admin/users',
      licenses: '/api/admin/licenses',
      settings: '/api/admin/settings',
    },
  },
  
  timeout: {
    default: 30000, // 30 seconds
    long: 60000, // 1 minute
    short: 5000, // 5 seconds
  },
  
  retries: {
    max: 3,
    backoff: 1000,
  },
};

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'usd',
  
  plans: {
    basic: {
      monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
    },
    professional: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    enterprise: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    },
  },
};

export const nextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL,
  
  providers: {
    credentials: true,
    google: !!process.env.GOOGLE_CLIENT_ID,
    github: !!process.env.GITHUB_CLIENT_ID,
    azure: !!process.env.AZURE_AD_CLIENT_ID,
  },
  
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
};

export default apiConfig;
