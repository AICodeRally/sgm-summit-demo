import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { UpdatePlanTemplateSchema } from '@/lib/contracts/plan-template.contract';

/**
 * GET /api/plan-templates/[id]
 *
 * Get a specific plan template by ID, including its sections.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();

    const template = await templateProvider.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get sections for this template
    const sections = await templateProvider.getSections(id);

    // Get usage stats
    const usageStats = await templateProvider.getUsageStats(id);

    return NextResponse.json(
      {
        template,
        sections,
        usageStats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/plan-templates/[id]
 *
 * Update an existing plan template.
 *
 * Body: UpdatePlanTemplate (partial)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const data = UpdatePlanTemplateSchema.parse({
      ...body,
      id,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const template = await templateProvider.update(data);

    // Create audit log
    await auditProvider.create({
      tenantId: template.tenantId,
      eventType: 'update',
      severity: 'info',
      message: `Plan template updated: ${template.name}`,
      entityType: 'plan_template',
      entityId: template.id,
      entityName: template.name,
      actorId: body.updatedBy || 'system',
      actorName: body.updatedBy || 'system',
    });

    return NextResponse.json(
      {
        template,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/plan-templates/[id]
 *
 * Delete a plan template (soft delete - sets status to ARCHIVED).
 *
 * Query params:
 * - deletedBy: User performing the deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const deletedBy = searchParams.get('deletedBy') || 'system';

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    // Get template before deletion for audit log
    const template = await templateProvider.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await templateProvider.delete(id, deletedBy);

    // Create audit log
    await auditProvider.create({
      tenantId: template.tenantId,
      eventType: 'delete',
      severity: 'warning',
      message: `Plan template deleted: ${template.name}`,
      entityType: 'plan_template',
      entityId: template.id,
      entityName: template.name,
      actorId: deletedBy,
      actorName: deletedBy,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Template deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}
