import { NextRequest, NextResponse } from 'next/server';
import { getToddFatherClient, type RemediationResult } from '@/lib/services/toddfather/api-client';

export const runtime = 'nodejs';
export const maxDuration = 90; // 1.5 minutes for remediation generation

/**
 * POST /api/governance/remediate
 *
 * AI-powered remediation language generation.
 * Uses The Toddfather to generate plan-specific compliant language.
 */

interface RemediateRequest {
  documentId: string;
  gapId: string;
  policyCode: string;
  policyName: string;
  gapDescription: string;
  existingLanguage?: string;    // If partial coverage exists
  organizationContext: {
    name: string;
    state: string;              // Jurisdiction (CA, DEFAULT, etc.)
    industry?: string;
  };
  style?: {
    formality?: 'formal' | 'standard' | 'plain';
    includeExamples?: boolean;
  };
}

interface RemediateApiResponse extends RemediationResult {
  documentId: string;
  gapId: string;
  policyCode: string;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RemediateRequest;
    const {
      documentId,
      gapId,
      policyCode,
      policyName,
      gapDescription,
      existingLanguage,
      organizationContext,
    } = body;

    // Validate required fields
    if (!documentId || !gapId || !policyCode) {
      return NextResponse.json(
        { error: 'documentId, gapId, and policyCode are required' },
        { status: 400 }
      );
    }

    if (!gapDescription || gapDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'gapDescription is required for remediation' },
        { status: 400 }
      );
    }

    if (!organizationContext || !organizationContext.name || !organizationContext.state) {
      return NextResponse.json(
        { error: 'organizationContext with name and state is required' },
        { status: 400 }
      );
    }

    // Call The Toddfather for AI remediation
    const client = getToddFatherClient();
    const remediationResult = await client.generateRemediation({
      organizationName: organizationContext.name,
      organizationState: organizationContext.state,
      policyCode,
      policyName: policyName || policyCode,
      gapDescription,
      existingLanguage,
    });

    const result: RemediateApiResponse = {
      ...remediationResult,
      documentId,
      gapId,
      policyCode,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Remediation error:', error);

    if (error instanceof Error) {
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
      { error: 'Failed to generate remediation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/governance/remediate
 *
 * Batch remediation for multiple gaps
 */
interface BatchRemediateRequest {
  documentId: string;
  organizationContext: {
    name: string;
    state: string;
    industry?: string;
  };
  gaps: Array<{
    gapId: string;
    policyCode: string;
    policyName: string;
    gapDescription: string;
    existingLanguage?: string;
  }>;
  concurrency?: number;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as BatchRemediateRequest;
    const { documentId, organizationContext, gaps, concurrency = 2 } = body;

    if (!documentId || !gaps || gaps.length === 0) {
      return NextResponse.json(
        { error: 'documentId and gaps array are required' },
        { status: 400 }
      );
    }

    if (!organizationContext || !organizationContext.name || !organizationContext.state) {
      return NextResponse.json(
        { error: 'organizationContext with name and state is required' },
        { status: 400 }
      );
    }

    const client = getToddFatherClient();
    const results: RemediateApiResponse[] = [];
    const errors: Array<{ gapId: string; error: string }> = [];

    // Process in batches (lower concurrency since remediation is heavier)
    for (let i = 0; i < gaps.length; i += concurrency) {
      const batch = gaps.slice(i, i + concurrency);

      const batchPromises = batch.map(async (gap) => {
        try {
          const remediationResult = await client.generateRemediation({
            organizationName: organizationContext.name,
            organizationState: organizationContext.state,
            policyCode: gap.policyCode,
            policyName: gap.policyName || gap.policyCode,
            gapDescription: gap.gapDescription,
            existingLanguage: gap.existingLanguage,
          });

          return {
            success: true as const,
            result: {
              ...remediationResult,
              documentId,
              gapId: gap.gapId,
              policyCode: gap.policyCode,
              generatedAt: new Date().toISOString(),
            },
          };
        } catch (error) {
          return {
            success: false as const,
            gapId: gap.gapId,
            error: error instanceof Error ? error.message : 'Remediation failed',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          results.push(result.result);
        } else {
          errors.push({ gapId: result.gapId, error: result.error });
        }
      }
    }

    // Calculate total word count of generated patches
    const totalWords = results.reduce((sum, r) => {
      return sum + (r.patchText?.split(/\s+/).length || 0);
    }, 0);

    return NextResponse.json({
      documentId,
      organizationContext,
      totalGaps: gaps.length,
      generated: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalWordsGenerated: totalWords,
        avgConfidence: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
          : 0,
        hasConflicts: results.some(r => r.conflictWarnings && r.conflictWarnings.length > 0),
      },
    });
  } catch (error) {
    console.error('Batch remediation error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch remediation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/governance/remediate/templates
 *
 * Get remediation templates for specific policy codes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const policyCode = searchParams.get('policyCode');

  // Remediation template hints by policy category
  const templates: Record<string, { structure: string; keyElements: string[] }> = {
    'A': {
      structure: 'Definition section with clear terminology and scope statements',
      keyElements: [
        'Define commission/incentive terms',
        'Clarify payment periods',
        'Specify calculation methodology',
        'Document measurement criteria',
      ],
    },
    'B': {
      structure: 'Performance metrics section with targets and measurement',
      keyElements: [
        'Quota/target methodology',
        'Performance period definitions',
        'Attainment calculation',
        'Territory/account rules',
      ],
    },
    'C': {
      structure: 'Payment terms section with timing and conditions',
      keyElements: [
        'Payment timing specifics',
        'Clawback/recovery provisions',
        'Adjustment procedures',
        'True-up mechanisms',
      ],
    },
    'D': {
      structure: 'Governance section with administration and oversight',
      keyElements: [
        'Plan interpretation authority',
        'Dispute resolution process',
        'Amendment procedures',
        'Exception handling',
      ],
    },
    'E': {
      structure: 'Compliance section with regulatory requirements',
      keyElements: [
        'State-specific provisions',
        'Documentation requirements',
        'Audit procedures',
        'Retention policies',
      ],
    },
    'F': {
      structure: 'Special situations section for exceptions and edge cases',
      keyElements: [
        'Termination provisions',
        'Leave of absence rules',
        'Role change handling',
        'M&A considerations',
      ],
    },
  };

  if (policyCode) {
    const category = policyCode.charAt(0).toUpperCase();
    const template = templates[category];

    if (template) {
      return NextResponse.json({
        policyCode,
        category,
        template,
      });
    }

    return NextResponse.json(
      { error: `No template found for policy code: ${policyCode}` },
      { status: 404 }
    );
  }

  // Return all templates
  return NextResponse.json({ templates });
}
