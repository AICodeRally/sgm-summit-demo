import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { GetApplicableFrameworksSchema } from '@/lib/contracts/governance-framework.contract';

/**
 * GET /api/governance-framework/applicable
 * Get frameworks applicable to a specific plan type
 *
 * Query params:
 *   - planType: COMPENSATION_PLAN | GOVERNANCE_PLAN | POLICY_CREATION_PLAN
 *   - tenantId: string
 *   - includeOptional: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const planType = searchParams.get('planType');
    const tenantId = searchParams.get('tenantId') || 'demo-tenant-001';
    const includeOptional = searchParams.get('includeOptional') !== 'false';

    if (!planType) {
      return NextResponse.json(
        { error: 'planType is required' },
        { status: 400 }
      );
    }

    // Validate input
    const data = GetApplicableFrameworksSchema.parse({
      planType,
      tenantId,
      includeOptional,
    });

    // Get provider and fetch applicable frameworks
    const registry = getRegistry();
    const frameworkProvider = registry.getGovernanceFramework();
    const applicableFrameworks = await frameworkProvider.getApplicableFrameworks(data);

    // Separate mandatory and optional
    const mandatory = applicableFrameworks.filter(f => f.mandatoryCompliance);
    const optional = applicableFrameworks.filter(f => !f.mandatoryCompliance);

    return NextResponse.json({
      frameworks: applicableFrameworks,
      meta: {
        total: applicableFrameworks.length,
        mandatory: mandatory.length,
        optional: optional.length,
        planType,
      },
    });
  } catch (error) {
    console.error('Error fetching applicable frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicable frameworks' },
      { status: 500 }
    );
  }
}
