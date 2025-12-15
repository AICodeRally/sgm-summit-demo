import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * GET /api/sgm/documents/[id]
 *
 * Get document by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    const document = await documentProvider.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sgm/documents/[id]
 *
 * Update document metadata.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    const document = await documentProvider.update({
      id,
      ...body,
      updatedBy: body.updatedBy || 'system',
    });

    return NextResponse.json({ document }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/sgm/documents/[id]
 *
 * Delete (archive) document.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const documentProvider = registry.getDocument();

    // Archive instead of hard delete for compliance
    const document = await documentProvider.archive(id, 'system');

    return NextResponse.json({ document }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
