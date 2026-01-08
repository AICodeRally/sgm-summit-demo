import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { ApproveVersionSchema } from '@/lib/contracts/document-version.contract';

/**
 * POST /api/documents/versions/[versionId]/approve
 * Approve a version (UNDER_REVIEW → APPROVED)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const body = await request.json();
    const data = ApproveVersionSchema.parse({
      ...body,
      versionId,
    });

    const approvedVersion = await versionProvider.approve(data);

    return NextResponse.json({
      version: approvedVersion,
      message: 'Version approved successfully',
    });
  } catch (error) {
    console.error('Error approving version:', error);
    return NextResponse.json(
      { error: 'Failed to approve version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
