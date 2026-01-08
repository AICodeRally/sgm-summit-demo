import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { VersionFiltersSchema, CreateDocumentVersionSchema } from '@/lib/contracts/document-version.contract';

/**
 * GET /api/documents/[documentId]/versions
 * Get all versions for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const versions = await versionProvider.findByDocumentId(documentId);

    return NextResponse.json({
      versions,
      count: versions.length,
    });
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document versions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[documentId]/versions
 * Create a new version for a document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const body = await request.json();
    const data = CreateDocumentVersionSchema.parse({
      ...body,
      documentId,
    });

    const version = await versionProvider.create(data);

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error('Error creating document version:', error);
    return NextResponse.json(
      { error: 'Failed to create document version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
