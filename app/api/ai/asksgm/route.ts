import { NextRequest, NextResponse } from 'next/server';
import { getRallyLLMClient, isRallyLLMConfigured } from '@/lib/ai/rally-llm-client';
import { APPROVAL_ITEMS } from '@/lib/data/synthetic/governance-approvals.data';
import { ALL_GOVERNANCE_DOCUMENTS } from '@/lib/data/synthetic/governance-documents.data';
import { CASE_ITEMS } from '@/lib/data/synthetic/cases.data';
import { ALL_COMMITTEES } from '@/lib/data/synthetic/committees.data';

// Telemetry logging helper
function logTelemetry(event: Record<string, any>) {
  console.log('[SGM Telemetry]', JSON.stringify(event, null, 2));
  // TODO: Store in database or send to central telemetry service
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskSGMRequest {
  messages: Message[];
  tenantId?: string;
  department?: string;
  context?: {
    currentPage?: string;
    documentCode?: string;
    approvalId?: string;
  };
}

/**
 * POST /api/ai/asksgm
 *
 * Endpoint for AskSGM stateful conversation with memory
 * Maintains conversation history and provides governance intelligence
 *
 * Request body:
 * - messages: Array of { role, content } for conversation history
 * - tenantId: Tenant ID (default: "platform")
 * - department: Current department context (sales, legal, compliance)
 * - context: Page/entity context for relevant responses
 *
 * Response:
 * - text: Assistant's response
 * - tokens: { input, output }
 * - timestamp: ISO timestamp
 */
export async function POST(request: NextRequest) {
  try {
    const body: AskSGMRequest = await request.json();
    const tenantId = body.tenantId || 'platform';
    const messages = body.messages || [];

    if (!messages.length) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Fetch relevant governance context (RAG layer using synthetic data)
    const pendingApprovals = APPROVAL_ITEMS.filter(a => a.status === 'PENDING');
    const approvedPolicies = ALL_GOVERNANCE_DOCUMENTS.filter(d => d.documentType === 'POLICY' && d.status === 'APPROVED');
    const activeCases = CASE_ITEMS.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING_INFO' || c.status === 'ESCALATED');
    const committees = ALL_COMMITTEES;

    // Build RAG context string from retrieved data
    const ragContext = [
      `Pending Approvals: ${pendingApprovals.length} documents awaiting review`,
      `Active Policies: ${approvedPolicies.length} approved governance policies`,
      `Active Cases: ${activeCases.length} (${CASE_ITEMS.filter(c => c.type === 'DISPUTE').length} disputes, ${CASE_ITEMS.filter(c => c.type === 'EXCEPTION').length} exceptions)`,
      `Governance Committees: ${committees.map(c => c.name).join(', ')}`,
      `Total Documents: ${ALL_GOVERNANCE_DOCUMENTS.length}`,
    ].join('\n');

    // Build system prompt with governance context
    const systemPrompt = `You are AskSGM, a governance intelligence assistant for the Sales Governance Manager (SGM) SPARCC platform.

## Governance Context
- **Department**: ${body.department || 'governance'}
- **Total Documents**: ${ALL_GOVERNANCE_DOCUMENTS.length}
- **Pending Approvals**: ${pendingApprovals.length}
- **Active Cases**: ${activeCases.length}
- **Current Page**: ${body.context?.currentPage || 'dashboard'}

## Retrieved Data (RAG)
${ragContext}

## Your Role
You are an expert in sales compensation governance, helping users understand:
- **Policy & Compliance**: Explain compensation policies, approval workflows, regulatory requirements
- **Approvals & Workflows**: Track approval status, SLA compliance, committee decisions
- **Case Management**: Guide dispute resolution, exception requests, territory changes
- **Document Governance**: Search policies, procedures, templates, and frameworks
- **Compensation Plans**: Explain plan design, quota setting, commission calculations, windfall reviews

## Key Knowledge Areas
- **SGCC (Sales Governance Compensation Committee)**: Approves compensation plans, policy changes
- **CRB (Compensation Review Board)**: Reviews windfall deals >$1M with 6 decision options
- **Policy Types**: FRAMEWORK, POLICY, PROCEDURE, TEMPLATE, CHECKLIST, GUIDE
- **Approval SLAs**: Standard 10 business days, expedited 5 business days
- **Case Types**: DISPUTE, EXCEPTION, TERRITORY_CHANGE, POLICY_CLARIFICATION

## Instructions
1. Provide specific, governance-focused answers using the context above
2. When discussing policies, reference document codes (e.g., SCP-001, GC-001)
3. Explain approval workflows, SLA requirements, and escalation paths
4. Be proactive: suggest related policies or workflows
5. Keep responses concise but complete
6. Always acknowledge limitations: "I don't have real-time access to [specific data]"

## Example Responses
- Explain the SGCC approval process for new compensation plans
- Summarize SLA compliance and identify at-risk approvals
- Guide users through exception request procedures
- Explain CRB windfall decision options (Full Pay, Cap, Amortization, etc.)
- Identify relevant policies for specific compensation scenarios

Current conversation context provided by user. Respond helpfully and professionally with governance expertise.`;

    // Use Rally LLaMA if configured, otherwise fallback to Claude
    const startTime = Date.now();
    let responseContent: string;
    let modelUsed: string;
    let tokensUsed: { input: number; output: number; total: number };
    let cached: boolean = false;

    if (isRallyLLMConfigured()) {
      // Use Rally LLaMA (SPM-tuned for compensation governance)
      const rallyClient = getRallyLLMClient();
      const clientStatus = rallyClient.getStatus();

      console.log(`🔧 [AskSGM] Using LLM: ${clientStatus.model} (Rally)`);

      const chatResponse = await rallyClient.chat(
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          systemPrompt: systemPrompt,
          maxTokens: 1024,
          temperature: 0.6,
        }
      );

      responseContent = chatResponse.content;
      modelUsed = clientStatus.model;
      tokensUsed = chatResponse.tokensUsed;
      cached = chatResponse.cached;
    } else {
      // Fallback to Claude API
      console.log(`🔧 [AskSGM] Using LLM: Claude 3.5 Sonnet (Fallback)`);

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5-20251101',
          max_tokens: 1024,
          temperature: 0.6,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!claudeResponse.ok) {
        const error = await claudeResponse.text();
        throw new Error(`Claude API error: ${claudeResponse.status} - ${error}`);
      }

      const claudeData = (await claudeResponse.json()) as any;
      responseContent = claudeData.content?.[0]?.text || '';
      modelUsed = 'claude-opus-4-5-20251101';
      tokensUsed = {
        input: claudeData.usage?.input_tokens || 0,
        output: claudeData.usage?.output_tokens || 0,
        total: (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0),
      };
    }

    const endTime = Date.now();
    const responseLength = responseContent.length;
    const responseTime = endTime - startTime;

    logTelemetry({
      name: 'ai.request',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        modelId: modelUsed,
        modelType: isRallyLLMConfigured() ? 'rally-llama-spm' : 'claude-sonnet',
        intent: 'sgm_governance_qa',
        department: body.department || 'governance',
        inputTokens: tokensUsed.input,
      },
    });

    logTelemetry({
      name: 'ai.response',
      appId: 'sgm-sparcc',
      tenantId: tenantId,
      ts: new Date().toISOString(),
      metrics: {
        responseLength,
        responseTime: `${responseTime}ms`,
        inputTokens: tokensUsed.input,
        outputTokens: tokensUsed.output,
        totalTokens: tokensUsed.total,
        cached: cached,
        success: true,
      },
    });

    // Log additional context
    console.log('✅ AskSGM interaction:', {
      model: modelUsed,
      department: body.department,
      messageCount: messages.length,
      cached: cached,
      tokens: tokensUsed,
      responseTime: `${responseTime}ms`,
      responseLength,
    });

    return NextResponse.json({
      text: responseContent,
      tokens: {
        input: tokensUsed.input,
        output: tokensUsed.output,
      },
      timestamp: new Date().toISOString(),
      cached: cached,
    });
  } catch (error) {
    console.error('AskSGM error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Log telemetry event - AskSGM error
    logTelemetry({
      name: 'api.error',
      appId: 'sgm-sparcc',
      tenantId: 'platform',
      ts: new Date().toISOString(),
      metrics: {
        endpoint: '/api/ai/asksgm',
        errorClass: error instanceof Error ? error.name : 'UNKNOWN',
        statusCode: 500,
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
