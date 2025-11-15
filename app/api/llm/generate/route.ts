import { NextRequest, NextResponse } from 'next/server';
import { LLMIntegrationService, LLMProvider } from '@/lib/services/llm-integration.service';

export async function POST(req: NextRequest) {
  try {
    const { provider, prompt, systemPrompt, maxTokens, temperature } = await req.json();
    
    if (!provider || !prompt) {
      return NextResponse.json(
        { error: 'Provider and prompt are required' },
        { status: 400 }
      );
    }
    
    const response = await LLMIntegrationService.generateCompletion({
      provider: provider as LLMProvider,
      prompt,
      systemPrompt,
      maxTokens: maxTokens || 1000,
      temperature: temperature || 0.7
    });
    
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error: any) {
    console.error('LLM Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate completion' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const providers = LLMIntegrationService.getAvailableProviders();
    
    const providersWithInfo = providers.map(p => ({
      id: p,
      ...LLMIntegrationService.getProviderInfo(p)
    }));
    
    return NextResponse.json({
      success: true,
      providers: providersWithInfo,
      count: providers.length
    });
  } catch (error: any) {
    console.error('Get Providers Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get providers' },
      { status: 500 }
    );
  }
}
