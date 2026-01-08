import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';

/**
 * GET /api/documents/[documentId]/versions/timeline
 * Get version timeline for visualization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const timeline = await versionProvider.getTimeline(documentId);
    const stats = await versionProvider.getVersionStats(documentId);

    return NextResponse.json({
      timeline,
      stats,
    });
  } catch (error) {
    console.error('Error fetching version timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version timeline' },
      { status: 500 }
    );
  }
}
