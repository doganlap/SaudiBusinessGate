import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { LLMIntegrationService, LLMRequest } from '@/lib/services/llm-integration.service';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const body = await request.json();
    
    const { text } = body;
    
    if (!text) {
      return NextResponse.json({
        success: false,
        error: 'Text is required'
      }, { status: 400 });
    }

    const systemPrompt = `You are an expert RFP analyst. Analyze the RFP text and extract:
1. Sector: Business sector (finance, healthcare, retail, government, education, manufacturing, technology, etc.)
2. Industry: Specific industry classification
3. Language: Primary language detected (ar, en, or both)
4. Tags: Relevant tags/keywords (maximum 10)
5. Complexity: Project complexity level (low, medium, high) based on scope, requirements, timeline
6. Revenue potential: Estimated revenue potential (low, medium, high)
7. Strategic fit: Alignment with standard solutions (low, medium, high)

Return JSON format: {"sector": "...", "industry": "...", "language": "ar|en|both", "tags": ["tag1", "tag2"], "complexity": "low|medium|high", "revenue_potential": "low|medium|high", "strategic_fit": "low|medium|high"}`;

    const prompt = `Analyze this RFP text and extract relevant information:

${text.substring(0, 8000)}

Return only valid JSON, no explanations.`;

    const llmRequest: LLMRequest = {
      provider: 'openai-gpt4-turbo',
      prompt,
      systemPrompt,
      maxTokens: 800,
      temperature: 0.3
    };

    const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
    const suggestions = JSON.parse(llmResponse.content);

    return NextResponse.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing RFP:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze RFP',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

