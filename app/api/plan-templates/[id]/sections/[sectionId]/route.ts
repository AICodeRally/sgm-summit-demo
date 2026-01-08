import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { UpdateTemplateSectionSchema } from '@/lib/contracts/template-section.contract';

/**
 * GET /api/plan-templates/[id]/sections/[sectionId]
 *
 * Get a specific section.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();

    const section = await templateProvider.getSection(sectionId);

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        section,
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
 * PUT /api/plan-templates/[id]/sections/[sectionId]
 *
 * Update a template section.
 *
 * Body: UpdateTemplateSection (partial)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const body = await request.json();

    // Validate with Zod
    const data = UpdateTemplateSectionSchema.parse({
      ...body,
      id: sectionId,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const section = await templateProvider.updateSection(data);

    // Get template for audit log
    const template = await templateProvider.findById(id);

    if (template) {
      // Create audit log
      await auditProvider.create({
        tenantId: template.tenantId,
        eventType: 'update',
        severity: 'info',
        message: `Template section updated: ${section.title}`,
        entityType: 'plan_template',
        entityId: template.id,
        entityName: template.name,
        actorId: 'system',
        actorName: 'system',
      });
    }

    return NextResponse.json(
      {
        section,
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
 * DELETE /api/plan-templates/[id]/sections/[sectionId]
 *
 * Delete a template section.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    // Get section before deletion for audit log
    const section = await templateProvider.getSection(sectionId);

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    await templateProvider.deleteSection(sectionId);

    // Get template for audit log
    const template = await templateProvider.findById(id);

    if (template) {
      // Create audit log
      await auditProvider.create({
        tenantId: template.tenantId,
        eventType: 'delete',
        severity: 'warning',
        message: `Template section deleted: ${section.title}`,
        entityType: 'plan_template',
        entityId: template.id,
        entityName: template.name,
        actorId: 'system',
        actorName: 'system',
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Section deleted successfully',
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
