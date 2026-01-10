import { NextRequest, NextResponse } from 'next/server';
import { getToddFatherClient, type AskResponse } from '@/lib/services/toddfather/api-client';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute for AI responses

/**
 * POST /api/governance/ask
 *
 * SPM Expert Chat endpoint using The Toddfather RAG system.
 * Provides AI-powered answers to governance and compensation plan questions.
 */

interface AskRequest {
  question: string;
  documentContext?: {
    documentId: string;
    planName: string;
    gaps?: string[];      // Current gap summary for context
    coverage?: number;    // Coverage score
  };
  conversationId?: string;
  tenantId?: string;
}

interface AskApiResponse extends AskResponse {
  suggestedFollowUps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AskRequest;
    const { question, documentContext, conversationId, tenantId } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Build context-enhanced question if document context provided
    let enhancedQuestion = question;
    if (documentContext) {
      const contextParts: string[] = [];

      if (documentContext.planName) {
        contextParts.push(`Plan: ${documentContext.planName}`);
      }
      if (documentContext.coverage !== undefined) {
        contextParts.push(`Current coverage: ${documentContext.coverage}%`);
      }
      if (documentContext.gaps && documentContext.gaps.length > 0) {
        contextParts.push(`Known gaps: ${documentContext.gaps.join(', ')}`);
      }

      if (contextParts.length > 0) {
        enhancedQuestion = `[Context: ${contextParts.join('; ')}]\n\nQuestion: ${question}`;
      }
    }

    // Call The Toddfather
    const client = getToddFatherClient();
    const response = await client.ask(enhancedQuestion, {
      persona: 'askSPARCC',
      conversationId,
      tenantId: tenantId || 'sgm',
      limit: 6,
    });

    // Generate suggested follow-up questions based on the answer
    const suggestedFollowUps = generateFollowUps(question, response.answer, documentContext);

    const result: AskApiResponse = {
      ...response,
      suggestedFollowUps,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ask error:', error);

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Unable to connect to AI service. Please try again.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

/**
 * Generate suggested follow-up questions based on context
 */
function generateFollowUps(
  question: string,
  answer: string,
  documentContext?: AskRequest['documentContext']
): string[] {
  const followUps: string[] = [];

  // If analyzing a specific document, suggest gap-related questions
  if (documentContext) {
    if (documentContext.gaps && documentContext.gaps.length > 0) {
      followUps.push(`How do I remediate the ${documentContext.gaps[0]} gap?`);
      followUps.push('What are the highest priority gaps to address first?');
    }
    if (documentContext.coverage !== undefined && documentContext.coverage < 50) {
      followUps.push('What are the most critical missing policy requirements?');
    }
    followUps.push('Generate compliant language for this plan');
  }

  // Generic SPM follow-ups based on common topics
  const questionLower = question.toLowerCase();

  if (questionLower.includes('clawback') || questionLower.includes('recovery')) {
    followUps.push('What are best practices for clawback disclosure?');
    followUps.push('How should I handle California-specific clawback rules?');
  }

  if (questionLower.includes('quota') || questionLower.includes('target')) {
    followUps.push('How often should quotas be communicated?');
    followUps.push('What documentation is required for quota changes?');
  }

  if (questionLower.includes('termination') || questionLower.includes('separation')) {
    followUps.push('What are the commission payment rules upon termination?');
    followUps.push('How do different states handle post-termination commissions?');
  }

  if (questionLower.includes('dispute') || questionLower.includes('appeal')) {
    followUps.push('What should a dispute resolution process include?');
    followUps.push('What are typical timeframes for commission disputes?');
  }

  // Always include a general exploration question
  if (followUps.length < 3) {
    followUps.push('What are the most common compensation plan compliance issues?');
  }

  // Limit to 3 suggestions
  return followUps.slice(0, 3);
}

/**
 * GET /api/governance/ask
 *
 * Health check for the Ask API
 */
export async function GET() {
  try {
    const client = getToddFatherClient();
    const health = await client.healthCheck();

    return NextResponse.json({
      status: 'ok',
      service: 'governance-ask',
      backend: health,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'governance-ask',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
