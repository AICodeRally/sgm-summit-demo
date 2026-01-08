import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { UpdatePlanSectionSchema } from '@/lib/contracts/plan-section.contract';

/**
 * PUT /api/plans/[id]/sections/[sectionId]
 * Update a plan section
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const registry = getRegistry();
    const planProvider = registry.getPlan();

    const body = await request.json();
    const data = UpdatePlanSectionSchema.parse({ ...body, id: sectionId });

    const section = await planProvider.updateSection(data);

    // Recalculate completion
    const completion = await planProvider.calculateCompletion(id);

    return NextResponse.json({
      section,
      completion,
    });
  } catch (error) {
    console.error('Error updating plan section:', error);
    return NextResponse.json(
      { error: 'Failed to update plan section' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans/[id]/sections/[sectionId]/complete
 * Mark a section as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const registry = getRegistry();
    const planProvider = registry.getPlan();

    const section = await planProvider.markSectionComplete({
      sectionId,
      completedBy: 'current-user',
    });

    // Recalculate completion
    const completion = await planProvider.calculateCompletion(id);

    return NextResponse.json({
      section,
      completion,
    });
  } catch (error) {
    console.error('Error marking section complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark section complete' },
      { status: 500 }
    );
  }
}
