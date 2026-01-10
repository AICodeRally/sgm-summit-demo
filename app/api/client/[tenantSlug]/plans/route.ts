import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/plans
 * Fetch all plan analyses for client engagement
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

    // Fetch all plan analyses
    const plans = await prisma.clientPlanAnalysis.findMany({
      where: { engagementId: tenant.clientEngagement.id },
      orderBy: { riskScore: 'desc' },
    });

    return NextResponse.json({
      plans: plans.map((p: any) => ({
        id: p.id,
        planCode: p.planCode,
        planName: p.planName,
        planType: p.planType,
        businessUnit: p.businessUnit,
        coverageFull: p.coverageFull,
        coverageLimited: p.coverageLimited,
        coverageNo: p.coverageNo,
        riskScore: p.riskScore,
        policyCoverage: p.policyCoverage,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[Plans API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/[tenantSlug]/plans
 * Create or update a plan analysis
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create/update plan analyses
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;
    const body = await request.json();

    const {
      planCode,
      planName,
      planType,
      businessUnit,
      coverageFull,
      coverageLimited,
      coverageNo,
      riskScore,
      policyCoverage,
    } = body;

    // Validate required fields
    if (!planCode || !planName) {
      return NextResponse.json(
        { error: 'planCode and planName are required' },
        { status: 400 }
      );
    }

    // Find tenant with engagement
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { clientEngagement: true },
    });

    if (!tenant || !tenant.clientEngagement) {
      return NextResponse.json(
        { error: 'Tenant or engagement not found' },
        { status: 404 }
      );
    }

    // Upsert plan analysis
    const plan = await prisma.clientPlanAnalysis.upsert({
      where: {
        engagementId_planCode: {
          engagementId: tenant.clientEngagement.id,
          planCode,
        },
      },
      update: {
        planName,
        planType,
        businessUnit,
        coverageFull: coverageFull || 0,
        coverageLimited: coverageLimited || 0,
        coverageNo: coverageNo || 0,
        riskScore: riskScore || 0,
        policyCoverage: policyCoverage || {},
      },
      create: {
        engagementId: tenant.clientEngagement.id,
        planCode,
        planName,
        planType,
        businessUnit,
        coverageFull: coverageFull || 0,
        coverageLimited: coverageLimited || 0,
        coverageNo: coverageNo || 0,
        riskScore: riskScore || 0,
        policyCoverage: policyCoverage || {},
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error: any) {
    console.error('[Plans POST API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
