import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { UpdatePlanTemplateSchema } from '@/lib/contracts/plan-template.contract';
import { requireActor } from '@/lib/security/actor';
import { requireTenantContext } from '@/lib/security/require-tenant';
import { requireRole } from '@/lib/security/roles';
import { SecurityError, isSecurityError } from '@/lib/security/errors';

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
    const actor = requireTenantContext(await requireActor());
    const { id } = await params;
    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();

    const template = await templateProvider.findById(id);

    if (!template || template.tenantId !== actor.tenantId) {
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
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
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
    const actor = requireTenantContext(await requireActor());
    requireRole(actor, ['SUPER_ADMIN', 'ADMIN', 'GOVERNANCE']);
    const { id } = await params;
    const body = await request.json();

    if (body.tenantId && body.tenantId !== actor.tenantId) {
      throw new SecurityError(403, 'forbidden', 'Tenant mismatch');
    }

    // Validate with Zod
    const data = UpdatePlanTemplateSchema.parse({
      ...body,
      id,
      tenantId: actor.tenantId,
    });

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    const existing = await templateProvider.findById(id);
    if (!existing || existing.tenantId !== actor.tenantId) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

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
      actorId: actor.userId,
      actorName: actor.userId,
    });

    return NextResponse.json(
      {
        template,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
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
    const actor = requireTenantContext(await requireActor());
    requireRole(actor, ['SUPER_ADMIN', 'ADMIN', 'GOVERNANCE']);
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const deletedBy = searchParams.get('deletedBy') || actor.userId;

    const registry = getRegistry();
    const templateProvider = registry.getPlanTemplate();
    const auditProvider = registry.getAudit();

    // Get template before deletion for audit log
    const template = await templateProvider.findById(id);

    if (!template || template.tenantId !== actor.tenantId) {
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
    if (isSecurityError(error)) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined,
      },
      { status: 400 }
    );
  }
}
