import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings';
import { PolicyFiltersSchema, CreatePolicySchema } from '@/lib/contracts/policy.contract';

/**
 * GET /api/sgm/policies
 *
 * Query policies with optional filters.
 *
 * Query params:
 * - tenantId: Filter by tenant (default: demo-tenant-001)
 * - status: Filter by status (draft | published | superseded | retired)
 * - category: Filter by category
 * - search: Full-text search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters = PolicyFiltersSchema.parse({
      tenantId: searchParams.get('tenantId') || 'demo-tenant-001',
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const registry = getRegistry();
    const policyProvider = registry.getPolicy();

    const policies = await policyProvider.findAll(filters);

    // Get counts by status
    const countsByStatus = await policyProvider.countByStatus(filters.tenantId!);

    return NextResponse.json(
      {
        policies,
        meta: {
          total: policies.length,
          countsByStatus,
          filters,
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
 * POST /api/sgm/policies
 *
 * Create a new policy.
 *
 * Body: CreatePolicy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const data = CreatePolicySchema.parse(body);

    const registry = getRegistry();
    const policyProvider = registry.getPolicy();
    const auditProvider = registry.getAudit();

    const policy = await policyProvider.create(data);

    // Create audit log
    await auditProvider.create({
      tenantId: policy.tenantId,
      eventType: 'create',
      severity: 'info',
      message: `Policy created: ${policy.name}`,
      entityType: 'policy',
      entityId: policy.id,
      entityName: policy.name,
      actorId: data.createdBy,
      actorName: 'Demo User',
    });

    return NextResponse.json(
      {
        policy,
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
