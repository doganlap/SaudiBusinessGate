/**
 * Jest Setup File
 * Global test configuration and utilities
 */

// Mock environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/saudistore_test';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6390';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-for-testing';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3050';

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid UUID`
        : `Expected ${received} to be a valid UUID`,
    };
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid email`
        : `Expected ${received} to be a valid email`,
    };
  },
});

// Add custom matchers to TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
    }
  }
}

// Mock fetch for Node environment
global.fetch = global.fetch || (async (...args: any[]) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    headers: new Headers(),
  } as Response;
});

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

export {};
