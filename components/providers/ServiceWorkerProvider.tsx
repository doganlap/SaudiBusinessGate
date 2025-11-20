/**
 * Service Worker Provider
 * Registers service worker for PWA support
 */

'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always disable service worker to prevent errors
    // Service worker can be enabled later when needed
    if (typeof window !== 'undefined') {
      console.log('⚠️ Service Worker disabled');
      return;
    }

    // Service worker registration code (disabled for now)
    // Uncomment when service worker is fully tested and ready
    /*
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register in production
      if (process.env.NODE_ENV === 'production') {
        const registerServiceWorker = () => {
          navigator.serviceWorker
            .register('/sw.js', { 
              scope: '/',
              updateViaCache: 'none'
            })
            .then((registration) => {
              console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch((error) => {
              console.error('❌ Service Worker registration failed:', error);
            });
        };

        if (document.readyState === 'complete') {
          registerServiceWorker();
        } else {
          window.addEventListener('load', registerServiceWorker);
        }
      }
    }
    */
  }, []);

  return <>{children}</>;
}

