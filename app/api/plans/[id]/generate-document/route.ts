import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { GeneratePlanDocumentSchema } from '@/lib/contracts/plan.contract';

/**
 * POST /api/plans/[id]/generate-document
 * Generate a document from a plan
 *
 * Request body:
 * {
 *   "format": "PDF" | "DOCX" | "MARKDOWN",
 *   "includeMetadata": boolean,
 *   "includeSections": string[] (optional - specific section IDs),
 *   "generatedBy": string
 * }
 *
 * Response:
 * {
 *   "documentId": string,
 *   "format": string,
 *   "generatedAt": Date,
 *   "documentUrl": string (optional)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = GeneratePlanDocumentSchema.parse({
      planId: id,
      ...body,
    });

    const registry = getRegistry();
    const planProvider = registry.getPlan();

    // Generate document
    const documentId = await planProvider.generateDocument(data);

    // Get plan to include in response
    const plan = await planProvider.findById(id);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      documentId,
      planId: id,
      planCode: plan.planCode,
      format: data.format,
      generatedAt: new Date(),
      message: 'Document generated successfully',
    });
  } catch (error: any) {
    console.error('Error generating document:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate document' },
      { status: 500 }
    );
  }
}
