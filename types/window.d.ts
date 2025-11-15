// Type declarations for global window extensions

interface Window {
  dataLayer: any[];
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export {};
