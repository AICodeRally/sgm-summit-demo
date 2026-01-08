import { NextRequest, NextResponse } from 'next/server';
import { getPolicyExpertPrompt } from '@/lib/ai/agents/prompts/policy-expert';
import { generateSuggestionId } from '@/lib/ai/agents/orchestrator';
import type { AgentContext, AgentSuggestion } from '@/lib/ai/agents/orchestrator';

/**
 * POST /api/ai/agents/policy-expert
 * Get policy and compliance suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const context: AgentContext = await request.json();

    // Generate prompt
    const prompt = getPolicyExpertPrompt(context);

    // For now, return mock suggestions
    // In production, this would call Rally LLM or Claude API
    const suggestions: AgentSuggestion[] = generateMockPolicySuggestions(context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Policy Expert agent error:', error);
    return NextResponse.json(
      { error: 'Failed to get policy suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock policy suggestions
 * TODO: Replace with actual LLM call
 */
function generateMockPolicySuggestions(context: AgentContext): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  // Only generate suggestions if there's content
  if (!context.content || context.content.trim().length === 0) {
    return [];
  }

  // Check for Section 409A compliance (for compensation plans)
  if (context.planType === 'COMPENSATION_PLAN' &&
      context.section.sectionKey.includes('payment') &&
      !context.content.toLowerCase().includes('409a')) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'POLICY_EXPERT',
      agentName: 'LexAI',
      priority: 'CRITICAL',
      category: 'Compliance',
      title: 'Missing Section 409A Compliance Statement',
      message: 'Compensation plans with deferred payment terms must include Section 409A compliance language to avoid adverse tax consequences for participants.',
      suggestedAction: 'Add a statement confirming this plan complies with Section 409A or explicitly states it is exempt.',
      suggestedContent: 'This plan is intended to comply with Section 409A of the Internal Revenue Code. To the extent applicable, this plan shall be interpreted and administered in a manner consistent with Section 409A.',
      reasoning: 'Failure to comply with Section 409A can result in immediate taxation, 20% penalty tax, and interest charges for participants.',
      references: ['IRC Section 409A', 'IRS Notice 2005-1'],
      timestamp: new Date(),
    });
  }

  // Check for dispute resolution process
  if (context.section.sectionKey.includes('dispute') || context.section.title.toLowerCase().includes('dispute')) {
    if (!context.content.toLowerCase().includes('committee') &&
        !context.content.toLowerCase().includes('sgcc')) {
      suggestions.push({
        id: generateSuggestionId(),
        agentType: 'POLICY_EXPERT',
        agentName: 'LexAI',
        priority: 'HIGH',
        category: 'Policy Gap',
        title: 'Specify Dispute Resolution Authority',
        message: 'Best practice requires clear identification of the governing body responsible for dispute resolution.',
        suggestedAction: 'Specify that the Sales Governance and Compensation Committee (SGCC) has final authority over disputes.',
        reasoning: 'Clear authority prevents escalation confusion and ensures consistent application of policies.',
        timestamp: new Date(),
      });
    }
  }

  // Check for eligibility criteria
  if (context.section.sectionKey.includes('eligibility') || context.section.title.toLowerCase().includes('eligibility')) {
    if (context.content.trim().length < 50) {
      suggestions.push({
        id: generateSuggestionId(),
        agentType: 'POLICY_EXPERT',
        agentName: 'LexAI',
        priority: 'HIGH',
        category: 'Policy Gap',
        title: 'Eligibility Criteria Incomplete',
        message: 'Eligibility sections should specify employment status, tenure requirements, and job classifications to avoid ambiguity and potential discrimination claims.',
        suggestedAction: 'Add specific criteria including: full-time/part-time status, minimum service period, eligible job titles, and good standing requirements.',
        reasoning: 'Clear eligibility criteria are essential for FLSA compliance and equal pay requirements.',
        references: ['FLSA §541', 'Equal Pay Act'],
        timestamp: new Date(),
      });
    }
  }

  return suggestions;
}
