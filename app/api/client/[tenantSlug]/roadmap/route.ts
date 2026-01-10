import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/roadmap
 * Fetch implementation roadmap phases
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

    // Fetch roadmap phases
    const phases = await prisma.clientRoadmapPhase.findMany({
      where: { engagementId: tenant.clientEngagement.id },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({
      phases: phases.map((p: any) => ({
        id: p.id,
        phase: p.phase,
        title: p.title,
        description: p.description,
        status: p.status,
        completionPct: p.completionPct,
        milestones: p.milestones,
        startDate: p.startDate?.toISOString(),
        targetEndDate: p.targetEndDate?.toISOString(),
        actualEndDate: p.actualEndDate?.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[Roadmap API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/[tenantSlug]/roadmap
 * Create a new roadmap phase
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

    // Only admins can create phases
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;
    const body = await request.json();

    const {
      phase,
      title,
      description,
      orderIndex,
      milestones,
      status,
      startDate,
      targetEndDate,
    } = body;

    // Validate required fields
    if (!phase || !title || orderIndex === undefined) {
      return NextResponse.json(
        { error: 'phase, title, and orderIndex are required' },
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

    // Create phase
    const roadmapPhase = await prisma.clientRoadmapPhase.create({
      data: {
        engagementId: tenant.clientEngagement.id,
        phase,
        title,
        description,
        orderIndex,
        milestones: milestones || [],
        status: status || 'NOT_STARTED',
        completionPct: 0,
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
      },
    });

    return NextResponse.json({ phase: roadmapPhase }, { status: 201 });
  } catch (error: any) {
    console.error('[Roadmap POST API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/[tenantSlug]/roadmap
 * Update roadmap phase progress
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

    // Only admins can update phases
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { phaseId, status, completionPct, milestones, actualEndDate } = body;

    if (!phaseId) {
      return NextResponse.json({ error: 'phaseId is required' }, { status: 400 });
    }

    // Update phase
    const updateData: any = {};
    if (status) updateData.status = status;
    if (completionPct !== undefined) updateData.completionPct = completionPct;
    if (milestones) updateData.milestones = milestones;
    if (actualEndDate) updateData.actualEndDate = new Date(actualEndDate);

    const phase = await prisma.clientRoadmapPhase.update({
      where: { id: phaseId },
      data: updateData,
    });

    return NextResponse.json({ phase });
  } catch (error: any) {
    console.error('[Roadmap PATCH API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
