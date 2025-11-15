// Autonomous AI Services API Routes
// Saudi Store - The 1st Autonomous Store in the World

import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const AI_MODEL = process.env.AI_MODEL || 'qwen2.5:72b';

export async function POST(request: Request) {
  try {
    const { message, context, model } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const selectedModel = model || AI_MODEL;

    // Try Ollama first
    try {
      const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `You are an intelligent AI assistant for Saudi Store - The 1st Autonomous Store in the World from Saudi Arabia.

Context: ${context || 'General customer support'}

Customer Question: ${message}

Provide a helpful, professional response in the customer's language (Arabic or English):`,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        return NextResponse.json({
          success: true,
          response: data.response || 'I can help you with that!',
          model: selectedModel,
          timestamp: new Date().toISOString(),
          source: 'ollama'
        });
      }
    } catch (ollamaError) {
      console.error('Ollama error:', ollamaError);
      // Fall through to fallback
    }

    // Fallback response
    const fallbackResponse = getFallbackResponse(message);
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      model: 'fallback',
      timestamp: new Date().toISOString(),
      source: 'fallback'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Chat service temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Arabic responses
  if (/[\u0600-\u06FF]/.test(message)) {
    if (lowerMessage.includes('سعر') || lowerMessage.includes('تكلفة')) {
      return 'أسعارنا تبدأ من 500 ريال سعودي شهرياً. يمكنني مساعدتك في اختيار الباقة المناسبة لاحتياجاتك.';
    }
    if (lowerMessage.includes('تواصل') || lowerMessage.includes('دعم')) {
      return 'يمكنك التواصل معنا عبر البريد الإلكتروني: support@saudistore.sa أو الهاتف: 920000000';
    }
    if (lowerMessage.includes('متجر') || lowerMessage.includes('خدمات')) {
      return 'المتجر السعودي هو أول متجر ذاتي الإدارة في العالم من المملكة العربية السعودية. نقدم خدمات متقدمة بتقنية الذكاء الاصطناعي.';
    }
    return 'مرحباً بك في المتجر السعودي! كيف يمكنني مساعدتك اليوم؟ 🇸🇦';
  }

  // English responses
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return 'Our pricing starts at 500 SAR per month. I can help you choose the right package for your needs.';
  }
  if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
    return 'You can reach us at support@saudistore.sa or call 920000000 for immediate assistance.';
  }
  if (lowerMessage.includes('store') || lowerMessage.includes('service')) {
    return 'Saudi Store is the 1st Autonomous Store in the World from Saudi Arabia. We offer advanced AI-powered services.';
  }
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Welcome to Saudi Store - The 1st Autonomous Store in the World! 🇸🇦 How can I assist you today?';
  }

  return 'Thank you for your inquiry. How can I help you with Saudi Store services today?';
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    service: 'Saudi Store AI Chat Service',
    status: 'operational',
    models: [AI_MODEL, 'fallback'],
    timestamp: new Date().toISOString()
  });
}
