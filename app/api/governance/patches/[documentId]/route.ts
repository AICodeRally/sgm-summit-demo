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
    const patches = await client.getPatches(documentId);

    return new NextResponse(patches, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${documentId}_REMEDIATION_PATCHES.txt"`,
      },
    });
  } catch (error) {
    console.error('Error fetching patches:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Patches not found for this document' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch patches' },
      { status: 500 }
    );
  }
}
