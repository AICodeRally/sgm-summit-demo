import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';

/**
 * GET /api/sgm/documents/[id]/download
 *
 * Download document file.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const documentProvider = registry.getDocument();
    const fileStorage = registry.getFileStorage();

    // Get document metadata
    const document = await documentProvider.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get file URL (for local storage, this would be a file path)
    const fileUrl = await fileStorage.getFileUrl(document.filePath);

    // For synthetic/in-memory storage, we return the metadata with instructions
    if (!fileUrl) {
      return NextResponse.json(
        {
          document,
          message: 'File storage not implemented for synthetic mode',
          filePath: document.filePath,
        },
        { status: 200 }
      );
    }

    // In a real implementation, we would stream the file from storage
    return NextResponse.redirect(fileUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
