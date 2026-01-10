import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/policies
 * Fetch policy recommendations based on gap analysis
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

    // Fetch all gaps to generate recommendations
    const gaps = await prisma.clientGapAnalysis.findMany({
      where: {
        engagementId: tenant.clientEngagement.id,
        status: { in: ['OPEN', 'PLANNED'] },
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    // Generate recommendations from gaps
    // Group gaps by policy area and create recommendations
    const policyMap = new Map<string, any>();

    gaps.forEach((gap: any) => {
      const key = gap.bhgPolicyRef || gap.policyArea;

      if (!policyMap.has(key)) {
        // Determine priority based on severity and number of gaps
        const priority = gap.severity;

        policyMap.set(key, {
          id: gap.id,
          policyCode: gap.bhgPolicyRef || `POL-${gap.policyArea.substring(0, 3).toUpperCase()}`,
          policyName: `${gap.policyArea} Governance Policy`,
          category: gap.policyArea,
          priority,
          rationale: gap.gapDescription,
          impactedPlans: [gap.planCode],
          bhgReference: gap.bhgPolicyRef,
        });
      } else {
        // Add to impacted plans if not already there
        const existing = policyMap.get(key);
        if (!existing.impactedPlans.includes(gap.planCode)) {
          existing.impactedPlans.push(gap.planCode);
        }

        // Elevate priority if this gap is more severe
        const severityOrder: Record<string, number> = {
          'CRITICAL': 0,
          'HIGH': 1,
          'MEDIUM': 2,
          'LOW': 3,
        };
        if (severityOrder[gap.severity] < severityOrder[existing.priority]) {
          existing.priority = gap.severity;
        }
      }
    });

    const recommendations = Array.from(policyMap.values());

    // If no gaps, fetch BHG best practices from policy library
    if (recommendations.length === 0) {
      // Fetch published policies marked as BHG best practices
      const bhgPolicies = await prisma.policy.findMany({
        where: {
          status: 'published',
          category: { in: ['SGCC', 'CRB', 'Territory', 'Windfall', 'Dispute', 'Audit'] },
        },
        take: 10,
        orderBy: { effectiveDate: 'desc' },
      });

      return NextResponse.json({
        recommendations: bhgPolicies.map((policy: any, index: number) => ({
          id: policy.id,
          policyCode: `BHG-POL-${String(index + 1).padStart(3, '0')}`,
          policyName: policy.name,
          category: policy.category || 'General',
          priority: 'MEDIUM' as const,
          rationale: policy.description || 'Best practice policy recommended for implementation',
          impactedPlans: [],
          bhgReference: policy.id,
        })),
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('[Policies API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
