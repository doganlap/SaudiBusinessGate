/**
 * Google Analytics 4 Integration
 * Tracking page views, events, and user interactions
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'consent',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics ID not configured');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag as any;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: false, // We'll send manually
  });
}

// Track page views
export function trackPageView(url: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
}

// Track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// E-commerce tracking
export function trackPurchase(transactionId: string, value: number, currency: string = 'SAR') {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
  });
}

export function trackAddToCart(itemId: string, itemName: string, price: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'add_to_cart', {
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price: price,
      },
    ],
  });
}

export function trackBeginCheckout(value: number, items: any[]) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'begin_checkout', {
    value: value,
    currency: 'SAR',
    items: items,
  });
}

// User engagement tracking
export function trackSignUp(method: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'sign_up', {
    method: method,
  });
}

export function trackLogin(method: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'login', {
    method: method,
  });
}

export function trackSearch(searchTerm: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });
}

// AI Chatbot tracking
export function trackChatMessage(messageType: 'user' | 'bot', messageLength: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'chat_interaction', {
    event_category: 'AI Chatbot',
    event_label: messageType,
    value: messageLength,
  });
}

export function trackChatSession(duration: number, messageCount: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'chat_session_complete', {
    event_category: 'AI Chatbot',
    event_label: 'Session End',
    session_duration: duration,
    message_count: messageCount,
  });
}

// Marketplace tracking
export function trackServiceView(serviceId: string, serviceName: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'view_item', {
    items: [
      {
        item_id: serviceId,
        item_name: serviceName,
        item_category: 'Autonomous Service',
      },
    ],
  });
}

export function trackServiceSubscribe(serviceId: string, serviceName: string, price: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'add_to_cart', {
    items: [
      {
        item_id: serviceId,
        item_name: serviceName,
        item_category: 'Autonomous Service',
        price: price,
        currency: 'SAR',
      },
    ],
  });
}

// Performance tracking
export function trackPerformance(metric: string, value: number) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'performance_metric', {
    event_category: 'Performance',
    event_label: metric,
    value: Math.round(value),
  });
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, fatal: boolean = false) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', 'exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: fatal,
  });
}

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackBeginCheckout,
  trackSignUp,
  trackLogin,
  trackSearch,
  trackChatMessage,
  trackChatSession,
  trackServiceView,
  trackServiceSubscribe,
  trackPerformance,
  trackError,
};
