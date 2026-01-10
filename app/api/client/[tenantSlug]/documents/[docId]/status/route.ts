/**
 * Document Status API Endpoint
 *
 * GET /api/client/[tenantSlug]/documents/[docId]/status
 *
 * Returns current processing status and progress for uploaded document.
 * Used for polling during document processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface DocumentStatus {
  id: string;
  status: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;

  // Processing metadata
  parsedAt?: string | null;
  totalSections?: number | null;
  totalWords?: number | null;
  processingTime?: number | null;

  // Progress indicators
  progress: {
    stage: string;
    percentage: number;
    message: string;
  };

  // Associated data
  planId?: string | null;
  sectionMappings?: {
    total: number;
    accepted: number;
    pending: number;
    rejected: number;
  };
  recommendations?: {
    total: number;
    critical: number;
    high: number;
    applied: number;
  };

  // Error handling
  errorMessage?: string | null;
}

/**
 * Calculate progress based on status
 */
function calculateProgress(status: string): { stage: string; percentage: number; message: string } {
  const statusMap: Record<string, { stage: string; percentage: number; message: string }> = {
    UPLOADED: {
      stage: 'Uploaded',
      percentage: 10,
      message: 'Document uploaded successfully',
    },
    PARSING: {
      stage: 'Parsing',
      percentage: 25,
      message: 'Extracting text and detecting sections...',
    },
    PARSED: {
      stage: 'Parsed',
      percentage: 40,
      message: 'Document parsed successfully',
    },
    MAPPING: {
      stage: 'Mapping',
      percentage: 55,
      message: 'Mapping sections to template...',
    },
    MAPPED: {
      stage: 'Mapped',
      percentage: 70,
      message: 'Sections mapped successfully',
    },
    ANALYZING: {
      stage: 'Analyzing',
      percentage: 85,
      message: 'Analyzing policy gaps...',
    },
    ANALYZED: {
      stage: 'Analyzed',
      percentage: 90,
      message: 'Gap analysis complete',
    },
    READY: {
      stage: 'Ready',
      percentage: 95,
      message: 'Ready for review',
    },
    COMPLETED: {
      stage: 'Completed',
      percentage: 100,
      message: 'Plan created successfully',
    },
    FAILED: {
      stage: 'Failed',
      percentage: 0,
      message: 'Processing failed',
    },
  };

  return statusMap[status] || { stage: 'Unknown', percentage: 0, message: 'Unknown status' };
}

/**
 * GET /api/client/[tenantSlug]/documents/[docId]/status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; docId: string }> }
): Promise<NextResponse<DocumentStatus | { error: string }>> {
  try {
    const { docId } = await params;

    // Fetch document
    const document = await db.uploadedDocument.findUnique({
      where: { id: docId },
      include: {
        sectionMappings: true,
        policyRecommendations: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: 'Document not found',
        },
        { status: 404 }
      );
    }

    // Calculate section mapping stats
    const mappingStats = {
      total: document.sectionMappings.length,
      accepted: document.sectionMappings.filter((m: any) => m.status === 'ACCEPTED').length,
      pending: document.sectionMappings.filter((m: any) => m.status === 'PENDING').length,
      rejected: document.sectionMappings.filter((m: any) => m.status === 'REJECTED').length,
    };

    // Calculate recommendation stats
    const recStats = {
      total: document.policyRecommendations.length,
      critical: document.policyRecommendations.filter((r: any) => r.priority === 'CRITICAL').length,
      high: document.policyRecommendations.filter((r: any) => r.priority === 'HIGH').length,
      applied: document.policyRecommendations.filter((r: any) => r.status === 'APPLIED').length,
    };

    // Calculate progress
    const progress = calculateProgress(document.status);

    // Build response
    const response: DocumentStatus = {
      id: document.id,
      status: document.status,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      uploadedAt: document.uploadedAt.toISOString(),
      uploadedBy: document.uploadedBy,
      parsedAt: document.parsedAt?.toISOString() ?? null,
      totalSections: document.totalSections,
      totalWords: document.totalWords,
      processingTime: document.processingTime,
      progress,
      planId: document.planId,
      sectionMappings: mappingStats,
      recommendations: recStats,
      errorMessage: document.errorMessage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Document status error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
