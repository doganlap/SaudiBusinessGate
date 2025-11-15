/**
 * Application Insights Configuration
 * Azure monitoring and telemetry setup
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

let appInsights: ApplicationInsights | null = null;
let reactPlugin: ReactPlugin | null = null;

/**
 * Initialize Application Insights
 */
export function initializeAppInsights(): ApplicationInsights | null {
  if (typeof window === 'undefined') {
    return null; // Don't initialize on server
  }

  if (appInsights) {
    return appInsights; // Already initialized
  }

  const connectionString = process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('Application Insights connection string not configured');
    return null;
  }

  try {
    reactPlugin = new ReactPlugin();
    
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        correlationHeaderExcludedDomains: ['*.queue.core.windows.net'],
        disableFetchTracking: false,
        disableAjaxTracking: false,
        maxBatchInterval: 15000,
        maxBatchSizeInBytes: 100000,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: {
            debug: process.env.NODE_ENV === 'development'
          }
        }
      }
    });

    appInsights.loadAppInsights();
    appInsights.trackPageView();

    // Set user context if available
    const userId = localStorage.getItem('userId');
    if (userId) {
      appInsights.setAuthenticatedUserContext(userId);
    }

    console.log('✅ Application Insights initialized');
    return appInsights;
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    return null;
  }
}

/**
 * Track custom events
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (appInsights) {
    appInsights.trackEvent({ name }, properties);
  }
}

/**
 * Track custom metrics
 */
export function trackMetric(name: string, average: number, properties?: Record<string, any>) {
  if (appInsights) {
    appInsights.trackMetric({ name, average }, properties);
  }
}

/**
 * Track exceptions
 */
export function trackException(error: Error, properties?: Record<string, any>) {
  if (appInsights) {
    appInsights.trackException({ exception: error }, properties);
  }
}

/**
 * Track page views
 */
export function trackPageView(name?: string, url?: string, properties?: Record<string, any>) {
  if (appInsights) {
    appInsights.trackPageView({ name, uri: url }, properties);
  }
}

/**
 * Track dependencies (API calls)
 */
export function trackDependency(
  id: string,
  method: string,
  absoluteUrl: string,
  duration: number,
  success: boolean,
  resultCode?: number
) {
  if (appInsights) {
    appInsights.trackDependencyData({
      id,
      name: method,
      data: absoluteUrl,
      duration,
      success,
      responseCode: resultCode || 0
    });
  }
}

/**
 * Set authenticated user context
 */
export function setUserContext(userId: string, tenantId?: string) {
  if (appInsights) {
    appInsights.setAuthenticatedUserContext(userId, tenantId);
    localStorage.setItem('userId', userId);
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (appInsights) {
    appInsights.clearAuthenticatedUserContext();
    localStorage.removeItem('userId');
  }
}

/**
 * Get React Plugin for React components
 */
export function getReactPlugin(): ReactPlugin | null {
  return reactPlugin;
}

/**
 * Get Application Insights instance
 */
export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

export default {
  initialize: initializeAppInsights,
  trackEvent,
  trackMetric,
  trackException,
  trackPageView,
  trackDependency,
  setUserContext,
  clearUserContext,
  getReactPlugin,
  getAppInsights
};
