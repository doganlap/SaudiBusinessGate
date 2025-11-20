/**
 * AI Agents API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { aiAgents } from '@/lib/services/ai-agents.service';
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'process-document': {
        const { document, type = 'general' } = params;
        if (!document) {
          return NextResponse.json(
            { error: 'Document is required' },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(document, 'base64');
        const result = await aiAgents.processDocument(buffer, type);
        return NextResponse.json({ success: true, result });
      }

      case 'get-forecast': {
        const { module, metric, timeRange, periods = 6 } = params;
        if (!module || !metric || !timeRange) {
          return NextResponse.json(
            { error: 'Module, metric, and timeRange are required' },
            { status: 400 }
          );
        }
        const result = await aiAgents.getForecast(
          module,
          metric,
          {
            start: new Date(timeRange.start),
            end: new Date(timeRange.end),
          },
          periods
        );
        return NextResponse.json({ success: true, result });
      }

      case 'analyze-text': {
        const { text } = params;
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }
        const result = await aiAgents.analyzeText(text);
        return NextResponse.json({ success: true, result });
      }

      case 'process-image': {
        const { image, tasks = ['labels'] } = params;
        if (!image) {
          return NextResponse.json(
            { error: 'Image is required' },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(image, 'base64');
        const result = await aiAgents.processImage(buffer, tasks);
        return NextResponse.json({ success: true, result });
      }

      case 'predict-churn': {
        const { module, entityId, data } = params;
        if (!module || !entityId || !data) {
          return NextResponse.json(
            { error: 'Module, entityId, and data are required' },
            { status: 400 }
          );
        }
        const result = await aiAgents.predictChurn(module, entityId, data);
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AI Agents error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI processing failed' },
      { status: 500 }
    );
  }
}, { windowMs: 60000, maxRequests: 50 });

