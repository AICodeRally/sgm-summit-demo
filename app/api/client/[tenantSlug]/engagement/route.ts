import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/client/[tenantSlug]/engagement
 * Fetch client engagement details
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

    const engagement = tenant.clientEngagement;

    return NextResponse.json({
      engagement: {
        id: engagement.id,
        tenantId: engagement.tenantId,
        type: engagement.type,
        status: engagement.status,
        startDate: engagement.startDate.toISOString(),
        targetEndDate: engagement.targetEndDate?.toISOString(),
        actualEndDate: engagement.actualEndDate?.toISOString(),
        consultantTeam: engagement.consultantTeam,
        clientContacts: engagement.clientContacts,
        brandingConfig: engagement.brandingConfig,
        metadata: engagement.metadata,
        createdAt: engagement.createdAt.toISOString(),
        updatedAt: engagement.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Engagement GET API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/[tenantSlug]/engagement
 * Create a new client engagement
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

    // Only admins can create engagements
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;
    const body = await request.json();

    const {
      type,
      status,
      startDate,
      targetEndDate,
      consultantTeam,
      clientContacts,
      brandingConfig,
    } = body;

    // Validate required fields
    if (!type || !startDate) {
      return NextResponse.json(
        { error: 'type and startDate are required' },
        { status: 400 }
      );
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { clientEngagement: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if engagement already exists
    if (tenant.clientEngagement) {
      return NextResponse.json(
        { error: 'Client engagement already exists for this tenant' },
        { status: 400 }
      );
    }

    // Validate tenant tier
    if (tenant.tier !== 'BETA' && tenant.tier !== 'PRODUCTION') {
      return NextResponse.json(
        { error: 'Client engagements only available for BETA/PRODUCTION tiers' },
        { status: 400 }
      );
    }

    // Create engagement
    const engagement = await prisma.clientEngagement.create({
      data: {
        tenantId: tenant.id,
        type,
        status: status || 'ACTIVE',
        startDate: new Date(startDate),
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        consultantTeam: consultantTeam || [],
        clientContacts: clientContacts || [],
        brandingConfig: brandingConfig || {},
      },
    });

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error: any) {
    console.error('[Engagement POST API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/[tenantSlug]/engagement
 * Update client engagement
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

    // Only admins can update engagements
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;
    const body = await request.json();

    const {
      status,
      targetEndDate,
      actualEndDate,
      consultantTeam,
      clientContacts,
      brandingConfig,
    } = body;

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

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (targetEndDate) updateData.targetEndDate = new Date(targetEndDate);
    if (actualEndDate) updateData.actualEndDate = new Date(actualEndDate);
    if (consultantTeam) updateData.consultantTeam = consultantTeam;
    if (clientContacts) updateData.clientContacts = clientContacts;
    if (brandingConfig) updateData.brandingConfig = brandingConfig;

    // Update engagement
    const engagement = await prisma.clientEngagement.update({
      where: { id: tenant.clientEngagement.id },
      data: updateData,
    });

    return NextResponse.json({ engagement });
  } catch (error: any) {
    console.error('[Engagement PATCH API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/client/[tenantSlug]/engagement
 * Delete client engagement and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins can delete engagements
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { tenantSlug } = await params;

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

    // Delete engagement (cascade will delete related plans, gaps, roadmap phases)
    await prisma.clientEngagement.delete({
      where: { id: tenant.clientEngagement.id },
    });

    return NextResponse.json({ message: 'Engagement deleted successfully' });
  } catch (error: any) {
    console.error('[Engagement DELETE API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
