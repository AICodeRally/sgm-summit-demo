import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/gaps
 * Fetch all gap analyses for client engagement
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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const severityFilter = searchParams.get('severity');
    const statusFilter = searchParams.get('status');

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

    // Build where clause
    const where: any = { engagementId: tenant.clientEngagement.id };
    if (severityFilter) {
      where.severity = severityFilter;
    }
    if (statusFilter) {
      where.status = statusFilter;
    }

    // Fetch gaps with filters
    const gaps = await prisma.clientGapAnalysis.findMany({
      where,
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      gaps: gaps.map((g: any) => ({
        id: g.id,
        planCode: g.planCode,
        policyArea: g.policyArea,
        gapDescription: g.gapDescription,
        severity: g.severity,
        status: g.status,
        bhgPolicyRef: g.bhgPolicyRef,
        assignedTo: g.assignedTo,
        dueDate: g.dueDate?.toISOString(),
        resolvedBy: g.resolvedBy,
        resolvedAt: g.resolvedAt?.toISOString(),
        resolutionNotes: g.resolutionNotes,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[Gaps API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/[tenantSlug]/gaps
 * Create a new gap analysis entry
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

    // Only admins can create gaps
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;
    const body = await request.json();

    const {
      planCode,
      policyArea,
      gapDescription,
      severity,
      status,
      bhgPolicyRef,
      assignedTo,
      dueDate,
    } = body;

    // Validate required fields
    if (!planCode || !policyArea || !gapDescription || !severity) {
      return NextResponse.json(
        { error: 'planCode, policyArea, gapDescription, and severity are required' },
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

    // Create gap
    const gap = await prisma.clientGapAnalysis.create({
      data: {
        engagementId: tenant.clientEngagement.id,
        planCode,
        policyArea,
        gapDescription,
        severity,
        status: status || 'OPEN',
        bhgPolicyRef,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ gap }, { status: 201 });
  } catch (error: any) {
    console.error('[Gaps POST API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/[tenantSlug]/gaps
 * Update gap status (resolve, assign, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update gaps
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { gapId, status, assignedTo, resolutionNotes } = body;

    if (!gapId) {
      return NextResponse.json({ error: 'gapId is required' }, { status: 400 });
    }

    // Update gap
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

    if (status === 'RESOLVED') {
      updateData.resolvedBy = session.user.id;
      updateData.resolvedAt = new Date();
    }

    const gap = await prisma.clientGapAnalysis.update({
      where: { id: gapId },
      data: updateData,
    });

    return NextResponse.json({ gap });
  } catch (error: any) {
    console.error('[Gaps PATCH API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
