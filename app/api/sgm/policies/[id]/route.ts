import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { UpdatePolicySchema } from '@/lib/contracts/policy.contract';

/**
 * GET /api/sgm/policies/[id]
 *
 * Get policy by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registry = getRegistry();
    const policyProvider = registry.getPolicy();

    const policy = await policyProvider.findById(id);

    if (!policy) {
      return NextResponse.json(
        { error: `Policy ${id} not found` },
        { status: 404 }
      );
    }

    // Get audit logs for this policy
    const auditProvider = registry.getAudit();
    const auditLogs = await auditProvider.findByEntity('policy', id);

    // Get links for this policy
    const linkProvider = registry.getLink();
    const links = await linkProvider.findFromSource('policy', id);

    return NextResponse.json(
      {
        policy,
        auditLogs,
        links,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/sgm/policies/[id]
 *
 * Update policy.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const data = UpdatePolicySchema.parse({ ...body, id });

    const registry = getRegistry();
    const policyProvider = registry.getPolicy();
    const auditProvider = registry.getAudit();

    const policy = await policyProvider.update(data);

    // Create audit log
    await auditProvider.create({
      tenantId: policy.tenantId,
      eventType: 'update',
      severity: 'info',
      message: `Policy updated: ${policy.name}`,
      entityType: 'policy',
      entityId: policy.id,
      entityName: policy.name,
      actorId: data.updatedBy!,
      actorName: 'Demo User',
      changesAfter: data,
    });

    return NextResponse.json({ policy }, { status: 200 });
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
 * DELETE /api/sgm/policies/[id]
 *
 * Delete policy.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedBy = request.nextUrl.searchParams.get('deletedBy') || 'system';

    const registry = getRegistry();
    const policyProvider = registry.getPolicy();
    const auditProvider = registry.getAudit();

    // Get policy first for audit log
    const policy = await policyProvider.findById(id);
    if (!policy) {
      return NextResponse.json(
        { error: `Policy ${id} not found` },
        { status: 404 }
      );
    }

    await policyProvider.delete(id, deletedBy);

    // Create audit log
    await auditProvider.create({
      tenantId: policy.tenantId,
      eventType: 'delete',
      severity: 'warning',
      message: `Policy deleted: ${policy.name}`,
      entityType: 'policy',
      entityId: policy.id,
      entityName: policy.name,
      actorId: deletedBy,
      actorName: 'Demo User',
    });

    return NextResponse.json(
      { message: 'Policy deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
