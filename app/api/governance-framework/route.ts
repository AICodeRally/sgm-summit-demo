import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { GovernanceFrameworkFiltersSchema } from '@/lib/contracts/governance-framework.contract';

/**
 * GET /api/governance-framework
 * List governance frameworks with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query params
    const filters: any = {};

    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const applicableTo = searchParams.get('applicableTo');
    const isMandatory = searchParams.get('isMandatory');
    const isGlobal = searchParams.get('isGlobal');
    const search = searchParams.get('search');

    if (tenantId) filters.tenantId = tenantId;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (applicableTo) filters.applicableTo = applicableTo;
    if (isMandatory !== null) filters.isMandatory = isMandatory === 'true';
    if (isGlobal !== null) filters.isGlobal = isGlobal === 'true';
    if (search) filters.search = search;

    // Validate filters
    const validatedFilters = GovernanceFrameworkFiltersSchema.parse(filters);

    // Get provider and fetch frameworks
    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();
    const frameworks = await frameworkProvider.findAll(validatedFilters);

    // Get statistics
    const tenantIdForStats = filters?.tenantId || 'demo-tenant-001';
    const countsByCategory = await frameworkProvider.countByCategory(tenantIdForStats);
    const countsByStatus = await frameworkProvider.countByStatus(tenantIdForStats);

    return NextResponse.json({
      frameworks,
      meta: {
        total: frameworks.length,
        countsByCategory,
        countsByStatus,
        filters: validatedFilters,
      },
    });
  } catch (error) {
    console.error('Error fetching governance frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance frameworks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/governance-framework
 * Create a new governance framework
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();

    const framework = await frameworkProvider.create(body);

    return NextResponse.json({ framework }, { status: 201 });
  } catch (error) {
    console.error('Error creating governance framework:', error);
    return NextResponse.json(
      { error: 'Failed to create governance framework' },
      { status: 500 }
    );
  }
}
