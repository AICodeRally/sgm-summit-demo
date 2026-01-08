import { NextRequest, NextResponse } from 'next/server';
import { getUIUXAgentPrompt } from '@/lib/ai/agents/prompts/uiux-agent';
import { generateSuggestionId } from '@/lib/ai/agents/orchestrator';
import type { AgentContext, AgentSuggestion } from '@/lib/ai/agents/orchestrator';

/**
 * POST /api/ai/agents/uiux
 * Get clarity and accessibility suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const context: AgentContext = await request.json();

    // Generate prompt
    const prompt = getUIUXAgentPrompt(context);

    // For now, return mock suggestions
    // In production, this would call Rally LLM or Claude API
    const suggestions: AgentSuggestion[] = generateMockUIUXSuggestions(context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('UI/UX agent error:', error);
    return NextResponse.json(
      { error: 'Failed to get UI/UX suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock UI/UX suggestions
 * TODO: Replace with actual LLM call
 */
function generateMockUIUXSuggestions(context: AgentContext): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  if (!context.content || context.content.trim().length === 0) {
    return [];
  }

  // Check for passive voice (simple detection)
  const passiveIndicators = ['will be', 'shall be', 'is determined', 'are calculated'];
  const hasPassive = passiveIndicators.some(indicator =>
    context.content.toLowerCase().includes(indicator)
  );

  if (hasPassive) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'UIUX',
      agentName: 'ClaraAI',
      priority: 'LOW',
      category: 'Plain Language',
      title: 'Consider Active Voice',
      message: 'Passive voice (e.g., "will be calculated") can make content harder to understand. Active voice is more direct and clear.',
      suggestedAction: 'Rewrite sentences in active voice where possible. Example: "The system calculates..." instead of "Payments will be calculated by..."',
      reasoning: 'Active voice improves clarity and makes the content more engaging for readers.',
      timestamp: new Date(),
    });
  }

  // Check for jargon
  const jargonTerms = ['409a', 'flsa', 'quota attainment', 'sla', 'kpi'];
  const foundJargon = jargonTerms.filter(term =>
    context.content.toLowerCase().includes(term)
  );

  if (foundJargon.length > 0) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'UIUX',
      agentName: 'ClaraAI',
      priority: 'MEDIUM',
      category: 'Clarity',
      title: 'Define Technical Terms',
      message: `Found technical terms that may need explanation: ${foundJargon.join(', ')}. Not all readers may be familiar with these acronyms.`,
      suggestedAction: 'Add a brief explanation or link to definitions for technical terms, especially on first use.',
      reasoning: 'Defining technical terms ensures all readers can understand the content, regardless of their background.',
      timestamp: new Date(),
    });
  }

  // Suggest adding examples
  if (context.content.includes('calculation') || context.content.includes('formula')) {
    if (!context.content.includes('example') && !context.content.includes('e.g.')) {
      suggestions.push({
        id: generateSuggestionId(),
        agentType: 'UIUX',
        agentName: 'ClaraAI',
        priority: 'MEDIUM',
        category: 'Clarity',
        title: 'Add Calculation Example',
        message: 'Formulas and calculations are easier to understand with concrete examples.',
        suggestedAction: 'Add a worked example showing the calculation with sample numbers.',
        suggestedContent: '**Example:** If your quota is $100,000 and you achieved $120,000 in sales (120% attainment), your commission would be...',
        reasoning: 'Examples help readers understand abstract concepts by providing concrete reference points.',
        timestamp: new Date(),
      });
    }
  }

  return suggestions;
}
