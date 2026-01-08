import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import {
  SubmitForReviewSchema,
  SubmitForApprovalSchema,
  ApprovePlanSchema,
  PublishPlanSchema,
  RejectPlanSchema,
  ArchivePlanSchema,
} from '@/lib/contracts/plan.contract';

/**
 * POST /api/plans/[id]/lifecycle
 * Manage plan lifecycle transitions
 *
 * Supported actions:
 * - submit-for-review: DRAFT → UNDER_REVIEW
 * - submit-for-approval: UNDER_REVIEW → PENDING_APPROVAL
 * - approve: PENDING_APPROVAL → APPROVED
 * - publish: APPROVED → PUBLISHED
 * - reject: UNDER_REVIEW/PENDING_APPROVAL → DRAFT
 * - archive: * → ARCHIVED
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const registry = getRegistry();
    const planProvider = registry.getPlan();

    let plan;

    switch (action) {
      case 'submit-for-review': {
        const validated = SubmitForReviewSchema.parse({ planId: id, ...data });
        plan = await planProvider.submitForReview(validated);
        break;
      }

      case 'submit-for-approval': {
        const validated = SubmitForApprovalSchema.parse({ planId: id, ...data });
        plan = await planProvider.submitForApproval(validated);
        break;
      }

      case 'approve': {
        const validated = ApprovePlanSchema.parse({ planId: id, ...data });
        plan = await planProvider.approve(validated);
        break;
      }

      case 'publish': {
        const validated = PublishPlanSchema.parse({ planId: id, ...data });
        plan = await planProvider.publish(validated);
        break;
      }

      case 'reject': {
        const validated = RejectPlanSchema.parse({ planId: id, ...data });
        plan = await planProvider.reject(validated);
        break;
      }

      case 'archive': {
        const validated = ArchivePlanSchema.parse({ planId: id, ...data });
        plan = await planProvider.archive(validated);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      plan,
      message: `Plan ${action} successful`,
    });
  } catch (error: any) {
    console.error('Error in plan lifecycle transition:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process lifecycle transition' },
      { status: 500 }
    );
  }
}
