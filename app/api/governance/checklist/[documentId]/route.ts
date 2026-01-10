import { NextRequest, NextResponse } from 'next/server';
import { getGovLensClient } from '@/lib/services/govlens/api-client';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Call GovLens Python API
    const client = getGovLensClient();
    const checklist = await client.getChecklist(documentId);

    return new NextResponse(checklist, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${documentId}_REMEDIATION_CHECKLIST.md"`,
      },
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Checklist not found for this document' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}
