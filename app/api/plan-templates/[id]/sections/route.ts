import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { CreateTemplateSectionSchema } from '@/lib/contracts/template-section.contract';

/**
 * GET /api/plan-templates/[id]/sections
 *
 * Get all sections for a template.
 *
 * Query params:
 * - tree: Return as tree structure (true | false, default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const asTree = searchParams.get('tree') === 'true';

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();

    const sections = asTree
      ? await templateProvider.getSectionTree(id)
      : await templateProvider.getSections(id);

    return NextResponse.json(
      {
        sections,
        meta: {
          total: Array.isArray(sections) ? sections.length : 0,
          templateId: id,
          asTree,
        },
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
 * POST /api/plan-templates/[id]/sections
 *
 * Add a new section to a template.
 *
 * Body: CreateTemplateSection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const data = CreateTemplateSectionSchema.parse({
      ...body,
      templateId: id,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const section = await templateProvider.addSection(data);

    // Get template for audit log
    const template = await templateProvider.findById(id);

    if (template) {
      // Create audit log
      await auditProvider.create({
        tenantId: template.tenantId,
        eventType: 'update',
        severity: 'info',
        message: `Section added to template: ${section.title}`,
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
      { status: 201 }
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
