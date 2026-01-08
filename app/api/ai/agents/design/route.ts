import { NextRequest, NextResponse } from 'next/server';
import { getDesignAgentPrompt } from '@/lib/ai/agents/prompts/design-agent';
import { generateSuggestionId } from '@/lib/ai/agents/orchestrator';
import type { AgentContext, AgentSuggestion } from '@/lib/ai/agents/orchestrator';

/**
 * POST /api/ai/agents/design
 * Get document structure and formatting suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const context: AgentContext = await request.json();

    // Generate prompt
    const prompt = getDesignAgentPrompt(context);

    // For now, return mock suggestions
    // In production, this would call Rally LLM or Claude API
    const suggestions: AgentSuggestion[] = generateMockDesignSuggestions(context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Design agent error:', error);
    return NextResponse.json(
      { error: 'Failed to get design suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock design suggestions
 * TODO: Replace with actual LLM call
 */
function generateMockDesignSuggestions(context: AgentContext): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  if (!context.content || context.content.trim().length === 0) {
    return [];
  }

  // Check heading hierarchy
  const hasH1 = context.content.includes('# ');
  const hasH2 = context.content.includes('## ');
  const hasH3 = context.content.includes('### ');

  if (hasH3 && !hasH2) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'DESIGN',
      agentName: 'DocBot',
      priority: 'MEDIUM',
      category: 'Structure',
      title: 'Skipped Heading Level',
      message: 'You have H3 headings (###) without H2 (##) headings. This breaks the document hierarchy and makes navigation difficult for screen readers.',
      suggestedAction: 'Add H2 headings before H3 headings to maintain proper hierarchy.',
      reasoning: 'Proper heading hierarchy improves accessibility and document navigation.',
      timestamp: new Date(),
    });
  }

  // Check for bullet lists
  const hasBullets = context.content.includes('- ');
  if (!hasBullets && context.content.length > 200) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'DESIGN',
      agentName: 'DocBot',
      priority: 'LOW',
      category: 'Formatting',
      title: 'Consider Using Bullet Lists',
      message: 'Long paragraphs can be hard to scan. Consider breaking key points into bullet lists for better readability.',
      suggestedAction: 'Identify 3-5 key points and present them as a bulleted list.',
      reasoning: 'Bullet lists improve scanability and help readers quickly grasp key information.',
      timestamp: new Date(),
    });
  }

  // Check paragraph length
  const paragraphs = context.content.split('\n\n');
  const longParagraphs = paragraphs.filter(p => p.length > 500);
  if (longParagraphs.length > 0) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'DESIGN',
      agentName: 'DocBot',
      priority: 'MEDIUM',
      category: 'Organization',
      title: 'Long Paragraphs Detected',
      message: `Found ${longParagraphs.length} paragraph(s) longer than 500 characters. Long paragraphs reduce readability and comprehension.`,
      suggestedAction: 'Break long paragraphs into smaller chunks, each focusing on one main idea.',
      reasoning: 'Shorter paragraphs improve readability and help readers process information more effectively.',
      timestamp: new Date(),
    });
  }

  return suggestions;
}
