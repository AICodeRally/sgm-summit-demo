/**
 * AI Agent Orchestrator
 *
 * Manages the 4 specialized agents and coordinates their suggestions.
 * Agents: Policy Expert, Design, UI/UX, Knowledge Base
 */

import type { PlanSection } from '@/lib/contracts/plan-section.contract';
import type { Plan } from '@/lib/contracts/plan.contract';
import type { ApplicableFramework } from '@/lib/contracts/governance-framework.contract';

export interface AgentContext {
  plan: Plan;
  section: PlanSection;
  content: string;
  planType: string;
  governanceFrameworks?: ApplicableFramework[];
}

export interface AgentSuggestion {
  id: string;
  agentType: 'POLICY_EXPERT' | 'DESIGN' | 'UIUX' | 'KNOWLEDGE_BASE';
  agentName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  message: string;
  suggestedAction?: string;
  suggestedContent?: string;
  reasoning?: string;
  references?: string[];
  timestamp: Date;
}

export interface OrchestratorResponse {
  suggestions: AgentSuggestion[];
  mode: 'realtime' | 'comprehensive';
  duration: number;
  agentsInvoked: string[];
}

export type OrchestratorMode = 'realtime' | 'comprehensive';

export class AgentOrchestrator {
  private mode: OrchestratorMode;

  constructor(mode: OrchestratorMode = 'realtime') {
    this.mode = mode;
  }

  /**
   * Get suggestions from all agents
   */
  async getSuggestions(context: AgentContext): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    const agentsInvoked: string[] = [];

    try {
      // In realtime mode, invoke agents in parallel with timeout
      // In comprehensive mode, invoke sequentially for thorough analysis
      const suggestions: AgentSuggestion[] = [];

      if (this.mode === 'realtime') {
        // Parallel execution with 3s timeout
        const timeout = 3000;
        const agentPromises = [
          this.invokePolicyExpert(context).catch(() => null),
          this.invokeDesignAgent(context).catch(() => null),
          this.invokeUIUXAgent(context).catch(() => null),
          this.invokeKnowledgeBase(context).catch(() => null),
        ];

        const results = await Promise.race([
          Promise.all(agentPromises),
          new Promise<null[]>((resolve) => setTimeout(() => resolve([null, null, null, null]), timeout)),
        ]);

        results.forEach((result, index) => {
          if (result) {
            suggestions.push(...result);
            agentsInvoked.push(['Policy Expert', 'Design', 'UI/UX', 'Knowledge Base'][index]);
          }
        });
      } else {
        // Sequential execution for comprehensive mode
        const policyResults = await this.invokePolicyExpert(context);
        suggestions.push(...policyResults);
        agentsInvoked.push('Policy Expert');

        const designResults = await this.invokeDesignAgent(context);
        suggestions.push(...designResults);
        agentsInvoked.push('Design');

        const uiuxResults = await this.invokeUIUXAgent(context);
        suggestions.push(...uiuxResults);
        agentsInvoked.push('UI/UX');

        const kbResults = await this.invokeKnowledgeBase(context);
        suggestions.push(...kbResults);
        agentsInvoked.push('Knowledge Base');
      }

      // Sort by priority: CRITICAL > HIGH > MEDIUM > LOW
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      const duration = Date.now() - startTime;

      return {
        suggestions,
        mode: this.mode,
        duration,
        agentsInvoked,
      };
    } catch (error) {
      console.error('Orchestrator error:', error);
      return {
        suggestions: [],
        mode: this.mode,
        duration: Date.now() - startTime,
        agentsInvoked,
      };
    }
  }

  /**
   * Invoke Policy Expert Agent
   */
  private async invokePolicyExpert(context: AgentContext): Promise<AgentSuggestion[]> {
    try {
      const response = await fetch('/api/ai/agents/policy-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Policy Expert agent error:', error);
      return [];
    }
  }

  /**
   * Invoke Design Agent
   */
  private async invokeDesignAgent(context: AgentContext): Promise<AgentSuggestion[]> {
    try {
      const response = await fetch('/api/ai/agents/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Design agent error:', error);
      return [];
    }
  }

  /**
   * Invoke UI/UX Agent
   */
  private async invokeUIUXAgent(context: AgentContext): Promise<AgentSuggestion[]> {
    try {
      const response = await fetch('/api/ai/agents/uiux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('UI/UX agent error:', error);
      return [];
    }
  }

  /**
   * Invoke Knowledge Base Agent
   */
  private async invokeKnowledgeBase(context: AgentContext): Promise<AgentSuggestion[]> {
    try {
      const response = await fetch('/api/ai/agents/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Knowledge Base agent error:', error);
      return [];
    }
  }
}

/**
 * Helper function to generate suggestion ID
 */
export function generateSuggestionId(): string {
  return `sug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
