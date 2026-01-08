import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { ClonePlanTemplateSchema } from '@/lib/contracts/plan-template.contract';

/**
 * POST /api/plan-templates/[id]/clone
 *
 * Clone an existing plan template.
 *
 * Body: ClonePlanTemplate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const data = ClonePlanTemplateSchema.parse({
      ...body,
      sourceTemplateId: id,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const clonedTemplate = await templateProvider.clone(data);

    // Create audit log
    await auditProvider.create({
      tenantId: clonedTemplate.tenantId,
      eventType: 'create',
      severity: 'info',
      message: `Plan template cloned: ${clonedTemplate.name} (from ${id})`,
      entityType: 'plan_template',
      entityId: clonedTemplate.id,
      entityName: clonedTemplate.name,
      actorId: data.clonedBy,
      actorName: data.clonedBy,
    });

    return NextResponse.json(
      {
        template: clonedTemplate,
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
