import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * POST /api/sgm/documents/[id]/lifecycle
 *
 * Transition document to a new lifecycle state.
 *
 * Body: { action: 'submitForReview' | 'submitForApproval' | 'approve' | 'activate' | 'archive' | 'reject', actor: string, reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, actor, reason, workflowId } = body;

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    let document;

    switch (action) {
      case 'submitForReview':
        document = await documentProvider.submitForReview(id, actor || 'system');
        break;

      case 'submitForApproval':
        document = await documentProvider.submitForApproval(id, actor || 'system', workflowId);
        break;

      case 'approve':
        document = await documentProvider.approve(id, actor || 'system', reason);
        break;

      case 'activate':
        document = await documentProvider.activate(id, actor || 'system');
        break;

      case 'archive':
        document = await documentProvider.archive(id, actor || 'system');
        break;

      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        document = await documentProvider.reject(id, actor || 'system', reason);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
