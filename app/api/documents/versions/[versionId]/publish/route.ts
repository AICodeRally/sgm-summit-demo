import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { PublishToActiveSchema } from '@/lib/contracts/document-version.contract';

/**
 * POST /api/documents/versions/[versionId]/publish
 * Publish APPROVED version to ACTIVE_FINAL
 * Supersedes any existing active version
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
    const data = PublishToActiveSchema.parse({
      ...body,
      versionId,
    });

    const publishedVersion = await versionProvider.publishToActive(data);

    return NextResponse.json({
      version: publishedVersion,
      message: 'Version published successfully',
    });
  } catch (error) {
    console.error('Error publishing version:', error);
    return NextResponse.json(
      { error: 'Failed to publish version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
