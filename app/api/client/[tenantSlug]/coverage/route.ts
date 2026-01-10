import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/coverage
 * Fetch policy coverage matrix data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantSlug } = await params;

    // Find tenant with engagement
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { clientEngagement: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Validate access
    const hasAccess =
      session.user.tenantId === tenant.id ||
      session.user.role === 'SUPER_ADMIN' ||
      session.user.role === 'ADMIN';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!tenant.clientEngagement) {
      return NextResponse.json(
        { error: 'No client engagement found' },
        { status: 404 }
      );
    }

    // Fetch all plan analyses with policy coverage details
    const plans = await prisma.clientPlanAnalysis.findMany({
      where: { engagementId: tenant.clientEngagement.id },
      orderBy: { planCode: 'asc' },
    });

    // Extract all unique policy areas from all plans
    const policyAreasSet = new Set<string>();
    plans.forEach((plan: any) => {
      const coverage = plan.policyCoverage as any;
      if (coverage && typeof coverage === 'object') {
        // Assuming policyCoverage is an array of policy objects
        if (Array.isArray(coverage)) {
          coverage.forEach((policy: any) => {
            if (policy.policyArea) {
              policyAreasSet.add(policy.policyArea);
            }
          });
        } else if (coverage.policies && Array.isArray(coverage.policies)) {
          coverage.policies.forEach((policy: any) => {
            if (policy.policyArea) {
              policyAreasSet.add(policy.policyArea);
            }
          });
        }
      }
    });

    // Convert to sorted array
    const policyAreas = Array.from(policyAreasSet).sort();

    // If no policy areas found, use default set
    if (policyAreas.length === 0) {
      policyAreas.push(
        'SGCC Approval Authority',
        'CRB Review Process',
        'Territory Management',
        'Windfall Deal Procedures',
        'Commission Dispute Resolution',
        'Plan Documentation',
        'Audit Trail Requirements',
        'Approval Workflows',
        'Exception Handling',
        'Compliance Monitoring',
        'Data Retention',
        'System Access Controls'
      );
    }

    // Format plans with policy coverage
    const formattedPlans = plans.map((plan: any) => {
      const coverage = plan.policyCoverage as any;
      let policies: any[] = [];

      // Parse policyCoverage JSON structure
      if (coverage) {
        if (Array.isArray(coverage)) {
          policies = coverage;
        } else if (coverage.policies && Array.isArray(coverage.policies)) {
          policies = coverage.policies;
        }
      }

      // Ensure all policy areas are represented
      const policiesMap = new Map(
        policies.map((p: any) => [p.policyArea, p])
      );

      const completePolicies = policyAreas.map((area: string) => {
        const existing = policiesMap.get(area);
        return existing || {
          policyArea: area,
          policyName: `${area} Policy`,
          coverage: 'NO' as const,
          notes: 'Not yet assessed',
        };
      });

      return {
        planCode: plan.planCode,
        planName: plan.planName,
        policies: completePolicies,
      };
    });

    return NextResponse.json({
      plans: formattedPlans,
      policyAreas,
    });
  } catch (error: any) {
    console.error('[Coverage API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
