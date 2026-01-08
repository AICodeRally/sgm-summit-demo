import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeBasePrompt } from '@/lib/ai/agents/prompts/knowledge-base';
import { generateSuggestionId } from '@/lib/ai/agents/orchestrator';
import type { AgentContext, AgentSuggestion } from '@/lib/ai/agents/orchestrator';

/**
 * POST /api/ai/agents/knowledge-base
 * Get boilerplate and template suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const context: AgentContext = await request.json();

    // Generate prompt
    const prompt = getKnowledgeBasePrompt(context);

    // For now, return mock suggestions
    // In production, this would call Rally LLM with RAG or Claude API
    const suggestions: AgentSuggestion[] = generateMockKnowledgeBaseSuggestions(context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Knowledge Base agent error:', error);
    return NextResponse.json(
      { error: 'Failed to get knowledge base suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock knowledge base suggestions
 * TODO: Replace with actual LLM call with RAG retrieval
 */
function generateMockKnowledgeBaseSuggestions(context: AgentContext): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  // Suggest boilerplate for common section types
  if (context.section.sectionKey.includes('eligibility') && (!context.content || context.content.trim().length < 50)) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'KNOWLEDGE_BASE',
      agentName: 'ArchiveAI',
      priority: 'HIGH',
      category: 'Boilerplate',
      title: 'Standard Eligibility Language Available',
      message: 'Found approved boilerplate text for eligibility sections from TPL-COMP-001 (Annual Sales Compensation Plan template).',
      suggestedContent: `## Eligibility Criteria

Participation in this compensation plan is limited to employees who meet ALL of the following criteria:

- **Employment Status:** Full-time employees classified as sales representatives
- **Tenure:** Minimum of 90 days of continuous employment as of the plan effective date
- **Good Standing:** No active performance improvement plans or disciplinary actions
- **Job Classification:** Positions explicitly designated as sales roles in the organizational structure

**Note:** Part-time employees, independent contractors, and temporary workers are not eligible to participate in this plan.`,
      suggestedAction: 'Review this standard text and customize for your specific plan requirements.',
      reasoning: 'This language has been legal-reviewed and used successfully in 15+ plans.',
      references: ['TPL-COMP-001', 'Legal Review 2024-Q3'],
      timestamp: new Date(),
    });
  }

  if (context.section.sectionKey.includes('dispute') && (!context.content || context.content.trim().length < 50)) {
    suggestions.push({
      id: generateSuggestionId(),
      agentType: 'KNOWLEDGE_BASE',
      agentName: 'ArchiveAI',
      priority: 'HIGH',
      category: 'Boilerplate',
      title: 'Standard Dispute Resolution Process',
      message: 'Found approved dispute resolution language used in 20+ active plans.',
      suggestedContent: `## Dispute Resolution Process

Any disputes, questions, or concerns regarding this compensation plan must be handled through the following process:

1. **Initial Review:** Submit a written dispute to your direct manager within 30 days of the issue arising
2. **Escalation:** If unresolved, the dispute will be escalated to the Sales Operations team within 15 days
3. **Final Decision:** The Sales Governance and Compensation Committee (SGCC) has final authority over all disputes
4. **Timeline:** SGCC will review and provide a final decision within 45 days of receipt

**Important:** All disputes must be submitted in writing with supporting documentation. Verbal disputes will not be processed.`,
      suggestedAction: 'Use this standard process or customize the timeline to match your governance structure.',
      reasoning: 'Consistent dispute resolution processes reduce confusion and ensure fair treatment.',
      references: ['SGCC Policy Doc', 'TPL-COMP-002'],
      timestamp: new Date(),
    });
  }

  if (context.section.sectionKey.includes('amendment') || context.section.title.toLowerCase().includes('change')) {
    if (!context.content || context.content.trim().length < 50) {
      suggestions.push({
        id: generateSuggestionId(),
        agentType: 'KNOWLEDGE_BASE',
        agentName: 'ArchiveAI',
        priority: 'MEDIUM',
        category: 'Boilerplate',
        title: 'Standard Amendment Rights Language',
        message: 'Legal-approved amendment clause available from template library.',
        suggestedContent: `## Plan Amendment and Modification

The Company reserves the right to amend, modify, suspend, or terminate this compensation plan at any time, with or without prior notice, subject to applicable law.

**Notice Requirements:**
- Material changes affecting payment calculations require 30 days advance notice
- Administrative changes may be implemented immediately
- Changes will be communicated via email and posted to the company intranet

**Grandfathering:** Amendments will not reduce earned but unpaid compensation for periods prior to the amendment effective date.`,
        suggestedAction: 'This clause balances company flexibility with employee protection.',
        reasoning: 'Standard amendment language prevents legal issues while maintaining operational flexibility.',
        references: ['Legal Review 2024-Q4', 'TPL-COMP-001'],
        timestamp: new Date(),
      });
    }
  }

  return suggestions;
}
