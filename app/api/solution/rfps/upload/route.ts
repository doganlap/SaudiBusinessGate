import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { LLMIntegrationService, LLMRequest } from '@/lib/services/llm-integration.service';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id') || request.headers.get('tenant-id') || 'default';
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    // Read file content (basic implementation - you may want to use libraries like pdf-parse, mammoth, etc.)
    let text = '';
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await file.text();
    } else if (file.type === 'application/pdf') {
      // TODO: Integrate PDF parser (pdf-parse, pdfjs-dist, etc.)
      // For now, return placeholder
      text = `[PDF content extraction not yet implemented. Please paste text manually or use TXT file.]`;
    } else if (file.name.endsWith('.docx')) {
      // TODO: Integrate DOCX parser (mammoth, docx, etc.)
      text = `[DOCX content extraction not yet implemented. Please paste text manually or use TXT file.]`;
    }

    // Use AI to extract structured information from the document
    let extracted = null;
    
    try {
      const systemPrompt = `You are an expert RFP document parser. Extract the following information from the RFP document:
1. Title: The main title or subject
2. Client name: Company or organization name
3. Industry: Industry sector (finance, healthcare, retail, government, education, manufacturing, technology, etc.)
4. Sector: Business sector
5. Language: Primary language (ar, en, or both)
6. Key requirements: Main requirements mentioned
7. Deadline: Submission deadline if mentioned

Return JSON format: {"title": "...", "client_name": "...", "industry": "...", "sector": "...", "language": "ar|en|both", "requirements": "...", "deadline": "..."}`;

      const prompt = `Extract information from this RFP document:

${text.substring(0, 8000)}

Return only valid JSON, no explanations.`;

      const llmRequest: LLMRequest = {
        provider: 'openai-gpt4-turbo',
        prompt,
        systemPrompt,
        maxTokens: 1000,
        temperature: 0.3
      };

      const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
      extracted = JSON.parse(llmResponse.content);
    } catch (aiError) {
      console.error('AI extraction error:', aiError);
      // Continue without extracted data
    }

    return NextResponse.json({
      success: true,
      text,
      extracted,
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

