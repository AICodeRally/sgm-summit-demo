import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';

/**
 * GET /api/governance-framework/[id]
 * Get a governance framework by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();

    const framework = await frameworkProvider.findById(id);

    if (!framework) {
      return NextResponse.json(
        { error: 'Framework not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ framework });
  } catch (error) {
    console.error('Error fetching governance framework:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance framework' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/governance-framework/[id]
 * Update a governance framework
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();

    const framework = await frameworkProvider.update({
      id,
      ...body,
    });

    return NextResponse.json({ framework });
  } catch (error) {
    console.error('Error updating governance framework:', error);
    return NextResponse.json(
      { error: 'Failed to update governance framework' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/governance-framework/[id]
 * Delete a governance framework (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();

    await frameworkProvider.delete(id, 'current-user');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting governance framework:', error);
    return NextResponse.json(
      { error: 'Failed to delete governance framework' },
      { status: 500 }
    );
  }
}
