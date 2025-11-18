// Application configuration
export const appConfig = {
  name: 'Saudi Business Gate',
  version: '2.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050/api',
  supportedLocales: ['en', 'ar'],
  defaultLocale: 'en',
  features: {
    enableBetaFeatures: process.env.ENABLE_BETA_FEATURES === 'true',
    enableMaintenanceMode: process.env.ENABLE_MAINTENANCE_MODE === 'true',
    enableApiDocs: process.env.ENABLE_API_DOCS === 'true'
  }
};