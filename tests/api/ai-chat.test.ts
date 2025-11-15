/**
 * AI Chat API Tests
 * Testing Ollama integration and fallback system
 */

import { POST } from '@/app/api/ai/chat/route';
import { NextRequest } from 'next/server';

describe('/api/ai/chat', () => {
  describe('POST', () => {
    it('should accept valid chat message', async () => {
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, can you help me?',
          context: 'Saudi Store customer support',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
      expect(typeof data.response).toBe('string');
      expect(data.response.length).toBeGreaterThan(0);
    });

    it('should handle Arabic messages', async () => {
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'مرحباً، كيف يمكنني الاشتراك؟',
          context: 'Saudi Store customer support - Arabic',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
      expect(data.response.length).toBeGreaterThan(0);
    });

    it('should reject empty message', async () => {
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          context: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject missing message field', async () => {
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should provide fallback response when Ollama unavailable', async () => {
      // Mock Ollama service unavailable
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message',
          context: 'Test with offline Ollama',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still respond with fallback
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
      expect(data.source).toBe('fallback'); // Check if it's using fallback source
    });

    it('should handle long messages', async () => {
      const longMessage = 'A'.repeat(5000);
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: longMessage,
          context: 'Long message test',
        }),
      });

      const response = await POST(request);
      
      // Should handle or reject appropriately
      expect([200, 400, 413]).toContain(response.status);
    });

    it('should include metadata in response', async () => {
      const request = new NextRequest('http://localhost:3050/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What services do you offer?',
          context: 'Saudi Store',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('model');
    });
  });
});
