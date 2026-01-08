import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { ImportRawDocumentSchema } from '@/lib/contracts/document-version.contract';

/**
 * POST /api/documents/versions/import-raw
 * Import a RAW source document (PDF, DOCX, etc.)
 * Creates initial version with lifecycleStatus = RAW
 */
export async function POST(request: NextRequest) {
  try {
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const body = await request.json();
    const data = ImportRawDocumentSchema.parse(body);

    const rawVersion = await versionProvider.importRaw(data);

    return NextResponse.json({
      version: rawVersion,
      message: 'RAW document imported successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing RAW document:', error);
    return NextResponse.json(
      { error: 'Failed to import RAW document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
