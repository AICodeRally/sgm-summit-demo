import { NextRequest, NextResponse } from 'next/server';
import { generatePdfFromReviewId, generateReportFromReviewId } from '@/lib/governance/pdf-generator';

export const runtime = 'nodejs';
export const maxDuration = 60; // PDF generation can take time

/**
 * GET /api/governance/reports/[id]
 *
 * Download governance review report as PDF or HTML.
 *
 * Query params:
 * - format: 'pdf' (default) or 'html'
 * - org: Organization name (optional)
 * - state: Organization state (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    const organizationName = searchParams.get('org') || undefined;
    const organizationState = searchParams.get('state') || undefined;

    if (format === 'html') {
      // Generate HTML report only
      const { html, filename } = await generateReportFromReviewId(
        reviewId,
        organizationName,
        organizationState
      );

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${filename.replace('.pdf', '.html')}"`,
        },
      });
    }

    // Generate PDF report
    const result = await generatePdfFromReviewId(
      reviewId,
      organizationName,
      organizationState
    );

    if (result.method === 'weasyprint' && result.pdf) {
      // Return PDF - convert Buffer to Uint8Array for NextResponse
      const pdfData = new Uint8Array(result.pdf);
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'Content-Length': result.pdf.length.toString(),
        },
      });
    }

    // WeasyPrint not available, return HTML with instructions
    return new NextResponse(result.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${result.filename}"`,
        'X-Report-Method': result.method,
        'X-PDF-Instructions': 'Use browser print to save as PDF (Cmd/Ctrl+P)',
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/governance/reports/[id]
 *
 * Generate and store report, returning URL for download.
 * This is useful for async report generation with storage.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const body = await request.json().catch(() => ({}));
    const { organizationName, organizationState, store = false } = body;

    // Generate HTML report
    const { html, filename } = await generateReportFromReviewId(
      reviewId,
      organizationName,
      organizationState
    );

    if (store) {
      // Store HTML report in database
      const { updateReviewReport } = await import('@/lib/governance/db-service');
      await updateReviewReport(reviewId, { htmlReport: html });
    }

    // Return download URL
    const downloadUrl = `/api/governance/reports/${reviewId}?format=html`;
    const pdfUrl = `/api/governance/reports/${reviewId}?format=pdf`;

    return NextResponse.json({
      success: true,
      reviewId,
      filename,
      downloadUrl,
      pdfUrl,
      stored: store,
      htmlLength: html.length,
    });
  } catch (error) {
    console.error('Report generation error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
