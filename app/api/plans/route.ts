import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { CreatePlanSchema, PlanFiltersSchema } from '@/lib/contracts/plan.contract';

/**
 * GET /api/plans
 * List all plans with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const registry = getRegistry();
    const planProvider = registry.getPlan();

    const searchParams = request.nextUrl.searchParams;
    const filters = PlanFiltersSchema.parse({
      tenantId: searchParams.get('tenantId') || undefined,
      planType: searchParams.get('planType') || undefined,
      status: searchParams.get('status') || undefined,
      owner: searchParams.get('owner') || undefined,
      createdFromTemplateId: searchParams.get('createdFromTemplateId') || undefined,
    });

    const plans = await planProvider.findAll(filters);

    // Get statistics
    const tenantId = filters?.tenantId || 'demo-tenant-001';
    const countsByStatus = await planProvider.countByStatus(tenantId);
    const countsByType = await planProvider.countByType(tenantId);

    return NextResponse.json({
      plans,
      statistics: {
        total: plans.length,
        byStatus: countsByStatus,
        byType: countsByType,
      },
      dataType: 'demo' as const,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans
 * Create a new plan from scratch
 */
export async function POST(request: NextRequest) {
  try {
    const registry = getRegistry();
    const planProvider = registry.getPlan();

    const body = await request.json();
    const data = CreatePlanSchema.parse(body);

    const plan = await planProvider.create(data);

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
