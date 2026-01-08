import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { ProcessToMarkdownSchema } from '@/lib/contracts/document-version.contract';

/**
 * POST /api/documents/versions/[versionId]/process
 * Process RAW version to PROCESSED markdown
 * Creates new version with lifecycleStatus = PROCESSED
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
    const data = ProcessToMarkdownSchema.parse({
      ...body,
      rawVersionId: versionId,
    });

    const processedVersion = await versionProvider.processToMarkdown(data);

    return NextResponse.json({
      version: processedVersion,
      message: 'Document processed to markdown successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing document to markdown:', error);
    return NextResponse.json(
      { error: 'Failed to process document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
