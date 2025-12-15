import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * GET /api/sgm/documents/[id]/versions
 *
 * Get version history for a document.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    // Get the current document
    const currentDoc = await documentProvider.findById(id);
    if (!currentDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get all versions (including superseded versions)
    const versions = await documentProvider.findVersions(id);

    return NextResponse.json(
      {
        documentId: id,
        current: currentDoc,
        versions: versions || [currentDoc],
        meta: {
          total: (versions?.length || 1),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sgm/documents/[id]/versions
 *
 * Create a new version of the document.
 *
 * Body: { bumpType: 'major' | 'minor' | 'patch', changes?: Partial<Document> }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    // Create new version
    const newVersion = await documentProvider.createVersion(
      id,
      body.changes || {},
      body.bumpType || 'patch'
    );

    return NextResponse.json(
      { version: newVersion },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
