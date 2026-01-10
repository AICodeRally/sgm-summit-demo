import { NextRequest, NextResponse } from 'next/server';
import { getToddFatherClient, type ValidationResult } from '@/lib/services/toddfather/api-client';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute for AI validation

/**
 * POST /api/governance/validate
 *
 * AI-powered gap validation endpoint.
 * Uses The Toddfather to validate regex-detected gaps and reduce false positives.
 */

interface ValidateRequest {
  documentId: string;
  gapId: string;
  policyCode: string;
  policyName: string;
  requiredElements: string[];
  planTextExcerpt: string;     // ~500 char window around detection
  detectionReason: string;     // Why regex flagged this
  fullPlanText?: string;       // Optional - for more context
}

interface ValidateApiResponse extends ValidationResult {
  documentId: string;
  gapId: string;
  policyCode: string;
  validatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ValidateRequest;
    const {
      documentId,
      gapId,
      policyCode,
      policyName,
      requiredElements,
      planTextExcerpt,
      detectionReason,
    } = body;

    // Validate required fields
    if (!documentId || !gapId || !policyCode) {
      return NextResponse.json(
        { error: 'documentId, gapId, and policyCode are required' },
        { status: 400 }
      );
    }

    if (!planTextExcerpt || planTextExcerpt.trim().length === 0) {
      return NextResponse.json(
        { error: 'planTextExcerpt is required for validation' },
        { status: 400 }
      );
    }

    // Call The Toddfather for AI validation
    const client = getToddFatherClient();
    const validationResult = await client.validateGap({
      policyCode,
      policyName: policyName || policyCode,
      requiredElements: requiredElements || [],
      planTextExcerpt,
      detectionReason: detectionReason || 'Regex pattern did not match required elements',
    });

    const result: ValidateApiResponse = {
      ...validationResult,
      documentId,
      gapId,
      policyCode,
      validatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validation error:', error);

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
      { error: 'Failed to validate gap' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/governance/validate/batch
 *
 * Batch validation for multiple gaps at once
 */
interface BatchValidateRequest {
  documentId: string;
  gaps: Array<{
    gapId: string;
    policyCode: string;
    policyName: string;
    requiredElements: string[];
    planTextExcerpt: string;
    detectionReason: string;
  }>;
  concurrency?: number;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as BatchValidateRequest;
    const { documentId, gaps, concurrency = 3 } = body;

    if (!documentId || !gaps || gaps.length === 0) {
      return NextResponse.json(
        { error: 'documentId and gaps array are required' },
        { status: 400 }
      );
    }

    const client = getToddFatherClient();
    const results: ValidateApiResponse[] = [];
    const errors: Array<{ gapId: string; error: string }> = [];

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < gaps.length; i += concurrency) {
      const batch = gaps.slice(i, i + concurrency);

      const batchPromises = batch.map(async (gap) => {
        try {
          const validationResult = await client.validateGap({
            policyCode: gap.policyCode,
            policyName: gap.policyName || gap.policyCode,
            requiredElements: gap.requiredElements || [],
            planTextExcerpt: gap.planTextExcerpt,
            detectionReason: gap.detectionReason || 'Regex pattern did not match',
          });

          return {
            success: true as const,
            result: {
              ...validationResult,
              documentId,
              gapId: gap.gapId,
              policyCode: gap.policyCode,
              validatedAt: new Date().toISOString(),
            },
          };
        } catch (error) {
          return {
            success: false as const,
            gapId: gap.gapId,
            error: error instanceof Error ? error.message : 'Validation failed',
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

    return NextResponse.json({
      documentId,
      totalGaps: gaps.length,
      validated: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        confirmedGaps: results.filter(r => r.isGap).length,
        falsePositives: results.filter(r => !r.isGap).length,
        avgConfidence: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
          : 0,
      },
    });
  } catch (error) {
    console.error('Batch validation error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch validation failed' },
      { status: 500 }
    );
  }
}
