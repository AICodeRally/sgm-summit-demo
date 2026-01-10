/**
 * The Toddfather API Client
 *
 * TypeScript client for calling the AICR Ask API (The Toddfather).
 * Provides SPM-focused RAG queries, gap validation, and remediation generation.
 */

/**
 * API Configuration
 */
const AICR_API_URL = process.env.AICR_API_URL || 'http://localhost:3000';
const AICR_API_KEY = process.env.AICR_API_KEY || '';

/**
 * API Response Types
 */

export interface Citation {
  label: string;
  score: number;
  excerpt: string;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
  persona: string;
  model: string;
  searchTimeMs: number;
  inferenceTimeMs: number;
  conversationId: string;
}

export interface ValidationResult {
  isGap: boolean;
  confidence: number;
  reasoning: string;
  suggestedGrade: 'A' | 'B' | 'C';
  missingElements: string[];
}

export interface RemediationResult {
  patchText: string;
  insertionPoint: string;
  integrationNotes: string;
  conflictWarnings: string[];
  legalDisclaimer: string;
  confidence: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp?: string;
}

/**
 * Persona types for different contexts
 */
export type ToddFatherPersona =
  | 'askSPARCC'      // SPM/Governance focused
  | 'askItem'        // General platform
  | 'askOperate'     // Operations
  | 'askStudio';     // Authoring

/**
 * The Toddfather API Client
 */
export class ToddFatherAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || AICR_API_URL;
    this.apiKey = apiKey || AICR_API_KEY;
  }

  /**
   * Build request headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ provider: string; model: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/api/ask`, {
      method: 'HEAD',
    });

    return {
      provider: response.headers.get('X-LLM-Provider') || 'unknown',
      model: response.headers.get('X-LLM-Model') || 'unknown',
      status: response.headers.get('X-LLM-Status') || 'unknown',
    };
  }

  /**
   * Ask a question using The Toddfather RAG system
   */
  async ask(
    question: string,
    options: {
      persona?: ToddFatherPersona;
      conversationId?: string;
      tenantId?: string;
      limit?: number;
    } = {}
  ): Promise<AskResponse> {
    const response = await fetch(`${this.baseUrl}/api/ask`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        question,
        persona: options.persona || 'askSPARCC',
        conversationId: options.conversationId,
        tenantId: options.tenantId || 'sgm',
        limit: options.limit || 6,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Ask request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Validate a detected gap using AI
   */
  async validateGap(
    gapContext: {
      policyCode: string;
      policyName: string;
      requiredElements: string[];
      planTextExcerpt: string;
      detectionReason: string;
    }
  ): Promise<ValidationResult> {
    const prompt = `
You are an expert in Sales Performance Management (SPM) and compensation plan governance.

POLICY: ${gapContext.policyCode} - ${gapContext.policyName}
REQUIRED ELEMENTS: ${gapContext.requiredElements.join(', ')}

PLAN TEXT EXCERPT:
"""
${gapContext.planTextExcerpt}
"""

DETECTION RESULT: The system detected this as a potential gap because: ${gapContext.detectionReason}

TASK: Analyze whether this is a TRUE gap or FALSE POSITIVE.

Consider:
1. Is there substantive language addressing this policy requirement?
2. Are the required elements explicitly or implicitly covered?
3. Is this just boilerplate vs. actual compliance language?

Respond ONLY with valid JSON (no markdown, no explanation outside JSON):
{
  "isGap": true or false,
  "confidence": 0-100,
  "reasoning": "your explanation",
  "suggestedGrade": "A" or "B" or "C",
  "missingElements": ["element1", "element2"]
}`;

    const response = await this.ask(prompt, { persona: 'askSPARCC' });

    // Parse the JSON from the response
    try {
      // Extract JSON from the answer (handle potential markdown wrapping)
      let jsonStr = response.answer;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      return JSON.parse(jsonStr);
    } catch (error) {
      // If JSON parsing fails, return a default response
      console.error('Failed to parse validation response:', error);
      return {
        isGap: true,
        confidence: 50,
        reasoning: response.answer,
        suggestedGrade: 'B',
        missingElements: [],
      };
    }
  }

  /**
   * Generate remediation language for a gap
   */
  async generateRemediation(
    context: {
      organizationName: string;
      organizationState: string;
      policyCode: string;
      policyName: string;
      gapDescription: string;
      existingLanguage?: string;
    }
  ): Promise<RemediationResult> {
    const prompt = `
You are drafting remediation language for a compensation plan gap.

ORGANIZATION: ${context.organizationName} (${context.organizationState})
POLICY REQUIREMENT: ${context.policyCode} - ${context.policyName}
GAP IDENTIFIED: ${context.gapDescription}

${context.existingLanguage ? `EXISTING PLAN LANGUAGE (if any):
"""
${context.existingLanguage}
"""` : 'No existing language found for this policy.'}

TASK: Generate compliant language that:
1. Addresses the specific gap
2. Uses terminology consistent with the existing plan
3. Is appropriate for ${context.organizationState} jurisdiction
4. Includes standard protective language

Respond ONLY with valid JSON (no markdown, no explanation outside JSON):
{
  "patchText": "The generated remediation language (200-400 words)...",
  "insertionPoint": "Suggested location in document",
  "integrationNotes": "How to integrate with existing language",
  "conflictWarnings": ["any conflicts with existing language"],
  "legalDisclaimer": "This language should be reviewed by legal counsel before implementation.",
  "confidence": 0-100
}`;

    const response = await this.ask(prompt, { persona: 'askSPARCC' });

    // Parse the JSON from the response
    try {
      let jsonStr = response.answer;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse remediation response:', error);
      return {
        patchText: response.answer,
        insertionPoint: 'Manual review required',
        integrationNotes: 'Could not auto-detect integration point',
        conflictWarnings: [],
        legalDisclaimer: 'This language should be reviewed by legal counsel before implementation.',
        confidence: 30,
      };
    }
  }

  /**
   * Continue a conversation
   */
  async continueConversation(
    conversationId: string,
    question: string
  ): Promise<AskResponse> {
    return this.ask(question, { conversationId });
  }

  /**
   * Get conversation history (if supported by backend)
   */
  async getConversation(conversationId: string): Promise<{
    conversationId: string;
    messages: ConversationMessage[];
  }> {
    const response = await fetch(
      `${this.baseUrl}/api/ask/conversations/${conversationId}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    return response.json();
  }
}

/**
 * Singleton instance
 */
let _client: ToddFatherAPIClient | null = null;

export function getToddFatherClient(): ToddFatherAPIClient {
  if (!_client) {
    _client = new ToddFatherAPIClient();
  }
  return _client;
}

/**
 * Convenience functions
 */

export async function askSPM(
  question: string,
  conversationId?: string
): Promise<AskResponse> {
  return getToddFatherClient().ask(question, {
    persona: 'askSPARCC',
    conversationId,
  });
}

export async function validateGap(
  gapContext: {
    policyCode: string;
    policyName: string;
    requiredElements: string[];
    planTextExcerpt: string;
    detectionReason: string;
  }
): Promise<ValidationResult> {
  return getToddFatherClient().validateGap(gapContext);
}

export async function generateRemediation(
  context: {
    organizationName: string;
    organizationState: string;
    policyCode: string;
    policyName: string;
    gapDescription: string;
    existingLanguage?: string;
  }
): Promise<RemediationResult> {
  return getToddFatherClient().generateRemediation(context);
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const result = await getToddFatherClient().healthCheck();
    return result.status === 'configured' || result.status === 'default';
  } catch {
    return false;
  }
}
