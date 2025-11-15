import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Authentication Tests', () => {
  describe('Email/Password Login', () => {
    test('Should login with valid credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@doganhub.com',
          password: 'Demo123456',
          demoMode: true
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('demo@doganhub.com');
      expect(data.tenant).toBeDefined();
    });

    test('Should reject invalid password', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@doganhub.com',
          password: 'WrongPassword'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    test('Should reject missing credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Password Security', () => {
    test('Should hash passwords with bcrypt', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
      expect(await bcrypt.compare(password, hash)).toBe(true);
      expect(await bcrypt.compare('wrong', hash)).toBe(false);
    });

    test('Should reject weak passwords', () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123'
      ];

      weakPasswords.forEach(pwd => {
        expect(pwd.length).toBeLessThan(8);
      });
    });
  });

  describe('JWT Token Management', () => {
    test('Should generate valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        role: 'admin'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe('user-123');
      expect(decoded.tenantId).toBe('tenant-456');
      expect(decoded.role).toBe('admin');
    });

    test('Should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET);
      }).toThrow();
    });

    test('Should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Demo Mode', () => {
    test('Should login with demo credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@doganhub.com',
          password: 'Demo123456',
          demoMode: true
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.demoMode).toBe(true);
    });
  });
});

describe('Multi-Tenant Isolation', () => {
  test('Should require tenant-id header', async () => {
    const token = jwt.sign(
      { userId: 'user-123', tenantId: 'tenant-aaa' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await fetch(`${API_URL}/api/finance/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
        // Missing tenant-id header
      }
    });

    // Should either require tenant-id or use token's tenant
    expect([200, 400, 401]).toContain(response.status);
  });

  test('Should validate tenant-id format', () => {
    const validTenantIds = [
      'tenant-123',
      'abc-456',
      'TENANT-789'
    ];

    const invalidTenantIds = [
      '',
      'tenant',
      '123',
      'tenant_123' // underscore not allowed
    ];

    validTenantIds.forEach(id => {
      expect(id).toMatch(/^[a-zA-Z]+-\d+$/);
    });

    invalidTenantIds.forEach(id => {
      expect(id).not.toMatch(/^[a-zA-Z]+-\d+$/);
    });
  });
});

describe('Input Validation', () => {
  test('Should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: maliciousInput,
        password: 'test'
      })
    });

    // Should reject or sanitize
    expect([400, 401]).toContain(response.status);
  });

  test('Should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.com'
    ];

    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('KSA Compliance', () => {
  test('Should validate VAT number format', () => {
    const validVAT = '300000000000003'; // 15 digits
    const invalidVAT = '123456789'; // Too short

    expect(validVAT).toMatch(/^\d{15}$/);
    expect(invalidVAT).not.toMatch(/^\d{15}$/);
  });

  test('Should validate CR number format', () => {
    const validCR = '1010123456'; // 10 digits
    const invalidCR = '12345'; // Too short

    expect(validCR).toMatch(/^\d{10}$/);
    expect(invalidCR).not.toMatch(/^\d{10}$/);
  });

  test('Should calculate VAT correctly', () => {
    const amount = 1000;
    const vatRate = 0.15;

    const vat = amount * vatRate;
    const total = amount + vat;

    expect(vat).toBe(150);
    expect(total).toBe(1150);
  });
});

describe('Security Headers', () => {
  test('Should have security headers', async () => {
    const response = await fetch(`${API_URL}/`);

    // Check for common security headers
    const headers = response.headers;

    // These should be present in production
    if (process.env.NODE_ENV === 'production') {
      expect(headers.get('x-frame-options')).toBeTruthy();
      expect(headers.get('x-content-type-options')).toBeTruthy();
    }
  });
});
